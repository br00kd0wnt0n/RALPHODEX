const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Creator = sequelize.define('Creator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  social_handles: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tiktok: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtube: {
    type: DataTypes.STRING,
    allowNull: true
  },
  twitter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook_followers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  demographics: {
    type: DataTypes.JSONB,
    defaultValue: {
      young_adult_percentage: 0,
      us_followers_percentage: 0,
      age_brackets: {},
      countries: {}
    }
  },
  primary_content_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  audience_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  engagement_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.0
  },
  contact_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  source_of_contact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  potential_projects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // New fields for metrics, analysis, and conversations
  metrics_updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metrics_by_platform: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  activity_score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.0
  },
  verification: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  analysis_metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  conversation_terms: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  conversation_terms_by_platform: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  last_comment_fetch_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'creators',
  timestamps: true,
  underscored: true
});

module.exports = Creator;
