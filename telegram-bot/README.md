# 🤖 Bot de Telegram - DuoProfits

Bot de Telegram para gestionar las finanzas familiares directamente desde WhatsApp/Telegram.

## 🚀 Configuración

### 1. Crear un Bot de Telegram

1. Ve a [@BotFather](https://t.me/botfather) en Telegram
2. Envía `/newbot`
3. Sigue las instrucciones para crear tu bot
4. Guarda el **token** que te proporciona

### 2. Obtener tu Chat ID

1. Envía un mensaje a [@userinfobot](https://t.me/userinfobot)
2. El bot te dirá tu **Chat ID**
3. O puedes usar [@RawDataBot](https://t.me/rawdatabot)

### 3. Configurar Variables de Entorno

Actualiza tu archivo `.env` con:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui
```

### 4. Ejecutar el Bot

```bash
# Modo desarrollo (con recarga automática)
npm run bot:dev

# Modo producción
npm run bot
```

## 📱 Comandos Disponibles

### 📊 Consultas
- `/start` - Mensaje de bienvenida
- `/balance` - Ver balance general
- `/transacciones` - Ver últimas transacciones
- `/balance_personal` - Ver balance por persona

### ➕ Gestión de Transacciones
- `/agregar` - Agregar nueva transacción (guiado paso a paso)
- `/eliminar` - Instrucciones para eliminar transacción
- `/eliminar_id [ID]` - Eliminar transacción específica

### 🔧 Utilidades
- `/ayuda` - Ver todos los comandos
- `/cancelar` - Cancelar operación actual

## 🎯 Ejemplo de Uso

1. **Agregar Transacción:**
   ```
   Usuario: /agregar
   Bot: ¿Qué tipo de transacción? [💰 Ingreso] [💸 Gasto]
   Usuario: [Selecciona tipo]
   Bot: ¿Quién hace la transacción? [👤 Juan] [👤 María]
   Usuario: [Selecciona persona]
   Bot: Selecciona categoría: [🏠 Vivienda] [🍕 Alimentación] ...
   Usuario: [Selecciona categoría]
   Bot: Envía el monto:
   Usuario: 50000
   Bot: Envía descripción:
   Usuario: Supermercado Éxito
   Bot: ✅ Transacción agregada correctamente
   ```

2. **Ver Balance:**
   ```
   Usuario: /balance
   Bot: 💰 BALANCE GENERAL
        📈 Ingresos: $2,500,000
        📉 Gastos: $1,800,000
        💵 Balance: $700,000
   ```

3. **Eliminar Transacción:**
   ```
   Usuario: /transacciones
   Bot: [Lista con IDs]
   Usuario: /eliminar_id 12345678-1234-1234-1234-123456789abc
   Bot: ✅ Transacción eliminada correctamente
   ```

## 🔧 Características

- ✅ **Interfaz conversacional** - Fácil de usar con botones
- ✅ **Tiempo real** - Se conecta directamente a tu base de datos
- ✅ **Seguro** - Solo funciona con tu Chat ID configurado
- ✅ **Completo** - Todas las funciones de la app web
- ✅ **Formato bonito** - Mensajes con emojis y formato Markdown

## 🚨 Solución de Problemas

### El bot no responde
- Verifica que el `TELEGRAM_BOT_TOKEN` sea correcto
- Asegúrate de que el bot esté ejecutándose (`npm run bot:dev`)

### No recibo mensajes
- Verifica tu `TELEGRAM_CHAT_ID`
- Envía `/start` al bot para iniciar la conversación

### Errores de base de datos
- Verifica la configuración de Supabase en `.env`
- Asegúrate de que la aplicación web funcione correctamente

## 📝 Notas

- El bot funciona 24/7 mientras esté ejecutándose
- Puedes tener múltiples usuarios agregando sus Chat IDs
- Todas las transacciones se sincronizan con la aplicación web
- El bot mantiene el estado de conversación para múltiples usuarios simultáneamente
