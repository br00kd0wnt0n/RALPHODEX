const express = require('express');
const creatorController = require('../controllers/creatorController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { apiLimiter, socialMediaLimiter } = require('../middleware/rateLimiting');

const router = express.Router();

// Apply general rate limiting to all routes
router.use(apiLimiter);

// Public routes (no auth required for viewing)
router.get('/', creatorController.getAllCreators);
router.get('/:id', creatorController.getCreatorById);

// Social media endpoints with strict rate limiting
router.get('/:id/posts', socialMediaLimiter, creatorController.getCreatorPosts);

// Protected routes (auth required for modifications)
router.use(authMiddleware);
router.post('/', validationMiddleware.validateCreator, creatorController.createCreator);
router.put('/:id', validationMiddleware.validateCreator, creatorController.updateCreator);
router.delete('/:id', creatorController.deleteCreator);
router.post('/:id/interactions', validationMiddleware.validateInteraction, creatorController.addInteraction);
// Conversations / word cloud refresh
router.post('/:id/conversations/refresh', socialMediaLimiter, creatorController.refreshConversationCloud);

// AI-powered endpoints
router.get('/:id/insights', creatorController.getCreatorInsights);
router.get('/:id/recommendations', creatorController.getCreatorRecommendations);

module.exports = router;
