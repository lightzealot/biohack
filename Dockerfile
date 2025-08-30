# Dockerfile para EasyPanel
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto (aunque el bot no necesita HTTP)
EXPOSE 3000

# Comando para iniciar el bot
CMD ["node", "telegram-bot/bot.js"]
