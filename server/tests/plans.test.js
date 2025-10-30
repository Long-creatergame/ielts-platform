const request = require('supertest');
const app = require('../index');

describe('Payment plans endpoint', () => {
  it('GET /api/payment/plans should respond 200 (or 503 if Stripe not configured)', async () => {
    const res = await request(app).get('/api/payment/plans');
    expect([200, 503]).toContain(res.statusCode);
  });
});


