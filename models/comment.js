const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Comment = sequelize.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  parentId: {                       // stores the commentId of parent Comment 
    type: Sequelize.INTEGER,
    allowNull: false,
    default: -1
  },
  level: {
    type: Sequelize.INTEGER,        // As of now there is no use of level directly but can be very useful in future 
    allowNull: false                
  },
  deleted: {
    type: Sequelize.INTEGER,
    allowNull: false,
    default: 0
  }
});

module.exports = Comment;
