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

# Verificar que el archivo existe
RUN ls -la bot-main.js

# Verificar que node funciona
RUN node --version

# Exponer puerto (aunque el bot no necesita HTTP)
EXPOSE 3000

# Comando para iniciar el bot con logs explícitos
CMD echo "🚀 Iniciando contenedor..." && ls -la && echo "📂 Contenido del directorio listado" && echo "🎯 Ejecutando bot..." && node bot-main.js
