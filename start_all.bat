@echo off
title UTAAM Medical Starter
echo ==========================================
echo Starting UTAAM Medical Services...
echo ==========================================
start "UTAAM Medical Backend" cmd.exe /k "%~dp0start_backend.bat"
start "UTAAM Medical Web" cmd.exe /k "%~dp0start_web.bat"
echo.
echo Both services have been launched in separate windows!
echo - Backend:        http://localhost:8086
echo - Admin Portal:   http://localhost:5173
echo - Customer Store: http://localhost:5173/store.html
echo ==========================================

