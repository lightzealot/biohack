FROM node:18-alpine

WORKDIR /app

COPY simple-server.js ./

EXPOSE 3000

CMD ["node", "simple-server.js"]
