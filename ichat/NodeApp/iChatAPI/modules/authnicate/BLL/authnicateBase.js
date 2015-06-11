var authnicateBase = {}, DALObj = require('../../../../libs/DAL/DALObj.js'),config = require('../../../appConfig.json'),jwt = require('jsonwebtoken');
authnicateBase.postRegister=function(postJson,callback){
	if(postJson && postJson.phoneNo && postJson.password){
		DALObj.findOne('Users',{phoneNo:postJson.phoneNo},function(err,user){
			if(err){
				callback(err);
			}else if(user && user.phoneNo){
				callback({errorCode:'User already exists!'});
			}
			else{
				DALObj.save('Users',postJson,callback);
			}
		});
	}else{
		callback({errorCode:'request body is missing phoneNo & password!'})
	}	
};
authnicateBase.postAuthnicate=function(postJson,callback){
	if(postJson && postJson.phoneNo && postJson.password){
		DALObj.findOne('Users',{phoneNo:postJson.phoneNo},function(err,user){
			var token;
			if(err){
				callback(err);
			}else if(user && user.phoneNo && user.password){
				if (user.password != postJson.password) {
			       callback({errorCode:'Password is not correct!'});
			    } else {
			    	token = jwt.sign(user, config.secret, {
          				expiresInMinutes: config.tokenExpiresInMinutes
        			});
        			callback(null,{token:token})
			    }				
			}
			else{
				callback({errorCode:'User does not exists!'})
			}
		});
	}else{
		callback({errorCode:'request body is missing phoneNo & password!'})
	}	
};
module.exports = authnicateBase;