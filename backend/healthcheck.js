const http = require('http');
const { logger } = require('./src/utils/logger');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3001,
  path: '/api/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    logger.debug('Health check passed', { statusCode: res.statusCode });
    process.exit(0);
  } else {
    logger.warn('Health check failed', { statusCode: res.statusCode });
    process.exit(1);
  }
});

request.on('error', (error) => {
  logger.error('Health check error', { error: error.message });
  process.exit(1);
});

request.end();