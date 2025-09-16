require('dotenv').config();

const config = {
  development: {
    PORT: process.env.PORT || 3001,
    NODE_ENV: 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ralph_creator_db',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
    JWT_EXPIRES_IN: '7d',
    LOG_LEVEL: 'debug',
    CORS_ORIGIN: 'http://localhost:3000'
  },
  production: {
    PORT: process.env.PORT || 3001,
    NODE_ENV: 'production',
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    LOG_LEVEL: 'info',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    // Social Media API Keys
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
    // AI Service
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    // Railway
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
