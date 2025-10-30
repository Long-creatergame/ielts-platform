const request = require('supertest');
const app = require('../index');

describe('Health endpoint', () => {
  it('GET /api/health should return ok true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok');
  });
});


