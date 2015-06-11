'use strict';
 
var routeConfigurator = {
  configureRoutes: function(app, appConfig) {
 
    var i = 0, j = 0, express = require('express'), router = express.Router(), bodyParser,
 
    moduleConfig, folderPath,utils = require('./utils.js'),  errs, events, extend = require('extend'),
 
    handleRoute = function(uriOptions) {
      var FileHandler = require(folderPath + uriOptions.routeHandler),
 
      requestHandler = function(req, res) {
        console.info('inside page specific route middleware');      
 
        var sendBackResponse = function(err, data, metaData) {
          res.set({
            'transactionId': process.domain.data.transactionId            
          });
 
          if (err) {
            console.error(err);
            var httpStatusCode = 400;
            if (err.errorCode === LEAP.ERROR_ENUM.INTERNAL_SERVER_ERROR) {
              httpStatusCode = 500;
            } else if (err.errorCode === LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED) {
              httpStatusCode = 401;
            }
 
            res.status(httpStatusCode).json({
              "errors": (err.length) ? err : [err]
            });
            return;
          }

          res.json(data);
          console.info('Request Served');
          // next();
          return;
        };
 
        process.domain.data.serviceId = uriOptions.serviceId; // the
        // service id will now be available in the context object      
 
        if (!process.domain.data.userContext.userId) {
          // sendBackResponse(utils
          // .createError(LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED));
          // return;
        }
        var page = new FileHandler();
        page.processRequest(req, sendBackResponse);
        return;
      };
      return requestHandler;
    },
 
    errorMiddleware = function(err, req, res, next) {
      var shutdownServer = function() {
        var killtimer;
 
        // stop taking new requests.
        console.info('Closing the server...');
        // app.server.close();
 
        // make sure we close down within 30 seconds
        killtimer = setTimeout(function() {
         console.info('exiting...');
          process.exit(1);
        }, appConfig.serverErrorShutdownTime);
        // But don't keep the process open just for that!
        // killtimer.unref();
 
        // Let the master know we're dead. This will trigger a
        // 'disconnect' in the cluster master, and then it will fork
        // a new worker.
        // cluster.worker.disconnect();
      },
 
      sendResponse = function() {
        // try to send an error to the request that triggered the
        // problem
        console.info('sending final response before closing down');
        res.set({
          'transactionId': (process.domain) ? process.domain.data.transactionId
                  : ''
        });
        var internalServerError = utils
                .createError(LEAP.ERROR_ENUM.INTERNAL_SERVER_ERROR);
        if (process.env.NODE_ENV !== 'production') {
          internalServerError.innerError = err.stack;
        }
 
        res.status(500).json({
          errors: [internalServerError]
        });
        console.info('Request Served'); 
      };
 
      if (err) {
        console.error('errorMiddleware caught unhandled error: ', err.stack);
 
        // Note: we're in dangerous territory!
        // By definition, something unexpected occurred,
        // which we probably didn't want.
        // Anything can happen now! Be very careful!
 
        try {
          sendResponse();          
          return;
        } catch (err2) {
          // oh well, not much we can do at this point.
          console.error('Error sending 500!', err2.stack);
          return;
        }
      }
    },
 
    domainMiddleware = function(req, res, next) {
      var domain, domainUnHandledErrorHandler = function(err) {
 
        console.error('domain caught Unhandled Error', err.stack);
 
        errorMiddleware(err, req, res, next);
        return;
      };
 
      // create a domain
      domain = utils.createDomain();
      domain.on('error', domainUnHandledErrorHandler);
      domain.enter();
      domain.data={};
      domain.data.transactionId = utils.generateUuId();     
      domain.data.userContext = {};
      domain.data.userContext.userId = req.get("UserId");      
       
      console.info("Received request", {
        method: req.method,
        serverIP: req.hostname,
        serverPort: req.socket.localPort,
        url: req.url,
        reqHeaders: req.headers,
        clientIP: req.connection.remoteAddress
      });
      next();
    },
    secureMiddileware = function(req,res,next){
      console.log("Adding secure");
      // check header or url parameters or post parameters for token
      var token = req.body.token || req.query.token || req.headers['x-access-token'],sendResponse = function(err,status) { 
        console.error('secure caught token Error',err);         
        res.set({
          'transactionId': (process.domain) ? process.domain.data.transactionId
                      : ''
        });
        res.status(status).json({
          errors: [err]
        });
        console.info('Request Served');        
        return;
      };

      // decode token
      if (token) {
        // verifies secret and checks exp
        jwt.verify(token, appConfig.secret, function(err, decoded) {      
          if (err) {
            var authorizationError = utils
                .createError(LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED);   
            sendResponse(authorizationError,401);              
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            console.log('decoded',decoded);
            next();
          }
        });

      } else {
        var tokenError = utils
                .createError(LEAP.ERROR_ENUM.TOKEN_NOT_FOUND);   
        sendResponse(tokenError,403);       
      }
    },crossDomainHandler =function (req,res,next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "content-type,accept,x-access-token,authorization");      
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
      if (req.method == 'OPTIONS') {
        res.status(200).end();
      } else {
        next();
      }    
    };
    app.all('/', crossDomainHandler);
    app.use(crossDomainHandler);
    app.use(appConfig.baseUri, router);
 
    // route middle ware that will be called on every request. This is the first
    // middle ware in the chain
    router.use(domainMiddleware);
    app.use(errorMiddleware);    
    // parse the req body... need to bind the domain after it returns...
    // otherwise there is a issue that previous domain is being given
    bodyParser = function(req, res, next) {
      var jsonBodyParser = require('body-parser').json();
      jsonBodyParser(req, null, process.domain.bind(function() {
        next();
      }));
    };
    router.post('*', bodyParser);
    router.put('*', bodyParser);
    router['delete']('*', bodyParser);   
    
    // add module specific unsecured route handlers
    for (i = 0; i < appConfig.modules.length; i++) {
      // console.log(modulesConfig.modules[i]);
      folderPath = '../' + appConfig.appName + '/modules/'
              + appConfig.modules[i] + '/';              
      moduleConfig = require('config.json')(folderPath + 'config.json');
      for (j = 0; j < moduleConfig.uriSet.length; j++) {   
        if(!moduleConfig.uriSet[j].isSecured){
          router.route(moduleConfig.uriSet[j].uri)[moduleConfig.uriSet[j].httpMethod]
                        (handleRoute(moduleConfig.uriSet[j]));
          console.info('Added Route:', moduleConfig.uriSet[j]);
        }        
      }
      // add the errors if it exists to global error
      errs = moduleConfig.errors;
      if (errs) {
        extend(true, LEAP.ERROR_ENUM, errs);
      }
 
      events = moduleConfig.events;
      if (events) {
        extend(true, LEAP.EVENTS, events);
      }
    }
 
    // add app specific unsecured route handlers
    for (i = 0; i < appConfig.appLevelUris.length; i++) {      
      folderPath = "./";
      if(!appConfig.appLevelUris[i].isSecured){
         router.route(appConfig.appLevelUris[i].uri)[appConfig.appLevelUris[i].httpMethod]
              (handleRoute(appConfig.appLevelUris[i]));
      }      
      console.info('Added Route:', appConfig.appLevelUris[i]);
    }

    router.use(secureMiddileware);

    // add module specific secured route handlers
    for (i = 0; i < appConfig.modules.length; i++) {
      // console.log(modulesConfig.modules[i]);
      folderPath = '../' + appConfig.appName + '/modules/'
              + appConfig.modules[i] + '/';              
      moduleConfig = require('config.json')(folderPath + 'config.json');
      for (j = 0; j < moduleConfig.uriSet.length; j++) {   
        if(moduleConfig.uriSet[j].isSecured){         
         router.route(moduleConfig.uriSet[j].uri)[moduleConfig.uriSet[j].httpMethod]
                        (handleRoute(moduleConfig.uriSet[j]));
           console.info('Added Route:', moduleConfig.uriSet[j]);
        }       
      }      
    }
 
    // add app specific secured route handlers
    for (i = 0; i < appConfig.appLevelUris.length; i++) {      
      folderPath = "./";
      if(appConfig.appLevelUris[i].isSecured){
         router.route(appConfig.appLevelUris[i].uri)[appConfig.appLevelUris[i].httpMethod]
              (handleRoute(appConfig.appLevelUris[i]));
        console.info('Added Route:', appConfig.appLevelUris[i]);
      }      
    }
 
    Object.freeze(LEAP.ERROR_ENUM);
    Object.freeze(LEAP.EVENTS);
 
    // adding static file server for /libs/test folder
    router.use(express.static(__dirname + '/www'));
 
  }
 
};
 
module.exports = routeConfigurator;