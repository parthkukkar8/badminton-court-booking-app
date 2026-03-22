const morgan = require('morgan');

// Custom log format
// Shows: method, url, status, response time
const logger = morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const time = tokens['response-time'](req, res);

  // Color code based on status
  const statusColor =
    status >= 500 ? '\x1b[31m' : // red
    status >= 400 ? '\x1b[33m' : // yellow
    status >= 300 ? '\x1b[36m' : // cyan
    '\x1b[32m';                   // green

  return `${statusColor}[Gateway] ${method} ${url} ${status} - ${time}ms\x1b[0m`;
});

module.exports = logger;