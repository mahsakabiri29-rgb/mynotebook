@echo off
chcp 65001 >nul
title Dafterche Elmi - Local Site

echo.
echo  === شروع سایت و ناظر کشویی ===
echo  سایت:      http://localhost:4321
echo  کشویی:     فایل را در پوشهٔ inbox بیندازید
echo  توقف:      هر دو پنجره را ببندید (یا Ctrl+C)
echo.

cd /d "%~dp0"

start "Site (localhost:4321)" cmd /k "npm run dev"
timeout /t 2 >nul
start "Inbox Watcher" cmd /k "npm run inbox"

echo  دو پنجره باز شد. این پنجره را می‌توانید ببندید.
timeout /t 3 >nul
