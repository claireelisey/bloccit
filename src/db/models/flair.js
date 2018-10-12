'use strict';

module.exports = (sequelize, DataTypes) => {

  const Flair = sequelize.define('Flair', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});

  Flair.associate = function(models) {

    // associations can be defined here
    Flair.belongsTo(models.Post, {
      foreignKey: "postId",
      as: "flairs",
      onDelete: "CASCADE"
    });
    
  };
  return Flair;
};