'use strict';
module.exports = function(sequelize, DataTypes) {
	var userFavorites = sequelize.define('userFavorites', {
		userId: DataTypes.INTEGER,
		favoriteId: DataTypes.INTEGER
	},{
		classMethods: {
			associate: function(models) {
			// associations can be defined here
			}
		}
		});
	return userFavorites;
};