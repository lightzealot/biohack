# Dockerfile para EasyPanel
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias básicas solamente
RUN npm install --only=production

# Copiar el archivo de debug
COPY bot-debug.js ./

# Exponer puerto
EXPOSE 3000

# Iniciar con logs forzados
CMD ["node", "bot-debug.js"]
