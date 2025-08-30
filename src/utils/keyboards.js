function createMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔥 شراء USDT', callback_data: 'buy_usdt' },
        { text: '💰 بيع USDT', callback_data: 'sell_usdt' }
      ],
      [
        { text: '📞 الدعم الفني', callback_data: 'support' }
      ]
    ]
  };
}

function createCurrencyKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💵 دولار أمريكي', callback_data: 'currency_usd' },
        { text: '🇸🇾 ليرة سورية', callback_data: 'currency_syp' }
      ],
      [
        { text: '🔙 العودة للقائمة الرئيسية', callback_data: 'back_to_main' }
      ]
    ]
  };
}

function createBackKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔙 العودة للقائمة الرئيسية', callback_data: 'back_to_main' }
      ]
    ]
  };
}

module.exports = { 
  createMainKeyboard, 
  createCurrencyKeyboard, 
  createBackKeyboard 
};