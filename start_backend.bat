@echo off
title UTAAM Medical Backend
cd /d "%~dp0backend"
echo ==========================================
echo Starting UTAAM Medical Spring Boot Backend
echo Database: PostgreSQL (uttammed) on port 5432
echo Port: 8086
echo ==========================================
"C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
pause

