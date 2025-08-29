@echo off
echo 🔨 Building DuoProfits...
echo ==========================

REM Verificar que Next.js esté instalado
if not exist "node_modules\.bin\next.cmd" (
    echo ❌ Error: Next.js no está instalado. Ejecuta 'npm install' primero.
    pause
    exit /b 1
)

echo ✅ Next.js encontrado
echo 🚀 Iniciando build...

REM Ejecutar el build directamente
node_modules\.bin\next.cmd build

if %errorlevel% equ 0 (
    echo ✅ Build completado exitosamente
) else (
    echo ❌ Error en el build
    pause
    exit /b 1
)

pause
