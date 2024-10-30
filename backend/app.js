const express = require('express');
const cors = require('cors');
const app = express();

// Здесь должны быть ваши маршруты и middleware

// Пример маршрута
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]);
});

app.get('/tracks', (req, res) => {
  // Ваша логика обработки запроса
  // ...
  res.json(tracks); // Отправка данных в формате JSON
});

app.use(cors({
  origin: 'http://localhost:3000', // Предполагая, что ваш фронтенд запущен на порту 3000
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
