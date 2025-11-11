/* Server bootstrap that imports the configured Express app and starts the HTTP server. */
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('[Init] Server bootstrapped via server/server.js on port', PORT);
});

module.exports = server;


