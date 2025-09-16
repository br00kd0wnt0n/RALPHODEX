const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./src/config/database');
const creatorRoutes = require('./src/routes/creatorRoutes');
const authRoutes = require('./src/routes/authRoutes');
const errorHandler = require('./src/utils/errorHandler');
const { logger, requestLogger } = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://ralphodex.up.railway.app',
    'https://ralphodex-backend.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use structured logging middleware
app.use(requestLogger);

app.use('/api/creators', creatorRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Creator Rolodex API is running' });
});

// Test endpoint for logging and API keys
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint called', {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    status: 'OK',
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasRapidApiKey: !!process.env.RAPIDAPI_KEY,
      hasYouTubeKey: !!process.env.YOUTUBE_API_KEY,
      hasTwitterToken: !!process.env.TWITTER_BEARER_TOKEN,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    }
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        nodeEnv: process.env.NODE_ENV,
        hasRapidApiKey: !!process.env.RAPIDAPI_KEY,
        hasYouTubeKey: !!process.env.YOUTUBE_API_KEY,
        hasTwitterToken: !!process.env.TWITTER_BEARER_TOKEN
      });
    });
  } catch (error) {
    logger.error('Unable to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();