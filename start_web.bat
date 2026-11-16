@echo off
title UTAAM Medical Web
cd /d "%~dp0web"
echo ==========================================
echo Starting UTAAM Medical Web Frontend (Vite)
echo Admin: http://localhost:5173
echo Store: http://localhost:5173/store.html
echo ==========================================
npm run dev
pause

