define(['angular','router','angularUI','components/login/loginModule', 'components/register/registerModule'], function (angular) {
  return angular.module('iChat', ['ui.router','ui.bootstrap','loginModule', 'registerModule']);
});