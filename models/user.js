var bcrypt = require('bcrypt');

'use strict';
module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: {
    	type: DataTypes.STRING,
    	validate: {
    		len: [6, 20]
    	}  	
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.belongsToMany(models.favorites, {through: "userFavorites"});
      }, 
      authenticate: function(email, password, callback){
      	this.find({
      		where: {
      			email: email
      		}
      	}).then(function(user){
      		if(!user) return callback(null, false);
      		bcrypt.compare(password, user.password, function(err, results){
      			if (err) return callback(err);
      			callback(null, results ? user : false)
      		})
      	});
      }
    }, hooks: {
    	beforeCreate: function(user, options, callback){
    		if(user.password){
    			bcrypt.hash(user.password, 10, function(err, hash){
    				if(err) return callback(err);
    				user.password = hash;
    				callback(null, user);
    			})
    		}
    	}
    }
  });
  return user;
};