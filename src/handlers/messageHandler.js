const { processBuyStep, processSellStep } = require('./transactionHandler');

function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const session = global.userSessions.get(chatId);

  if (!session || !session.operation) {
    return;
  }

  // Store user info
  session.userId = msg.from.id;
  session.userName = msg.from.first_name || 'مستخدم';

  if (session.operation === 'buy') {
    processBuyStep(bot, msg, session);
  } else if (session.operation === 'sell') {
    processSellStep(bot, msg, session);
  }
}

function handleCurrencySelection(bot, callbackQuery, currency) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const session = global.userSessions.get(chatId);

  if (!session) return;

  session.currency = currency;

  if (session.operation === 'buy') {
    completeBuyTransaction(bot, chatId, messageId, session);
  } else if (session.operation === 'sell') {
    completeSellTransaction(bot, chatId, messageId, session);
  }
}

function completeBuyTransaction(bot, chatId, messageId, session) {
  const { calculateCommission, formatCurrency } = require('../utils/calculations');
  const { sendReport } = require('../utils/reports');
  
  const { totalWithCommission, commission } = calculateCommission(session.amount);
  
  const currencySymbol = session.currency === 'usd' ? '$' : 'ل.س';
  const rate = session.currency === 'usd' ? 1 : 11000;
  const totalAmount = totalWithCommission * rate;
  
  const message = `
✅ طلب شراء USDT

📊 تفاصيل الطلب:
💎 المبلغ: ${session.amount} USDT
💳 العنوان: ${session.address}
💰 العمولة: ${formatCurrency(commission)} USD
💵 إجمالي المبلغ: ${formatCurrency(totalAmount)} ${currencySymbol}

📍 عنوان شام كاش للدفع:
\`${process.env.SHAMCASH_ADDRESS}\`

📸 بعد التحويل، يرجى إرسال لقطة شاشة للدعم:
👨‍💻 @${process.env.SUPPORT_USERNAME}

⏰ سيتم إرسال USDT خلال دقائق من تأكيد الدفع

عند تحويل المبلغ سوف يتم اعتماد سعر صرف الدولار كما هو سعر الصرف في البنك المركزي
  `;

  bot.editMessageText(message, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📞 التواصل مع الدعم', url: `https://t.me/${process.env.SUPPORT_USERNAME}` }],
        [{ text: '🔙 العودة للقائمة الرئيسية', callback_data: 'back_to_main' }]
      ]
    }
  });

  // Send report
  sendReport(bot, `
💳 طلب شراء USDT جديد

👤 المستخدم: ${session.userName} (${session.userId})
💎 المبلغ: ${session.amount} USDT
💰 المبلغ الإجمالي: ${formatCurrency(totalAmount)} ${currencySymbol}
📍 عنوان BEP20: ${session.address}
⏰ الوقت: ${new Date().toLocaleString('ar-SY')}
  `);
  
  // Clear session
  global.userSessions.delete(chatId);
}

function completeSellTransaction(bot, chatId, messageId, session) {
  const { calculateCommission, formatCurrency } = require('../utils/calculations');
  const { sendReport } = require('../utils/reports');
  
  const { totalAfterCommission, commission } = calculateCommission(session.amount, true);
  
  const currencySymbol = session.currency === 'usd' ? '$' : 'ل.س';
  const rate = session.currency === 'usd' ? 1 : 11000;
  const receiveAmount = totalAfterCommission * rate;
  
  const message = `
✅ طلب بيع USDT

📊 تفاصيل الطلب:
💎 المبلغ: ${session.amount} USDT
📍 شام كاش: ${session.shamcashAddress}
💰 العمولة: ${formatCurrency(commission)} USD
💵 ستستلم: ${formatCurrency(receiveAmount)} ${currencySymbol}

🔗 أرسل USDT إلى العنوان التالي (شبكة BEP20):
\`${process.env.USDT_BEP20_ADDRESS}\`

📸 بعد الإرسال، يرجى إرسال لقطة شاشة للدعم:
👨‍💻 @${process.env.SUPPORT_USERNAME}

⏰ سيتم تحويل المبلغ لحسابك خلال دقائق

عند تحويل المبلغ سوف يتم اعتماد سعر صرف الدولار كما هو سعر الصرف في البنك المركزي
  `;

  bot.editMessageText(message, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📞 التواصل مع الدعم', url: `https://t.me/${process.env.SUPPORT_USERNAME}` }],
        [{ text: '🔙 العودة للقائمة الرئيسية', callback_data: 'back_to_main' }]
      ]
    }
  });

  // Send report
  sendReport(bot, `
💰 طلب بيع USDT جديد

👤 المستخدم: ${session.userName} (${session.userId})
💎 المبلغ: ${session.amount} USDT
💰 سيستلم: ${formatCurrency(receiveAmount)} ${currencySymbol}
📍 شام كاش: ${session.shamcashAddress}
⏰ الوقت: ${new Date().toLocaleString('ar-SY')}
  `);
  
  // Clear session
  global.userSessions.delete(chatId);
}

module.exports = { 
  handleMessage, 
  handleCurrencySelection,
  completeBuyTransaction,
  completeSellTransaction
};