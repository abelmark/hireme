'use strict';
module.exports = function(sequelize, DataTypes) {
  var favorites = sequelize.define('favorites', {
    title: DataTypes.STRING,
    company: DataTypes.STRING,
    site: DataTypes.STRING,
    description: DataTypes.TEXT,
    url: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return favorites;
};