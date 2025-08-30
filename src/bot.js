const TelegramBot = require('node-telegram-bot-api');
const { createMainKeyboard } = require('./utils/keyboards');
const { handleCallbackQuery } = require('./handlers/callbackHandler');
const { handleMessage } = require('./handlers/messageHandler');
const { sendReport } = require('./utils/reports');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ BOT_TOKEN is required in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { 
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Initialize global sessions
global.userSessions = new Map();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Bot terminated...');
  bot.stopPolling();
  process.exit(0);
});

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'مستخدم';
  
  const welcomeMessage = `
🔥 أهلاً وسهلاً ${userName} في بوت تداول USDT 🔥

💰 نقوم بتداول USDT عبر شام كاش
📈 أسعار تنافسية وخدمة سريعة
🛡️ معاملات آمنة ومضمونة

العمولة: 1$ + 0.5% من المبلغ الإجمالي

اختر العملية المطلوبة:
  `;

  bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: createMainKeyboard()
  });

  // Report new user
  sendReport(bot, `
🆕 مستخدم جديد انضم للبوت

👤 الاسم: ${userName}
🆔 المعرف: ${msg.from.id}
⏰ الوقت: ${new Date().toLocaleString('ar-SY')}
  `);
});

// Handle callback queries
bot.on('callback_query', (callbackQuery) => {
  try {
    handleCallbackQuery(bot, callbackQuery);
  } catch (error) {
    console.error('Callback error:', error);
    bot.answerCallbackQuery(callbackQuery.id, { text: '❌ حدث خطأ' });
  }
});

// Handle messages
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    try {
      handleMessage(bot, msg);
    } catch (error) {
      console.error('Message error:', error);
      bot.sendMessage(msg.chat.id, '❌ حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
  
  // Report error
  sendReport(bot, `
⚠️ خطأ في البوت

📝 التفاصيل: ${error.message}
⏰ الوقت: ${new Date().toLocaleString('ar-SY')}
  `);
});

// Bot startup report
sendReport(bot, `
🤖 تم تشغيل البوت بنجاح

⏰ الوقت: ${new Date().toLocaleString('ar-SY')}
🔄 البوت جاهز لاستقبال الطلبات
`);

console.log('🤖 Bot started successfully!');