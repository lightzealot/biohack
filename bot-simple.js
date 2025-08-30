console.log('🚀 Iniciando bot simple...');

// Test básico de variables
console.log('Variables de entorno:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('- PORT:', process.env.PORT || '3000');

// Servidor HTTP simple primero
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`📥 Request recibido: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'Bot test server running',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      HAS_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      PORT: process.env.PORT || 3000
    }
  }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor HTTP iniciado en puerto ${PORT}`);
  console.log(`🔗 Disponible en http://0.0.0.0:${PORT}`);
});

// Inicializar bot después del servidor
setTimeout(() => {
  console.log('🤖 Iniciando bot de Telegram...');
  
  try {
    const TelegramBot = require('node-telegram-bot-api');
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN no configurado');
    }
    
    const bot = new TelegramBot(token, { polling: true });
    
    bot.on('message', (msg) => {
      console.log(`📨 Mensaje recibido: ${msg.text}`);
      bot.sendMessage(msg.chat.id, `✅ Bot funcionando! Recibí: ${msg.text}`);
    });
    
    bot.on('polling_error', (error) => {
      console.error('❌ Polling error:', error.message);
    });
    
    console.log('✅ Bot de Telegram configurado correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando bot:', error.message);
  }
}, 2000);

// Mantener el proceso vivo
console.log('🔄 Proceso iniciado correctamente');
