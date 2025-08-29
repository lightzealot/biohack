#!/bin/bash

echo "🤖 Iniciando Bot de Telegram - DuoProfits"
echo "========================================"

# Verificar que las variables de entorno estén configuradas
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Error: TELEGRAM_BOT_TOKEN no está configurado en .env"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado en .env"
    exit 1
fi

echo "✅ Variables de entorno configuradas"
echo "🚀 Iniciando bot..."

# Ejecutar el bot
npm run bot
