const request = require('supertest');
const app = require('../index');

describe('Auth basic', () => {
  it('POST /api/auth/login should 400 when missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});


