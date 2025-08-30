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
• /reporte_mes - Reporte mensual detallado
• /buscar - Buscar transacciones
• /notificaciones - Configurar recordatorios
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
• /reporte_mes - Reporte mensual completo
• /buscar [texto] - Buscar transacciones

➕ **GESTIÓN:**
• /agregar - Agregar nueva transacción
• /eliminar - Eliminar transacción

🔔 **NOTIFICACIONES:**
• /notificaciones - Configurar recordatorios diarios
• /resumen_diario - Activar/desactivar resumen automático

🔧 **UTILIDADES:**
• /ayuda - Ver este mensaje
• /cancelar - Cancelar operación actual

💡 **Ejemplo de búsqueda:**
/buscar supermercado - Busca todas las transacciones que contengan "supermercado"
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

// ========================
// NUEVAS FUNCIONALIDADES
// ========================

// 1. REPORTE MENSUAL
bot.onText(/\/reporte_mes/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching monthly report:', error);
      await bot.sendMessage(chatId, "❌ Error al generar el reporte mensual.");
      return;
    }

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, "📊 No hay transacciones este mes.");
      return;
    }

    // Calcular estadísticas
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    // Gastos por categoría
    const expensesByCategory = {};
    expenses.forEach(t => {
      const categoryName = getCategoryName(t.category, 'expense');
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount;
    });

    const monthName = firstDayOfMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    let reportMessage = `📊 **REPORTE DE ${monthName.toUpperCase()}**\n\n`;
    reportMessage += `💰 **RESUMEN GENERAL:**\n`;
    reportMessage += `• Ingresos: ${formatCurrency(totalIncome)}\n`;
    reportMessage += `• Gastos: ${formatCurrency(totalExpenses)}\n`;
    reportMessage += `• Balance: ${formatCurrency(balance)} ${balance >= 0 ? '✅' : '❌'}\n\n`;
    
    reportMessage += `📈 **ESTADÍSTICAS:**\n`;
    reportMessage += `• Total transacciones: ${transactions.length}\n`;
    reportMessage += `• Promedio gasto diario: ${formatCurrency(totalExpenses / now.getDate())}\n\n`;
    
    if (Object.keys(expensesByCategory).length > 0) {
      reportMessage += `🏷️ **GASTOS POR CATEGORÍA:**\n`;
      Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          const percentage = ((amount / totalExpenses) * 100).toFixed(1);
          reportMessage += `• ${category}: ${formatCurrency(amount)} (${percentage}%)\n`;
        });
    }

    await bot.sendMessage(chatId, reportMessage, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error generating monthly report:', error);
    await bot.sendMessage(chatId, "❌ Error al generar el reporte mensual.");
  }
});

