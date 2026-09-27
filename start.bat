@echo off
chcp 65001 > nul
echo ========================================================
echo        تشغيل موقع حضور وغياب اجتماع إعدادي
echo ========================================================
echo جاري فتح الموقع في المتصفح...

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node server.js
) else (
    start index.html
)
pause
