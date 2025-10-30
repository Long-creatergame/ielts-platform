const request = require('supertest');
const app = require('../index');

describe('Tests routes', () => {
  it('POST /api/tests/submit without token should 401', async () => {
    const res = await request(app).post('/api/tests/submit').send({ skill: 'reading', answers: {} });
    expect(res.statusCode).toBe(401);
  });
});


