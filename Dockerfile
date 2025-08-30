# Dockerfile para EasyPanel
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar el archivo del bot
COPY bot-main.js ./

# Copiar archivo de entorno (opcional, EasyPanel inyecta las variables)
COPY .env* ./

# Exponer puerto (aunque el bot no necesita HTTP)
EXPOSE 3000

# Comando para iniciar el bot
CMD ["node", "bot-main.js"]
