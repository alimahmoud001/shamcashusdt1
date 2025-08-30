const { createMainKeyboard, createBackKeyboard } = require('../utils/keyboards');
const { startBuyProcess, startSellProcess } = require('./transactionHandler');
const { handleCurrencySelection } = require('./messageHandler');

function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Answer callback query
  bot.answerCallbackQuery(callbackQuery.id);

  // Handle currency selection
  if (data.startsWith('currency_')) {
    const currency = data.replace('currency_', '');
    handleCurrencySelection(bot, callbackQuery, currency);
    return;
  }

  switch (data) {
    case 'buy_usdt':
      startBuyProcess(bot, chatId, messageId);
      break;
      
    case 'sell_usdt':
      startSellProcess(bot, chatId, messageId);
      break;
      
    case 'back_to_main':
      // Clear user session
      if (global.userSessions.has(chatId)) {
        global.userSessions.delete(chatId);
      }
      
      const mainMessage = `
🔥 أهلاً وسهلاً بك في بوت تداول USDT 🔥

💰 نقوم بتداول USDT عبر شام كاش
📈 أسعار تنافسية وخدمة سريعة
🛡️ معاملات آمنة ومضمونة

العمولة: 1$ + 0.5% من المبلغ الإجمالي

اختر العملية المطلوبة:
      `;
      
      bot.editMessageText(mainMessage, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: createMainKeyboard()
      });
      break;

    case 'support':
      const supportMessage = `
📞 للتواصل مع الدعم الفني:

👨‍💻 تلجرام: @${process.env.SUPPORT_USERNAME}

📧 يرجى إرسال لقطة شاشة من عملية التحويل
⏰ نحن متواجدون 24/7 لخدمتكم

عند تحويل المبلغ سوف يتم اعتماد سعر صرف الدولار كما هو سعر الصرف في البنك المركزي
      `;
      
      bot.editMessageText(supportMessage, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: createBackKeyboard()
      });
      break;
  }
}

module.exports = { handleCallbackQuery };