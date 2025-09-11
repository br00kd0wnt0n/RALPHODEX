// backend/server.js
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const creatorRoutes = require('./src/routes/creatorRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/creators', creatorRoutes);
app.use('/api/auth', authRoutes);

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true }); // Use alter in development, force in initial setup
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

// backend/src/controllers/creatorController.js
const { Creator, Interaction } = require('../models');
const { Op } = require('sequelize');

class CreatorController {
  // Create a new creator
  static async createCreator(req, res) {
    try {
      const creatorData = req.body;
      const creator = await Creator.create(creatorData);
      res.status(201).json(creator);
    } catch (error) {
      res.status(400).json({ 
        message: 'Error creating creator', 
        error: error.message 
      });
    }
  }

  // Get creator by ID with interactions
  static async getCreatorById(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id, {
        include: [{
          model: Interaction,
          as: 'interactions'
        }]
      });

      if (!creator) {
        return res.status(404).json({ message: 'Creator not found' });
      }

      res.json(creator);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving creator', 
        error: error.message 
      });
    }
  }

  // Search creators with advanced filtering
  static async searchCreators(req, res) {
    try {
      const { 
        name, 
        tags, 
        content_type, 
        min_audience_size, 
        verified 
      } = req.query;

      const whereCondition = {};

      if (name) {
        whereCondition.full_name = {
          [Op.iLike]: `%${name}%`
        };
      }

      if (tags) {
        whereCondition.tags = {
          [Op.contains]: tags.split(',')
        };
      }

      if (content_type) {
        whereCondition.primary_content_type = content_type;
      }

      if (min_audience_size) {
        whereCondition.audience_size = {
          [Op.gte]: parseInt(min_audience_size)
        };
      }

      if (verified !== undefined) {
        whereCondition.verified = verified === 'true';
      }

      const creators = await Creator.findAndCountAll({
        where: whereCondition,
        include: [{
          model: Interaction,
          as: 'interactions'
        }],
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
        order: [['created_at', 'DESC']]
      });

      res.json(creators);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error searching creators', 
        error: error.message 
      });
    }
  }

  // Update creator details
  static async updateCreator(req, res) {
    try {
      const [updated] = await Creator.update(req.body, {
        where: { id: req.params.id }
      });

      if (updated) {
        const updatedCreator = await Creator.findByPk(req.params.id);
        return res.json(updatedCreator);
      }

      throw new Error('Creator not found');
    } catch (error) {
      res.status(400).json({ 
        message: 'Error updating creator', 
        error: error.message 
      });
    }
  }

  // Add interaction for a creator
  static async addInteraction(req, res) {
    try {
      const interactionData = {
        ...req.body,
        creator_id: req.params.id
      };

      const interaction = await Interaction.create(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ 
        message: 'Error adding interaction', 
        error: error.message 
      });
    }
  }

  // Dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const totalCreators = await Creator.count();
      const verifiedCreators = await Creator.count({ 
        where: { verified: true } 
      });
      const recentInteractions = await Interaction.count({
        where: {
          date: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });
      const contentTypeBreakdown = await Creator.findAll({
        attributes: ['primary_content_type', 
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['primary_content_type']
      });

      res.json({
        totalCreators,
        verifiedCreators,
        recentInteractions,
        contentTypeBreakdown
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error retrieving dashboard stats', 
        error: error.message 
      });
    }
  }
}

module.exports = CreatorController;

// backend/src/routes/creatorRoutes.js
const express = require('express');
const CreatorController = require('../controllers/creatorController');
const router = express.Router();

router.post('/', CreatorController.createCreator);
router.get('/search', CreatorController.searchCreators);
router.get('/dashboard-stats', CreatorController.getDashboardStats);
router.get('/:id', CreatorController.getCreatorById);
router.put('/:id', CreatorController.updateCreator);
router.post('/:id/interactions', CreatorController.addInteraction);

module.exports = router;
