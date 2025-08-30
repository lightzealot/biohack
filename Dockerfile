# Dockerfile para Railway
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar el archivo del bot
COPY bot-main.js ./

# Railway asigna el puerto automáticamente
EXPOSE $PORT

# Comando para iniciar el bot
CMD ["node", "bot-main.js"]
