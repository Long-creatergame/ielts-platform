const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../index');

describe('Health', () => {
  it('GET /api/health returns expected shape', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeTruthy();
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(Number.isFinite(res.body.uptime)).toBe(true);
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.db).toBe('object');
    expect(typeof res.body.db.ok).toBe('boolean');
  });
});

