#!/bin/bash

echo "🔨 Building DuoProfits..."
echo "=========================="

# Verificar que Next.js esté instalado
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ Error: Next.js no está instalado. Ejecuta 'npm install' primero."
    exit 1
fi

echo "✅ Next.js encontrado"
echo "🚀 Iniciando build..."

# Ejecutar el build directamente
./node_modules/.bin/next build

if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente"
else
    echo "❌ Error en el build"
    exit 1
fi
