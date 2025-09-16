const axios = require('axios');
const { logger } = require('./logger');

class ApiClient {
  constructor(baseURL, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'User-Agent': 'Ralph-Creator-Database/1.0'
      }
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
          duration: response.headers['x-response-time']
        });
        return response;
      },
      (error) => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  async request(config, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client(config);
        return response;
      } catch (error) {
        logger.warn(`API request attempt ${attempt} failed`, {
          url: config.url,
          error: error.message,
          attempt,
          maxRetries: retries
        });

        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  get(url, config = {}) {
    return this.request({ method: 'get', url, ...config });
  }

  post(url, data, config = {}) {
    return this.request({ method: 'post', url, data, ...config });
  }
}

module.exports = ApiClient;
