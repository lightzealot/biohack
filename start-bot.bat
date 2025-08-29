@echo off
echo 🤖 Iniciando Bot de Telegram - DuoProfits
echo ========================================

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo 🚀 Iniciando bot...

REM Ejecutar el bot
npm run bot

pause
