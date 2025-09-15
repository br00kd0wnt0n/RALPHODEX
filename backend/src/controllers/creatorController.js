const { Creator, Interaction } = require('../models');
const { Op } = require('sequelize');
const socialMediaFetcher = require('../utils/socialMediaFetcher');

const creatorController = {
  async getAllCreators(req, res) {
    try {
      const { page = 1, limit = 20, search, tags, verified, metaFilter } = req.query;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      if (search) {
        where[Op.or] = [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { primary_content_type: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      if (tags) {
        const tagArray = tags.split(',');
        where.tags = { [Op.overlap]: tagArray };
      }
      
      if (verified !== undefined) {
        where.verified = verified === 'true';
      }
      
      // META Filter: >1K FB followers, Young Adult >20%, US >20%
      if (metaFilter === 'true') {
        where.facebook_followers = { [Op.gt]: 1000 };
        where[Op.and] = [
          { 'demographics.young_adult_percentage': { [Op.gt]: 20 } },
          { 'demographics.us_followers_percentage': { [Op.gt]: 20 } }
        ];
      }
      
      const creators = await Creator.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        include: [{
          model: Interaction,
          as: 'interactions',
          limit: 5,
          order: [['date', 'DESC']]
        }]
      });
      
      res.json({
        creators: creators.rows,
        totalPages: Math.ceil(creators.count / limit),
        currentPage: parseInt(page),
        total: creators.count
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorById(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id, {
        include: [{
          model: Interaction,
          as: 'interactions',
          order: [['date', 'DESC']]
        }]
      });
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      res.json(creator);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async createCreator(req, res) {
    try {
      const creator = await Creator.create(req.body);
      res.status(201).json(creator);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateCreator(req, res) {
    try {
      const [updated] = await Creator.update(req.body, {
        where: { id: req.params.id },
        returning: true
      });
      
      if (!updated) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const creator = await Creator.findByPk(req.params.id);
      res.json(creator);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteCreator(req, res) {
    try {
      const deleted = await Creator.destroy({
        where: { id: req.params.id }
      });
      
      if (!deleted) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addInteraction(req, res) {
    try {
      const interaction = await Interaction.create({
        ...req.body,
        creator_id: req.params.id
      });
      
      res.status(201).json(interaction);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCreatorInsights(req, res) {
    try {
      const { generateCreatorInsights } = require('../services/aiService');
      
      const creator = await Creator.findByPk(req.params.id, {
        include: [{ 
          model: Interaction, 
          as: 'interactions',
          order: [['date', 'DESC']]
        }]
      });
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const insights = await generateCreatorInsights(creator);
      
      res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        ...insights
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorRecommendations(req, res) {
    try {
      const { generateMatchingRecommendations } = require('../services/aiService');
      
      const creator = await Creator.findByPk(req.params.id);
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      const allCreators = await Creator.findAll({
        where: {
          id: { [Op.ne]: creator.id }
        },
        limit: 20
      });
      
      const recommendations = await generateMatchingRecommendations(creator, allCreators);
      
      res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        ...recommendations
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreatorPosts(req, res) {
    try {
      const creator = await Creator.findByPk(req.params.id);
      
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found' });
      }
      
      // Fetch recent posts from social media platforms
      const posts = await socialMediaFetcher.fetchCreatorPosts(creator);
      
      res.json({
        creator_id: creator.id,
        creator_name: creator.full_name,
        platforms: {
          instagram: creator.instagram || null,
          youtube: creator.youtube || null,
          tiktok: creator.tiktok || null,
          twitter: creator.twitter || null
        },
        posts: posts,
        total_posts: posts.length,
        fetched_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching creator posts:', error);
      res.status(500).json({ 
        error: 'Failed to fetch social media posts',
        message: error.message 
      });
    }
  }
};

module.exports = creatorController;
