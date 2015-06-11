var AuthnicateAdmnistrator = function(){}, authBase = require('../BLL/authnicateBase.js');
AuthnicateAdmnistrator.prototype.postRegister=function(postJson,callback){
	authBase.postRegister(postJson,callback);
};
AuthnicateAdmnistrator.prototype.postAuthnicate=function(postJson,callback){
	authBase.postAuthnicate(postJson,callback);
};
module.exports = AuthnicateAdmnistrator;