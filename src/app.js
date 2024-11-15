const express = require('express');
const { Client } = require('pg');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_TOKEN = '7433571484:AAG4uEZhBLDyH3x8NYvwYi1-iuC6B3-im04';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const dbClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'bd_water_game',
    user: 'postgres',
    password: '55655565',
});
dbClient.connect();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Функция для проверки/добавления пользователя
async function ensureUserExists(userId, username) {
    const query = `
        INSERT INTO users (user_id, balance, buckets, username)
        VALUES ($1, 0, 3, $2) 
        ON CONFLICT (user_id) DO UPDATE SET username = $2;
    `;
    await dbClient.query(query, [userId, username]);
}

// Команда /start для Telegram-бота
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'unknown';

    await ensureUserExists(userId, username);

    const link = `http://r99992dx.beget.tech/?user_id=${userId}`;
    bot.sendPhoto(chatId, 'https://ideogram.ai/assets/progressive-image/balanced/response/jd7xFqMLSaSerpA8uQl1Dw', {
        caption: 'Время бежит как вода, так что не теряй ни время, ни воду!\nДобро пожаловать в Water Game!',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть приложение', web_app: { url: link } }]
            ]
        }
    });
});

// Эндпоинт для получения данных пользователя
app.get('/get-user-data', async (req, res) => {
    const userId = req.query.user_id;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    try {
        const result = await dbClient.query('SELECT balance, buckets, username FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            const { balance, buckets, username } = result.rows[0];
            res.json({ balance, buckets, username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Эндпоинт для игры
app.post('/play-game', async (req, res) => {
    const userId = req.query.user_id;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    try {
        const result = await dbClient.query('SELECT balance, buckets FROM users WHERE user_id = $1', [userId]);
        const { balance, buckets } = result.rows[0];

        if (buckets <= 0) {
            res.json({
                balance,
                buckets,
                message: "У вас кончились вёдра",
                bucketIconUrl: "https://cdn-icons-png.flaticon.com/256/482/482463.png"
            });
        } else {
            const earnedAmount = Math.floor(Math.random() * 1000);
            await dbClient.query('UPDATE users SET balance = balance + $1, buckets = buckets - 1 WHERE user_id = $2', [earnedAmount, userId]);

            const updatedResult = await dbClient.query('SELECT balance, buckets FROM users WHERE user_id = $1', [userId]);
            const { balance: newBalance, buckets: newBuckets } = updatedResult.rows[0];

            res.json({ balance: newBalance, buckets: newBuckets, earnedAmount });
        }
    } catch (error) {
        console.error('Ошибка при игре:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
