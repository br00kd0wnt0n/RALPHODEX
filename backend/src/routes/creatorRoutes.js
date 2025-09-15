const express = require('express');
const creatorController = require('../controllers/creatorController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes (no auth required for viewing)
router.get('/', creatorController.getAllCreators);
router.get('/:id', creatorController.getCreatorById);

// Social media endpoints (temporarily public for testing logging)
router.get('/:id/posts', creatorController.getCreatorPosts);

// Protected routes (auth required for modifications)
router.use(authMiddleware);
router.post('/', validationMiddleware.validateCreator, creatorController.createCreator);
router.put('/:id', validationMiddleware.validateCreator, creatorController.updateCreator);
router.delete('/:id', creatorController.deleteCreator);
router.post('/:id/interactions', validationMiddleware.validateInteraction, creatorController.addInteraction);

// AI-powered endpoints
router.get('/:id/insights', creatorController.getCreatorInsights);
router.get('/:id/recommendations', creatorController.getCreatorRecommendations);

module.exports = router;