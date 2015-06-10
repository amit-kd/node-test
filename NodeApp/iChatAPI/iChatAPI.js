var appConfig = require('./appConfig.json'), iChatAPIapp = new(require('../libs/App.js'))(appConfig);
iChatAPIapp.start();
module.exports = iChatAPIapp;