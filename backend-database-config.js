// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;

// backend/src/models/Creator.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Creator extends Model {}

Creator.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    }
  },
  social_handles: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  primary_content_type: {
    type: DataTypes.STRING
  },
  audience_size: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  engagement_rate: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 100
    }
  },
  contact_date: {
    type: DataTypes.DATEONLY
  },
  source_of_contact: {
    type: DataTypes.STRING
  },
  potential_projects: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notes: {
    type: DataTypes.TEXT
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Creator',
  tableName: 'creators',
  timestamps: true,
  underscored: true
});

// backend/src/models/Interaction.js
class Interaction extends Model {}

Interaction.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creator_id: {
    type: DataTypes.UUID,
    references: {
      model: 'creators',
      key: 'id'
    }
  },
  interaction_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  project_context: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  potential_fit_score: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 10
    }
  }
}, {
  sequelize,
  modelName: 'Interaction',
  tableName: 'interactions',
  timestamps: true,
  underscored: true
});

// Associations
Creator.hasMany(Interaction, {
  foreignKey: 'creator_id',
  as: 'interactions'
});

Interaction.belongsTo(Creator, {
  foreignKey: 'creator_id',
  as: 'creator'
});

module.exports = {
  Creator,
  Interaction,
  sequelize
};
