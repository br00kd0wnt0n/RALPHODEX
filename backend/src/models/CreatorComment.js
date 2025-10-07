const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Creator = require('./Creator');

const CreatorComment = sequelize.define('CreatorComment', {
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
  author_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'creator_comments',
  timestamps: true,
  underscored: true
});

Creator.hasMany(CreatorComment, { foreignKey: 'creator_id', as: 'comments' });
CreatorComment.belongsTo(Creator, { foreignKey: 'creator_id', as: 'creator' });

module.exports = CreatorComment;

