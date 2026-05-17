const express = require('express');
const fs = require('fs-extra');
const multer = require('multer');
const os = require('os');
const path = require('path');

const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const CONFIG_FILE = './config.json';
const POSTS_FILE = './posts.json';

// 加载配置
function loadConfig() {
    if (fs.pathExistsSync(CONFIG_FILE)) {
        return fs.readJsonSync(CONFIG_FILE);
    }
    return { port: 25565, key: '', nickname: 'User', avatar: 'uploads/default/default.jpg', cover: '', bg: '' };
}

// 加载帖子
function loadPostsFile() {
    if (fs.pathExistsSync(POSTS_FILE)) {
        return fs.readJsonSync(POSTS_FILE);
    }
    return [];
}

// 保存配置
async function saveConfig() {
    await fs.writeJson(CONFIG_FILE, db, { spaces: 2 });
}

// 保存帖子
async function savePosts() {
    await fs.writeJson(POSTS_FILE, posts, { spaces: 2 });
}

let db = loadConfig();
let posts = loadPostsFile();

// 禁止配置文件被外部访问
app.use((req, res, next) => {
    if (req.path === '/config.json' || req.path === '/posts.json') {
        return res.status(403).json({ error: '禁止访问' });
    }
    next();
});

// 初始化
async function init() {
    await fs.ensureDir('uploads/default');
    if (!db.avatar) db.avatar = 'uploads/default/default.jpg';
    if (!Array.isArray(posts)) posts = [];
    await saveConfig();
    await savePosts();
}

// 帖子图片上传
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => { fs.ensureDirSync('uploads'); cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const uploadMultiple = multer({ storage: postStorage, limits: { fileSize: 20 * 1024 * 1024 } }).any();

// 设置图片上传
const settingsStorage = multer.diskStorage({
    destination: (req, file, cb) => { fs.ensureDirSync('uploads'); cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, 'settings_' + Date.now() + path.extname(file.originalname)); }
});
const uploadSettingsImg = multer({ storage: settingsStorage, limits: { fileSize: 10 * 1024 * 1024 } }).single('image');

// ---- 配置 API ----
app.get('/api/config', async (req, res) => {
    const { key, ...safeConfig } = db;
    safeConfig.hasKey = !!key;
    safeConfig.port = db.port || 25565;
    res.json(safeConfig);
});

app.post('/api/config', async (req, res) => {
    const { nickname, avatar, cover, bg, port, key } = req.body;
    if (nickname !== undefined) db.nickname = nickname;
    if (avatar !== undefined) db.avatar = avatar;
    if (cover !== undefined) db.cover = cover;
    if (bg !== undefined) db.bg = bg;
    if (port !== undefined) db.port = parseInt(port) || 25565;
    if (key !== undefined) db.key = key;
    await saveConfig();
    res.json({ success: true });
});

// ---- 设置图片上传 ----
app.post('/api/upload-settings', (req, res) => {
    uploadSettingsImg(req, res, async (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!req.file) return res.status(400).json({ success: false, error: '未选择文件' });
        const filePath = '/uploads/' + req.file.filename;
        res.json({ success: true, path: filePath });
    });
});

// ---- 验证密钥 ----
app.post('/api/verify-key', async (req, res) => {
    if (String(req.body.key) === String(db.key)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// ---- 帖子 API ----
app.get('/api/posts', async (req, res) => {
    res.json(posts || []);
});

app.post('/api/post', async (req, res) => {
    uploadMultiple(req, res, async (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        const imageUrls = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
        const newPost = {
            id: Date.now(),
            text: req.body.text,
            link: req.body.link || null,
            images: imageUrls,
            time: new Date().toLocaleString()
        };
        posts.unshift(newPost);
        await savePosts();
        res.json({ success: true });
    });
});

app.delete('/api/post/:id', async (req, res) => {
    posts = posts.filter(p => p.id !== parseInt(req.params.id));
    await savePosts();
    res.json({ success: true });
});

app.use(express.static('./'));

function getLocalIPs() {
    const ifaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(ifaces)) {
        if (!ifaces[name]) continue;
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

init().then(() => {
    const port = db.port || 25565;
    app.listen(port, () => {
        console.log('Moments 已启动');
        const ips = getLocalIPs();
        ips.forEach(ip => console.log('  网址:   http://' + ip + ':' + port));
        if (ips.length === 0) console.log('  (未检测到公网 IP，如使用反向代理请忽略)');
    });
});
