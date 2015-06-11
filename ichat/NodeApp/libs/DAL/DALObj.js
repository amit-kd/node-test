var schemaObjs = {};
var DALObj = {};
DALObj.buildSchema=function (schemaObjConfig) {
	for(i=0;i<schemaObjConfig.length;i++){
        schemaObjs[schemaObjConfig[i].ref] = require(schemaObjConfig[i].path);
    }
};
DALObj.save=function (modelName,value,callback) {
	var model = new(schemaObjs[modelName])(value);
	model.save(callback);
};
DALObj.findOne=function (modelName,value,callback) {
	schemaObjs[modelName].findOne(value,callback);
};
module.exports = DALObj;