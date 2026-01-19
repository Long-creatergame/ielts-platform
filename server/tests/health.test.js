const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';

const app = require('../index');

test('GET /api/health returns expected shape', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(typeof body, 'object');

    assert.equal(body.status, 'ok');
    assert.equal(typeof body.uptime, 'number');
    assert.ok(Number.isFinite(body.uptime));
    assert.equal(typeof body.timestamp, 'string');
    assert.equal(typeof body.db, 'object');
    assert.equal(typeof body.db.ok, 'boolean');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

