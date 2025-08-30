const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 Iniciando bot de Telegram...');
console.log('📋 Variables de entorno:');
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('✅ Cliente de Supabase creado');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN no configurado');
  process.exit(1);
}

console.log('🤖 Creando bot de Telegram...');
const bot = new TelegramBot(token, { polling: true });

console.log('✅ Bot iniciado correctamente!');

// Estado del usuario para conversaciones
const userStates = {};

// Categorías
const categories = {
  income: [
    { id: "salary", name: "💼 Salario" },
    { id: "freelance", name: "💻 Freelance" },
    { id: "other-income", name: "💰 Otros ingresos" },
  ],
  expense: [
    { id: "housing", name: "🏠 Vivienda" },
    { id: "transport", name: "🚗 Transporte" },
    { id: "food", name: "🍕 Alimentación" },
    { id: "entertainment", name: "🎬 Entretenimiento" },
    { id: "health", name: "💊 Salud" },
    { id: "hobbies", name: "🎮 Hobbies" },
    { id: "other", name: "📦 Otros" },
  ],
};

// Funciones de base de datos
async function getCouples() {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching couples:', error);
    return [];
  }

  return data || [];
}

async function getTransactions(coupleId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('couple_id', coupleId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
}

async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }

  return data;
}

async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }

  return true;
}

// Utilidades
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getCategoryName(categoryId, type) {
  const categoryList = categories[type];
  const category = categoryList.find((c) => c.id === categoryId);
  return category ? category.name : "Otros";
}

// Comandos del bot
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = `
🤖 ¡Hola! Soy tu asistente financiero de DuoProfits

📝 Comandos disponibles:
• /balance - Ver balance general
• /transacciones - Ver últimas transacciones
• /agregar - Agregar nueva transacción
• /ayuda - Ver todos los comandos

💡 ¡Empecemos a gestionar tus finanzas!
  `;

  await bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/ayuda/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📋 Comandos disponibles:

💰 **CONSULTAS:**
• /balance - Ver balance general
• /transacciones - Ver últimas transacciones

➕ **GESTIÓN:**
• /agregar - Agregar nueva transacción
• /eliminar - Eliminar transacción

🔧 **UTILIDADES:**
• /ayuda - Ver este mensaje
• /cancelar - Cancelar operación actual

💡 **Ejemplo de uso:**
1. Envía /agregar
2. Sigue las instrucciones paso a paso
3. ¡Listo! Tu transacción se guardará automáticamente
  `;

  await bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const couples = await getCouples();
    if (couples.length === 0) {
      await bot.sendMessage(chatId, "❌ No se encontraron datos de parejas.");
      return;
    }

    const couple = couples[0];
    const transactions = await getTransactions(couple.id);

    const totalIncome = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const balanceMessage = `
💰 **BALANCE GENERAL - ${couple.name}**

📈 **Ingresos:** ${formatCurrency(totalIncome)}
📉 **Gastos:** ${formatCurrency(totalExpenses)}
💵 **Balance:** ${formatCurrency(balance)}

📊 **Total de transacciones:** ${transactions.length}

${balance >= 0 ? '✅ ¡Vas bien!' : '⚠️ Cuidado con los gastos'}
    `;

    await bot.sendMessage(chatId, balanceMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error getting balance:', error);
    await bot.sendMessage(chatId, "❌ Error al obtener el balance. Inténtalo de nuevo.");
  }
});

bot.onText(/\/transacciones/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const couples = await getCouples();
    if (couples.length === 0) {
      await bot.sendMessage(chatId, "❌ No se encontraron datos de parejas.");
      return;
    }

    const couple = couples[0];
    const transactions = await getTransactions(couple.id);

    if (transactions.length === 0) {
      await bot.sendMessage(chatId, "📝 No hay transacciones registradas aún.");
      return;
    }

    const recentTransactions = transactions.slice(0, 10);
    let message = `📊 **ÚLTIMAS TRANSACCIONES**\n\n`;

    recentTransactions.forEach((transaction, index) => {
      const icon = transaction.type === "income" ? "💰" : "💸";
      const sign = transaction.type === "income" ? "+" : "-";
      const person = transaction.person === "person1" ? couple.person1_name : couple.person2_name;
      const category = getCategoryName(transaction.category, transaction.type);
      const date = new Date(transaction.transaction_date).toLocaleDateString('es-ES');

      message += `${icon} **${transaction.description}**\n`;
      message += `   ${sign}${formatCurrency(transaction.amount)}\n`;
      message += `   ${category} • ${person} • ${date}\n`;
      message += `   ID: \`${transaction.id}\`\n\n`;
    });

    if (transactions.length > 10) {
      message += `\n📋 Mostrando las 10 más recientes de ${transactions.length} transacciones.`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error getting transactions:', error);
    await bot.sendMessage(chatId, "❌ Error al obtener las transacciones. Inténtalo de nuevo.");
  }
});

bot.onText(/\/agregar/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Inicializar el estado del usuario
  userStates[chatId] = {
    action: 'adding_transaction',
    step: 'type',
    transaction: {}
  };

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💰 Ingreso', callback_data: 'type_income' },
          { text: '💸 Gasto', callback_data: 'type_expense' }
        ]
      ]
    }
  };

  await bot.sendMessage(chatId, "💭 ¿Qué tipo de transacción quieres agregar?", keyboard);
});

