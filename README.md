# Moments

仿微信朋友圈风格的私人动态发布站点。给自己一个安静的空间，记录文字与图片。

## 功能

- 支持发布文字 + 多图动态
- 自定义昵称、头像、封面图、窗口背景
- 可设置访问密钥
- 目前仅支持 Spotify 音乐链接

## 技术栈

- 后端：Node.js + Express
- 图片上传：Multer
- 数据存储：JSON 文件
- 前端：原生 HTML/CSS/JS，无框架

## 快速开始

### 前置要求

[Node.js](https://nodejs.org/) 18+

### 启动

**macOS：**

双击 `start.command`（或终端执行 `./start.sh`）

**Linux：**

```bash
chmod +x start.sh
./start.sh
```

**Windows：**

双击 `start.bat`

**手动启动：**

```bash
npm install
node server.js
```

启动后会自动打开浏览器。终端会显示实际访问地址。

## 配置

编辑项目根目录下的 `config.json`：

```json
{
    "port": 25565,                              // 服务器端口
    "key": "",                                  // 访问密钥（留空则无需验证）
    "nickname": "User",                          // 用户昵称
    "avatar": "uploads/default/default.jpg",     // 头像路径
    "cover": "",                                 // 封面图片路径
    "bg": ""                                    // 窗口背景图片路径
}
```

修改端口后需重启服务器。头像、封面、背景也可在页面设置中直接上传修改。

## 重置

将服务器恢复到初始状态（清空帖子、还原默认配置、清理上传图片）：

```bash
node reset.js
```

执行后会保留默认头像，其余上传文件全部删除。