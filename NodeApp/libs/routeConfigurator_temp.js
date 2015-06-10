var routeConfigurator = {
  configureRoutes: function(app, appConfig) {
 
    var i = 0, j = 0, express = require('express'), router = express.Router(), bodyParser,
 
    fileDownload = require("./fileDownload"),
 
    xmlparser = require('express-xml-bodyparser'),
 
    cBusboy = require('connect-busboy')({
      limits: {
        fileSize: appConfig.fileUploadOptions.fileSizeLimit
      }
    }),
 
    fileUpload = require("./fileUpload"),
 
    moduleConfig, folderPath, utils = require('./utils.js'), errs, events, extend = require('extend'),
 
    handleRoute = function(uriOptions) {
      var FileHandler = require(folderPath + uriOptions.routeHandler),
 
      requestHandler = function(req, res) {
        LEAP.logger.debug('inside page specific route middleware');
        var empAdmin = new (require('../userManagementApp/modules/employeeManagement/BLL/employeeAdministrator.js'))(),
 
        sendBackResponse = function(err, data, metaData) {
          res.set({
            'transactionId': process.domain.data.transactionId,
            'TJTransactionId': process.domain.data.TJTransactionId
          });
 
          if (err) {
            LEAP.logger.error(err);
            var httpStatusCode = 400;
            if (err.errorCode === LEAP.ERROR_ENUM.INTERNAL_SERVER_ERROR.errorCode) {
              httpStatusCode = 500;
            } else if (err.errorCode === LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED.errorCode) {
              httpStatusCode = 401;
            }
 
            res.status(httpStatusCode).json({
              "errors": (err.length) ? err : [err]
            });
            return;
          }
 
          if (uriOptions.isFileDownload) {
            if (data.dbFileID && data.mongofileCollection) {
              fileDownload.sendFile({
                dbFileID: data.dbFileID,
                mongofileCollection: data.mongofileCollection,
                res: res
              });
            } else {
              res.set({
                'Content-disposition': 'attachment; filename=' + data.fileName
              });
              res.end(data.data);
            }
          } else if (uriOptions.serviceId === 'GetUploadSummaryLog') {
            res.set({
              'transactionId': process.domain.data.transactionId,
              'Content-disposition': 'attachment; filename='
                      + data.download.fileName,
              'Content-Type': 'multipart/form-data'
            });
            res.end(data.download.csvData, 'binary');
          } else if (uriOptions.serviceId === 'GetAttachments') {
            res
                    .set({
                      'transactionId': process.domain.data.transactionId,
                      'Content-disposition': 'attachment; filename='
                              + 'Attachment.pdf',
                      'Content-Type': 'multipart/form-data'
                    });
            data.pipe(res);
            LEAP.logger.info('Email Attachment Download Request Served ');
          } else {
            res.set('LEAP_MetaData', JSON.stringify(metaData));
            res.json(data);
          }
          LEAP.logger.info('Request Served');
          // next();
          return;
        },
 
        onGetUserEntitlements = function(err, results) {
          if (err) {
            LEAP.logger.error("Error in retriving user entitlements: ",
                    err.stack);
 
            sendBackResponse(utils
                    .createError(LEAP.ERROR_ENUM.INTERNAL_SERVER_ERROR));
            return;
          }
 
          if (results.length) {
            process.domain.data.userContext.coreActivities = results[0].coreActivities;
            process.domain.data.userContext.roles = results[0].roles;
            process.domain.data.userContext.leapFunctions = results[0].leapFunctions;
            process.domain.data.userContext.branchIDs = results[0].branchIDs;
          }
 
          if (uriOptions.entitlements && uriOptions.entitlements.length) {
            if (!results.length) {
              sendBackResponse(utils
                      .createError(LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED));
              return; // break out of onGetUserEntitlements
            }
            var entitlementsSatisfied = false;
            uriOptions.entitlements.some(function(innerEntitlementSet) {
              if (!innerEntitlementSet.some) {
                entitlementsSatisfied = false; // temp workaround to avoid
                // crash
              } else {
                innerEntitlementSet.some(function(entitlement) {
                  entitlementsSatisfied = results[0].coreActivities
                          .indexOf(entitlement) > -1;
                  if (!entitlementsSatisfied) { return true; // break out of
                  // innerEntitlementSet
                  }
                });
              }
              if (entitlementsSatisfied) { return true; // break out of all
              // the entitlements
              }
            });
            if (!entitlementsSatisfied) {
              sendBackResponse(utils
                      .createError(LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED));
              return; // break out of onGetUserEntitlements
            }
          }
 
          var page = new FileHandler();
          page.processRequest(req, sendBackResponse);
          return;
        };
 
        if (!uriOptions.isFileUpload) {
          if ((req.method === 'POST' || req.method === 'PUT')
                  && ((!req.get('Content-Type')) || (req.get('Content-Type')
                          .indexOf('application/json') !== 0 && req.get(
                          'Content-Type').indexOf('application/xml') !== 0))) {
            res
                    .status(400)
                    .send(
                            'Unsupported Content-Type. This server route accepts only Content-Type : application/json and application/xml');
            LEAP.logger.info('Request Served');
            return;
          }
        }
 
        process.domain.data.serviceId = uriOptions.serviceId; // the
        // service id will now be available in the context object
 
        process.domain.data.productGroup = uriOptions.productGroup
                || process.domain.data.productGroup;
 
        if (!process.domain.data.userContext.userId) {
          // sendBackResponse(utils
          // .createError(LEAP.ERROR_ENUM.USER_AUTHORIZATION_FAILED));
          // return;
        }
 
        empAdmin.getUserAuthorization(process.domain.data.userContext.userId
                || 'some junk', onGetUserEntitlements);
 
      };
      return requestHandler;
    },
 
    errorMiddleware = function(err, req, res, next) {
      var shutdownServer = function() {
        var killtimer;
 
        // stop taking new requests.
        LEAP.logger.info('Closing the server...');
        // app.server.close();
 
        // make sure we close down within 30 seconds
        killtimer = setTimeout(function() {
          LEAP.logger.info('exiting...');
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
        LEAP.logger.info('sending final response before closing down');
        res.set({
          'transactionId': (process.domain) ? process.domain.data.transactionId
                  : '',
          'TJTransactionId': (process.domain)
                  ? process.domain.data.TJTransactionId : ''
        });
        var internalServerError = utils
                .createError(LEAP.ERROR_ENUM.INTERNAL_SERVER_ERROR);
        if (process.env.NODE_ENV !== 'production') {
          internalServerError.innerError = err.stack;
        }
 
        res.status(500).json({
          errors: [internalServerError]
        });
        LEAP.logger.info('Request Served');
 
      };
 
      if (err) {
        LEAP.logger
                .error('errorMiddleware caught unhandled error: ', err.stack);
 
        // Note: we're in dangerous territory!
        // By definition, something unexpected occurred,
        // which we probably didn't want.
        // Anything can happen now! Be very careful!
 
        try {
          sendResponse();
          var reportCrash = require('./crashReporting.js');
          reportCrash(err, 'almost crashed.', appConfig, function(
                  crashReportingErr) {
            if (crashReportingErr) {
              LEAP.logger.error('Error in reporting the crash: ',
                      crashReportingErr, crashReportingErr.stack);
            }
            // shutdownServer();
          });
          return;
        } catch (err2) {
          // oh well, not much we can do at this point.
          LEAP.logger.error('Error sending 500!', err2.stack);
          return;
        }
      }
    },
 
    domainMiddleware = function(req, res, next) {
      var domain, domainUnHandledErrorHandler = function(err) {
 
        LEAP.logger.error('domain caught Unhandled Error', err.stack);
 
        errorMiddleware(err, req, res, next);
        return;
      };
 
      // create a domain
      domain = utils.createDomain();
      domain.on('error', domainUnHandledErrorHandler);
      domain.enter();
      domain.data.transactionId = utils.generateUuId();
      domain.data.productGroup = "AUTO";
      domain.data.userContext = {};
      domain.data.userContext.userId = req.get("UserId");
      domain.data.TJTransactionId = req.get("client_Transaction_Id");
      var trumobiHeader = req.get('x-trumobiContext');
      if (trumobiHeader) {
        try {
          trumobiHeader = JSON.parse(new Buffer(trumobiHeader, 'base64'));
          domain.data.userContext.userId = trumobiHeader.UserId;
          domain.data.TJTransactionId = trumobiHeader.TransactionID;
        } catch (err) {
          LEAP.logger
                  .warn('Error in parsing trumobi header as JSON', err.stack);
        }
      }
 
      LEAP.logger.info("Received request", {
        method: req.method,
        serverIP: req.hostname,
        serverPort: req.socket.localPort,
        url: req.url,
        reqHeaders: req.headers,
        clientIP: req.connection.remoteAddress
      });
      next();
    };
 
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
    router.use(xmlparser({
      trim: false,
      explicitArray: false
    }));
    // router.post('/collectionsapi/casedetails/receivexml', xmlparser());
    // add module specific route handlers
    for (i = 0; i < appConfig.modules.length; i++) {
      // console.log(modulesConfig.modules[i]);
      folderPath = '../' + appConfig.appName + '/modules/'
              + appConfig.modules[i] + '/';
      moduleConfig = require('config.json')(folderPath + 'config.json');
      for (j = 0; j < moduleConfig.uriSet.length; j++) {
        if (moduleConfig.uriSet[j].isFileUpload) {
          // add busboy middleware
          router.route(moduleConfig.uriSet[j].uri)[moduleConfig.uriSet[j].httpMethod]
                  (
                          cBusboy,
                          fileUpload({
                            serviceId: moduleConfig.uriSet[j].serviceId,
                            mongofileCollection: moduleConfig.uriSet[j].mongofileCollection,
                            isMiddleware: true,
                            productGroup: moduleConfig.uriSet[j].productGroup
                          }));
          LEAP.logger.info(
                  'Added connect-busboy and fileUpload middleware for Route:',
                  moduleConfig.uriSet[j].uri);
        }
        router.route(moduleConfig.uriSet[j].uri)[moduleConfig.uriSet[j].httpMethod]
                (handleRoute(moduleConfig.uriSet[j]));
        LEAP.logger.info('Added Route:', moduleConfig.uriSet[j]);
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
 
    // add app specific route handlers
    for (i = 0; i < appConfig.appLevelUris.length; i++) {
      if (appConfig.appLevelUris[i].isFileDownload) {
        router
                .route(appConfig.appLevelUris[i].uri)
                .get(
                        fileDownload
                                .getFileDownloadMiddleware(appConfig.appLevelUris[i].serviceId));
        LEAP.logger.info('Added Route:', appConfig.appLevelUris[i]);
        continue;
      }
      if (appConfig.appLevelUris[i].isFileUpload) {
        router.route(appConfig.appLevelUris[i].uri).post(cBusboy, fileUpload({
          serviceId: appConfig.appLevelUris[i].serviceId
        }));
        LEAP.logger.info('Added Route:', appConfig.appLevelUris[i]);
        continue;
      }
      folderPath = "./";
      router.route(appConfig.appLevelUris[i].uri)[appConfig.appLevelUris[i].httpMethod]
              (handleRoute(appConfig.appLevelUris[i]));
      LEAP.logger.info('Added Route:', appConfig.appLevelUris[i]);
    }
 
    Object.freeze(LEAP.ERROR_ENUM);
    Object.freeze(LEAP.EVENTS);
 
    // adding static file server for /libs/test folder
    router.use(express.static(__dirname + '/staticFiles'));
 
  }
 
};
 
module.exports = routeConfigurator;