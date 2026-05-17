const fs = require('fs-extra');
const path = require('path');

const CONFIG_FILE = './config.json';
const POSTS_FILE = './posts.json';
const UPLOADS_DIR = './uploads';

const defaultConfig = {
  port: 25565,
  key: '',
  nickname: 'User',
  avatar: 'uploads/default/default.jpg',
  cover: '',
  bg: ''
};

async function reset() {
  // 清理上传文件（保留 default 目录）
  const entries = await fs.readdir(UPLOADS_DIR);
  for (const entry of entries) {
    const full = path.join(UPLOADS_DIR, entry);
    if (entry === 'default') continue;
    await fs.remove(full);
  }

  // 重置配置文件
  await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });

  // 重置帖子
  await fs.writeJson(POSTS_FILE, [], { spaces: 2 });

  console.log('已重置为初始状态');
}

reset().catch(err => {
  console.error('重置失败:', err.message);
  process.exit(1);
});
