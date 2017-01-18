'use strict';
module.exports = function(sequelize, DataTypes) {
	var favorite = sequelize.define('favorite', {
		title: DataTypes.STRING,
		company: DataTypes.STRING,
		site: DataTypes.STRING,
		description: DataTypes.TEXT,
		url: DataTypes.TEXT
	}, {
	classMethods: {
		associate: function(models) {
		// associations can be defined here
			models.favorite.belongsToMany(models.user, {through: "userFavorites"});
		}
	}
	});

return favorite;

};