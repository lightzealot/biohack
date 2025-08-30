# Dockerfile para EasyPanel
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar el archivo del bot simple para testing
COPY bot-simple.js ./

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el bot simple
CMD ["node", "bot-simple.js"]
