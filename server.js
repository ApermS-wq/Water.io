// server.js
const express = require('express');
const db = require('./config/db');
const bot = require('./src/bot');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Получение баланса пользователя
app.get('/balance', async (req, res) => {
    const { user_id } = req.query;
    const result = await db.query('SELECT balance FROM users WHERE user_id = $1', [user_id]);
    res.json({ balance: result.rows[0].balance });
});

// Игровая логика и обновление баланса
app.post('/play', async (req, res) => {
    const { user_id } = req.body;
    // Логика игры, например, добавление случайной суммы валюты
    const reward = Math.floor(Math.random() * 100);
    await db.query('UPDATE users SET balance = balance + $1 WHERE user_id = $2', [reward, user_id]);
    const updatedBalance = await db.query('SELECT balance FROM users WHERE user_id = $1', [user_id]);
    res.json({ newBalance: updatedBalance.rows[0].balance });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
