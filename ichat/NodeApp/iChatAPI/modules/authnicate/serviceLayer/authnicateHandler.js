var authAdmin = new(require('../Facade/authnicateAdmnistrator.js')), authnicateHandler = function(){	
};
authnicateHandler.prototype.processRequest = function(req,callback) {
	var path = req.path.substring(req.path.length-1)==='/'?req.path.substring(0,req.path.length-1):req.path;	
	console.log(req.body);
	switch(path){
		case '/authnicate/register':
		authAdmin.postRegister(req.body,callback);
		break;	
		case '/authnicate':
		authAdmin.postAuthnicate(req.body,callback);
		break;
		default:
		callback({errorCode:'Url is not matching!!!'})	
	}	
};
module.exports = authnicateHandler