const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Creator = require('./Creator');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  creator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Creator,
      key: 'id'
    }
  },
  interaction_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  project_context: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  potential_fit_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 10
    }
  }
}, {
  tableName: 'interactions',
  timestamps: true,
  underscored: true
});

Creator.hasMany(Interaction, { foreignKey: 'creator_id', as: 'interactions' });
Interaction.belongsTo(Creator, { foreignKey: 'creator_id', as: 'creator' });

module.exports = Interaction;