var domain = require('domain'),  uuid = require('node-uuid'), utils = {
	createDomain:function(){
		return domain.create();
	},
	createError:function (err) {
		return {err:err
		};
	},
	generateUuId:function(){
		return uuid.v4();
	}
};
module.exports = utils;