// 2. BÚSQUEDA DE TRANSACCIONES
bot.onText(/\/buscar(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const searchTerm = match[1] ? match[1].trim() : '';
  
  if (!searchTerm) {
    await bot.sendMessage(chatId, "🔍 **Búsqueda de transacciones**\n\nUsa: `/buscar [término]`\n\n**Ejemplos:**\n• `/buscar supermercado`\n• `/buscar gasolina`\n• `/buscar 50000`", { parse_mode: 'Markdown' });
    return;
  }
  
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`description.ilike.%${searchTerm}%,amount.eq.${isNaN(searchTerm) ? 0 : parseFloat(searchTerm)}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching transactions:', error);
      await bot.sendMessage(chatId, "❌ Error al buscar transacciones.");
      return;
    }

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, `🔍 No se encontraron transacciones con "${searchTerm}"`);
      return;
    }

    let message = `🔍 **Resultados para "${searchTerm}":**\n\n`;
    
    transactions.forEach((transaction, index) => {
      const emoji = transaction.type === 'income' ? '💰' : '💸';
      const categoryName = getCategoryName(transaction.category, transaction.type);
      const date = new Date(transaction.created_at).toLocaleDateString('es-ES');
      
      message += `${emoji} **${transaction.description}**\n`;
      message += `   ${formatCurrency(transaction.amount)} • ${categoryName}\n`;
      message += `   📅 ${date} • ID: ${transaction.id}\n\n`;
    });

    if (transactions.length === 20) {
      message += `\n_Mostrando los primeros 20 resultados_`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error searching transactions:', error);
    await bot.sendMessage(chatId, "❌ Error al buscar transacciones.");
  }
});

// 3. NOTIFICACIONES DIARIAS
const notificationSettings = {}; // En producción, esto debería estar en la base de datos

bot.onText(/\/notificaciones/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔔 Activar recordatorio diario', callback_data: 'notif_enable' },
        { text: '🔕 Desactivar recordatorio', callback_data: 'notif_disable' }
      ],
      [
        { text: '📊 Resumen diario ON/OFF', callback_data: 'notif_toggle_summary' }
      ],
      [
        { text: '❌ Cancelar', callback_data: 'notif_cancel' }
      ]
    ]
  };

  const currentStatus = notificationSettings[chatId] || { enabled: false, summary: false };
  const statusText = currentStatus.enabled ? '🔔 Activado' : '🔕 Desactivado';
  const summaryText = currentStatus.summary ? '📊 Activado' : '📊 Desactivado';

  await bot.sendMessage(chatId, 
    `🔔 **Configuración de Notificaciones**\n\n` +
    `**Estado actual:**\n` +
    `• Recordatorio diario: ${statusText}\n` +
    `• Resumen automático: ${summaryText}\n\n` +
    `**El recordatorio diario te enviará:**\n` +
    `• Recordatorio para registrar gastos (8:00 PM)\n` +
    `• Resumen del día si está activado\n\n` +
    `¿Qué deseas hacer?`, 
    { 
      reply_markup: keyboard,
      parse_mode: 'Markdown' 
    }
  );
});

bot.onText(/\/resumen_diario/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lt('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching daily summary:', error);
      await bot.sendMessage(chatId, "❌ Error al generar el resumen diario.");
      return;
    }

    const income = transactions?.filter(t => t.type === 'income') || [];
    const expenses = transactions?.filter(t => t.type === 'expense') || [];
    
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const dailyBalance = totalIncome - totalExpenses;

    let message = `📅 **RESUMEN DEL DÍA** - ${today.toLocaleDateString('es-ES')}\n\n`;
    
    if (transactions.length === 0) {
      message += `ℹ️ No hay transacciones registradas hoy.\n\n`;
      message += `💡 **Recordatorio:** ¿Registraste todos tus gastos de hoy?`;
    } else {
      message += `💰 **Ingresos:** ${formatCurrency(totalIncome)}\n`;
      message += `💸 **Gastos:** ${formatCurrency(totalExpenses)}\n`;
      message += `📊 **Balance del día:** ${formatCurrency(dailyBalance)} ${dailyBalance >= 0 ? '✅' : '❌'}\n\n`;
      
      message += `📝 **Transacciones:** ${transactions.length}\n\n`;
      
      if (expenses.length > 0) {
        message += `**Últimos gastos:**\n`;
        expenses.slice(0, 3).forEach(transaction => {
          const categoryName = getCategoryName(transaction.category, 'expense');
          message += `• ${transaction.description}: ${formatCurrency(transaction.amount)} (${categoryName})\n`;
        });
      }
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Error generating daily summary:', error);
    await bot.sendMessage(chatId, "❌ Error al generar el resumen diario.");
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

// Manejo de callbacks para notificaciones
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  // Solo manejar callbacks de notificaciones si no hay estado de transacción
  if (data.startsWith('notif_') && (!userStates[chatId] || userStates[chatId].action !== 'adding_transaction')) {
    try {
      const settings = notificationSettings[chatId] || { enabled: false, summary: false };
      
      switch (data) {
        case 'notif_enable':
          notificationSettings[chatId] = { ...settings, enabled: true };
          await bot.editMessageText(
            `✅ **Recordatorio diario activado**\n\n` +
            `Te enviaré un recordatorio todos los días a las 8:00 PM para registrar tus gastos.\n\n` +
            `Usa /notificaciones para cambiar la configuración.`,
            {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id,
              parse_mode: 'Markdown'
            }
          );
          break;
          
        case 'notif_disable':
          notificationSettings[chatId] = { ...settings, enabled: false };
          await bot.editMessageText(
            `🔕 **Recordatorio diario desactivado**\n\n` +
            `Ya no recibirás recordatorios automáticos.\n\n` +
            `Usa /notificaciones para volver a activarlos.`,
            {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id,
              parse_mode: 'Markdown'
            }
          );
          break;
          
        case 'notif_toggle_summary':
          const newSummaryState = !settings.summary;
          notificationSettings[chatId] = { ...settings, summary: newSummaryState };
          const summaryStatus = newSummaryState ? 'activado' : 'desactivado';
          await bot.editMessageText(
            `📊 **Resumen diario ${summaryStatus}**\n\n` +
            `${newSummaryState ? 'Recibirás un resumen automático de tus transacciones diarias.' : 'Ya no recibirás resúmenes automáticos diarios.'}\n\n` +
            `Usa /notificaciones para cambiar otras configuraciones.`,
            {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id,
              parse_mode: 'Markdown'
            }
          );
          break;
          
        case 'notif_cancel':
          await bot.editMessageText(
            `ℹ️ Configuración de notificaciones cancelada.`,
            {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id
            }
          );
          break;
      }
      
      await bot.answerCallbackQuery(callbackQuery.id);
      return;
    } catch (error) {
      console.error('Error handling notification callback:', error);
      await bot.answerCallbackQuery(callbackQuery.id, { text: "Error en la configuración." });
      return;
    }
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

// ========================
// SISTEMA DE NOTIFICACIONES AUTOMÁTICAS
// ========================

// Función para enviar recordatorio diario
async function sendDailyReminder() {
  console.log('🔔 Verificando usuarios para recordatorio diario...');
  
  for (const [chatId, settings] of Object.entries(notificationSettings)) {
    if (settings.enabled) {
      try {
        let message = `🔔 **Recordatorio diario**\n\n`;
        message += `💡 ¿Ya registraste todos tus gastos de hoy?\n\n`;
        message += `Usa /agregar para añadir una nueva transacción.`;
        
        // Si tiene resumen diario activado, incluir resumen
        if (settings.summary) {
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
          
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .gte('created_at', startOfDay.toISOString())
            .lt('created_at', endOfDay.toISOString());
          
          if (transactions && transactions.length > 0) {
            const expenses = transactions.filter(t => t.type === 'expense');
            const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
            
            message += `\n\n📊 **Resumen de hoy:**\n`;
            message += `• Transacciones: ${transactions.length}\n`;
            message += `• Gastos: ${formatCurrency(totalExpenses)}`;
          } else {
            message += `\n\n📊 No hay transacciones registradas hoy.`;
          }
        }
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log(`✅ Recordatorio enviado a usuario ${chatId}`);
        
      } catch (error) {
        console.error(`❌ Error enviando recordatorio a ${chatId}:`, error);
      }
    }
  }
}

// Configurar recordatorio diario a las 8:00 PM (20:00)
function scheduleReminders() {
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0); // 8:00 PM
  
  // Si ya pasó la hora de hoy, programar para mañana
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const timeUntilNext = target.getTime() - now.getTime();
  
  console.log(`⏰ Próximo recordatorio programado para: ${target.toLocaleString('es-ES')}`);
  
  setTimeout(() => {
    sendDailyReminder();
    // Programar recordatorios cada 24 horas
    setInterval(sendDailyReminder, 24 * 60 * 60 * 1000);
  }, timeUntilNext);
}

// Iniciar sistema de recordatorios
scheduleReminders();

// Servidor HTTP simple para mantener el contenedor vivo
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'Bot running', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP iniciado en puerto ${PORT}`);
  console.log('🤖 Bot de Telegram iniciado correctamente');
  console.log('💡 Token configurado:', token ? 'SÍ' : 'NO');
  console.log('📡 Supabase configurado:', supabaseUrl ? 'SÍ' : 'NO');
});
