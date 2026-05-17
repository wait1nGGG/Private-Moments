@echo off
chcp 65001 >nul

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载: https://nodejs.org/
    pause
    exit /b 1
)

cd /d "%~dp0"

if not exist "node_modules\" (
    echo 正在安装依赖...
    call npm install && echo.
)

for /f "delims=" %%i in ('node -e "try{console.log((require('./config.json').port||25565))}catch(e){console.log(25565)}"') do set PORT=%%i

echo 服务启动中...
echo 按 Ctrl+C 停止服务器
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%"

node server.js

pause
