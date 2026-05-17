#!/bin/bash

if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js"
    echo "下载: https://nodejs.org/"
    read -p "按回车键退出..."
    exit 1
fi

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install && echo ""
fi

PORT=$(node -e "try{console.log(require('./config.json').port||25565)}catch(e){console.log(25565)}")

echo "服务启动中..."
echo "Ctrl+C 停止服务器"
echo ""

(sleep 2 && open "http://localhost:$PORT") &

node server.js
