const express = require('express');
const creatorController = require('../controllers/creatorController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', creatorController.getAllCreators);
router.get('/:id', creatorController.getCreatorById);
router.post('/', validationMiddleware.validateCreator, creatorController.createCreator);
router.put('/:id', validationMiddleware.validateCreator, creatorController.updateCreator);
router.delete('/:id', creatorController.deleteCreator);
router.post('/:id/interactions', validationMiddleware.validateInteraction, creatorController.addInteraction);

module.exports = router;