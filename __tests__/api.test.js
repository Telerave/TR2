const request = require('supertest');
const app = require('/Users/igor/TELERAVE/backend/app.js'); // Путь к файлу, где инициализируется ваше Express-приложение

describe('API тесты', () => {
  
  test('GET /api/users должен вернуть список пользователей', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test('POST /api/users должен создать нового пользователя', async () => {
    const newUser = { name: 'Иван', email: 'ivan@example.com' };
    const response = await request(app)
      .post('/api/users')
      .send(newUser);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
  });

  // Добавьте больше тестов для других маршрутов
});
