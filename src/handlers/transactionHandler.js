const { createCurrencyKeyboard, createBackKeyboard } = require('../utils/keyboards');

function startBuyProcess(bot, chatId, messageId) {
  const buyMessage = `
💳 شراء USDT

📝 يرجى إدخال المبلغ الذي تريد شراءه بالـ USDT

مثال: 100
  `;

  // Initialize user session
  if (!global.userSessions.has(chatId)) {
    global.userSessions.set(chatId, {});
  }
  
  const session = global.userSessions.get(chatId);
  session.operation = 'buy';
  session.step = 'amount';

  bot.editMessageText(buyMessage, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: createBackKeyboard()
  });
}

function startSellProcess(bot, chatId, messageId) {
  const sellMessage = `
💰 بيع USDT

📝 يرجى إدخال المبلغ الذي تريد بيعه بالـ USDT

مثال: 100
  `;

  // Initialize user session
  if (!global.userSessions.has(chatId)) {
    global.userSessions.set(chatId, {});
  }
  
  const session = global.userSessions.get(chatId);
  session.operation = 'sell';
  session.step = 'amount';

  bot.editMessageText(sellMessage, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: createBackKeyboard()
  });
}

function processBuyStep(bot, msg, session) {
  const chatId = msg.chat.id;
  
  switch (session.step) {
    case 'amount':
      const amount = parseFloat(msg.text);
      if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(chatId, '❌ يرجى إدخال مبلغ صحيح');
        return;
      }
      
      session.amount = amount;
      session.step = 'address';
      
      bot.sendMessage(chatId, `
📍 عنوان المحفظة

يرجى إدخال عنوان محفظتك على شبكة BEP20

⚠️ تأكد من صحة العنوان - شبكة BEP20 حصراً
      `);
      break;
      
    case 'address':
      session.address = msg.text.trim();
      session.step = 'currency';
      
      bot.sendMessage(chatId, `
💱 اختر عملة الدفع

كيف تريد أن تدفع مقابل شراء ${session.amount} USDT؟
      `, {
        reply_markup: createCurrencyKeyboard()
      });
      break;
  }
}

function processSellStep(bot, msg, session) {
  const chatId = msg.chat.id;
  
  switch (session.step) {
    case 'amount':
      const amount = parseFloat(msg.text);
      if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(chatId, '❌ يرجى إدخال مبلغ صحيح');
        return;
      }
      
      session.amount = amount;
      session.step = 'shamcash_address';
      
      bot.sendMessage(chatId, `
📍 عنوان شام كاش

يرجى إدخال عنوان شام كاش الخاص بك لاستلام المبلغ
      `);
      break;
      
    case 'shamcash_address':
      session.shamcashAddress = msg.text.trim();
      session.step = 'currency';
      
      bot.sendMessage(chatId, `
💱 اختر عملة الاستلام

بأي عملة تريد استلام مقابل بيع ${session.amount} USDT؟
      `, {
        reply_markup: createCurrencyKeyboard()
      });
      break;
  }
}

module.exports = { 
  startBuyProcess, 
  startSellProcess, 
  processBuyStep, 
  processSellStep 
};