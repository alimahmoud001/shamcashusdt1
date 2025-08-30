function sendReport(bot, message) {
  const groupChatId = process.env.GROUP_CHAT_ID;
  const personalChatId = process.env.PERSONAL_CHAT_ID;
  
  // Send to group
  if (groupChatId) {
    bot.sendMessage(groupChatId, message).catch(err => {
      console.error('Error sending to group:', err.message);
    });
  }
  
  // Send to personal account
  if (personalChatId) {
    bot.sendMessage(personalChatId, message).catch(err => {
      console.error('Error sending to personal:', err.message);
    });
  }
}

module.exports = { sendReport };