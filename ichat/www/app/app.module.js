define(['angular','router','socket','angularUI','components/login/loginModule', 'components/register/registerModule','components/chat/chatModule'], function (angular) {
  return angular.module('iChat', ['ui.router','socket-io','ui.bootstrap','loginModule', 'registerModule','chatModule']);
});