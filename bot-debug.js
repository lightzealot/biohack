// Bot super básico para debugging
console.log('=== INICIO DEL SCRIPT ===');
console.log('Timestamp:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current working directory:', process.cwd());

// Log cada segundo para forzar output
let counter = 0;
setInterval(() => {
  counter++;
  console.log(`⏰ Heartbeat ${counter} - ${new Date().toISOString()}`);
  
  if (counter === 5) {
    console.log('🌐 Iniciando servidor HTTP...');
    
    const http = require('http');
    const server = http.createServer((req, res) => {
      console.log(`📥 HTTP Request: ${req.method} ${req.url}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Server running! Counter: ${counter}`);
    });
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ HTTP Server listening on port ${PORT}`);
      console.log(`🔗 Try: http://localhost:${PORT}`);
    });
  }
}, 1000);

// Log de variables de entorno importantes
setTimeout(() => {
  console.log('📋 Environment variables check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- PORT:', process.env.PORT || 'not set (using 3000)');
  console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET (length: ' + process.env.TELEGRAM_BOT_TOKEN.length + ')' : 'NOT SET');
}, 2000);

// Mantener el proceso vivo
process.on('SIGTERM', () => {
  console.log('💀 Received SIGTERM, shutting down gracefully');
});

process.on('SIGINT', () => {
  console.log('💀 Received SIGINT, shutting down gracefully');
});

console.log('🚀 Script setup complete, waiting for intervals...');
