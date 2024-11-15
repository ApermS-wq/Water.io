// src/bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    // Отправляем картинку, текст и кнопку для запуска приложения
    bot.sendPhoto(chatId, 'https://ideogram.ai/assets/image/lossless/response/jd7xFqMLSaSerpA8uQl1Dw', {
        caption: 'Время бежит как вода, так что не теряй ни время, ни воду!',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Открыть приложение', url: 'https://t.me/dripping_water_bot/water_on_ton' }
                ]
            ]
        }
    });
});

module.exports = bot;