bot.onText(/\/eliminar/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, `
🗑️ **Para eliminar una transacción:**

1. Usa /transacciones para ver las transacciones
2. Copia el ID de la transacción que quieres eliminar
3. Envía: /eliminar_id [ID]

**Ejemplo:** \`/eliminar_id 12345678-1234-1234-1234-123456789abc\`
  `, { parse_mode: 'Markdown' });
});

bot.onText(/\/eliminar_id (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const transactionId = match[1].trim();

  try {
    const success = await deleteTransaction(transactionId);
    
    if (success) {
      await bot.sendMessage(chatId, "✅ Transacción eliminada correctamente.");
    } else {
      await bot.sendMessage(chatId, "❌ No se pudo eliminar la transacción. Verifica que el ID sea correcto.");
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    await bot.sendMessage(chatId, "❌ Error al eliminar la transacción. Inténtalo de nuevo.");
  }
});

bot.onText(/\/cancelar/, async (msg) => {
  const chatId = msg.chat.id;
  
  if (userStates[chatId]) {
    delete userStates[chatId];
    await bot.sendMessage(chatId, "❌ Operación cancelada.");
  } else {
    await bot.sendMessage(chatId, "ℹ️ No hay ninguna operación en curso.");
  }
});

// Manejo de callbacks (botones)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  if (!userStates[chatId] || userStates[chatId].action !== 'adding_transaction') {
    await bot.answerCallbackQuery(callbackQuery.id, { text: "Sesión expirada. Usa /agregar para empezar de nuevo." });
    return;
  }

  const state = userStates[chatId];

  try {
    if (data.startsWith('type_')) {
      state.transaction.type = data.replace('type_', '');
      state.step = 'person';

      const couples = await getCouples();
      const couple = couples[0];

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: `👤 ${couple.person1_name}`, callback_data: 'person_person1' },
              { text: `👤 ${couple.person2_name}`, callback_data: 'person_person2' }
            ]
          ]
        }
      };

      await bot.editMessageText("👤 ¿Quién hace esta transacción?", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard.reply_markup
      });

    } else if (data.startsWith('person_')) {
      state.transaction.person = data.replace('person_', '');
      state.step = 'category';

      const categoryList = categories[state.transaction.type];
      const keyboard = {
        reply_markup: {
          inline_keyboard: categoryList.map(cat => [
            { text: cat.name, callback_data: `category_${cat.id}` }
          ])
        }
      };

      await bot.editMessageText("📂 Selecciona una categoría:", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard.reply_markup
      });

    } else if (data.startsWith('category_')) {
      state.transaction.category = data.replace('category_', '');
      state.step = 'amount';

      await bot.editMessageText("💰 Envía el monto de la transacción (solo números):", {
        chat_id: chatId,
        message_id: messageId
      });
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Error handling callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: "Error procesando la selección." });
  }
});

// Manejo de mensajes de texto
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignorar comandos
  if (!text || text.startsWith('/')) return;

  const state = userStates[chatId];
  if (!state || state.action !== 'adding_transaction') return;

  try {
    if (state.step === 'amount') {
      const amount = parseFloat(text.replace(/[^\d.-]/g, ''));
      
      if (isNaN(amount) || amount <= 0) {
        await bot.sendMessage(chatId, "❌ Por favor envía un monto válido (solo números).");
        return;
      }

      state.transaction.amount = amount;
      state.step = 'description';

      await bot.sendMessage(chatId, "📝 Envía una descripción para la transacción:");

    } else if (state.step === 'description') {
      state.transaction.description = text;

      // Obtener datos de la pareja
      const couples = await getCouples();
      const couple = couples[0];

      // Crear la transacción
      const newTransaction = {
        couple_id: couple.id,
        amount: state.transaction.amount,
        description: state.transaction.description,
        category: state.transaction.category,
        type: state.transaction.type,
        person: state.transaction.person,
        transaction_date: new Date().toISOString().split('T')[0],
      };

      const result = await addTransaction(newTransaction);

      if (result) {
        const icon = result.type === "income" ? "💰" : "💸";
        const sign = result.type === "income" ? "+" : "-";
        const personName = result.person === "person1" ? couple.person1_name : couple.person2_name;
        const categoryName = getCategoryName(result.category, result.type);

        const successMessage = `
✅ **Transacción agregada correctamente**

${icon} **${result.description}**
💵 ${sign}${formatCurrency(result.amount)}
📂 ${categoryName}
👤 ${personName}
📅 ${new Date(result.transaction_date).toLocaleDateString('es-ES')}

ID: \`${result.id}\`
        `;

        await bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, "❌ Error al agregar la transacción. Inténtalo de nuevo.");
      }

      // Limpiar el estado
      delete userStates[chatId];
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await bot.sendMessage(chatId, "❌ Error procesando el mensaje. Inténtalo de nuevo.");
  }
});

// Manejo de errores
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Bot de Telegram iniciado correctamente');
console.log('💡 Token configurado:', token ? 'SÍ' : 'NO');
console.log('📡 Supabase configurado:', supabaseUrl ? 'SÍ' : 'NO');
