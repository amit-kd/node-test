function App(appConfig) { 
  this.start = function(callback) {
    var jwt    = require('jsonwebtoken'), // used to create, sign, and verify tokens
    DALObj = require('./DAL/DALObj.js'), express = require('express'), app = express(), server, routeConfigurator = require('./routeConfigurator.js'),

    mongoose = require('mongoose');
    GLOBAL.LEAP = {}; // making LEAP as global variable   
    LEAP.EVENTS = {};
    LEAP.ERROR_ENUM = require('./ERROR_ENUM.js');
   
    process.on('uncaughtException', function(err) {      
      console.log(err);
       setTimeout(function() {
          process.exit(1);
        }, appConfig.serverErrorShutdownTime);
    });
 
    routeConfigurator.configureRoutes(app, appConfig);
 
    var dbStartup = function(callback) {        
        var db;
        mongoose.connect('mongodb://localhost/test');
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', callback);
    };
 
    dbStartup(function(err) {
      var i=0;
      if (err) {
        console.error('caught error in dbStartup', err, err.stack);
        return callback(err);
      } else {
        DALObj.buildSchema(appConfig.DBConfig.SchemaModels);
        console.info('About to start server in port: ',
                appConfig.serverPort);
        server = app.listen(appConfig.serverPort, function() {
          console.info(appConfig.appName + ' running on %s:%d',
                  appConfig.baseUri, server.address().port);          
          if (callback) {
            callback();
          }
          // app.server = server;
          global.serverInstance = server;
        });
      }
    }); 
  };
}
 
module.exports = App;