// the app/scripts/main.js file, which defines our RequireJS config
require.config({
    paths: {
        angular: '../assets/libs/angular.min',
        router:'../assets/libs/angular-ui-router.min',
        domReady: '../assets/libs/domReady',
        //jquery: '../assets/libs/jquery.min',
        //bootstrap: '../assets/libs/bootstrap.min',
        angularUI:'../assets/libs/ui-bootstrap-tpls.min',
        socketIo:'../assets/libs/socket.io-1.2.0',
        socket:'../assets/libs/ng-socket-io'
    },
    shim: {
        angular: {  
            //deps: ['jquery'],            
            exports: 'angular'
        },
        router:{
          deps: ['angular'],
          exports: 'router'
        },
        socket:{
          deps: ['angular'],
          exports: 'socket'
        },
        angularUI:{ 
          deps: ['angular'],         
          exports: 'angularUI'
        }
        // bootstrap:{
        //   deps: ['jquery'],
        //   exports: 'bootstrap'
        // }
    }
});

require([
  'angular', 
  'router', 
  'app.module',
  'domReady',  
  //'jquery', 
  //'bootstrap',
  'socketIo',
  'socket',
  'angularUI',  
  'app.constant',
  'components/login/loginModule',
  'components/login/loginService',
  'tokenInterceptor',
  'components/login/loginDirective',
  'components/login/loginController',   
  'components/register/registerModule',
  'components/register/registerService',
  'components/register/registerController',
  'components/chat/chatModule',
  'components/chat/chatService',
  'components/chat/chatController'  
  // Any individual controller, service, directive or filter file
  // that you add will need to be pulled in here.
],
  function (angular,router, app,domReady) {
      'use strict';
      app.config(['$stateProvider','$urlRouterProvider','$httpProvider',
        function ($stateProvider,$urlRouterProvider,$httpProvider) {                    
            $httpProvider.interceptors.push('tokenInterceptor');
            $urlRouterProvider.otherwise('/register');
            $stateProvider
            .state('register', {
              url: "/register",
              templateUrl: 'app/components/register/registerView.html',
              controller: 'registerCtrl'
            })
            .state('register.login', {              
              templateUrl: 'app/components/login/loginView.html',
              controller: 'loginCtrl'
            })
            .state('/chat', {
              url:"/chat",         
              templateUrl: 'app/components/chat/chatView.html',
              controller: 'chatCtrl'
            });
        }
      ]);
      domReady(function () {
          angular.bootstrap(document, ['iChat']);
          angular.element(document.querySelector('body')).addClass('ng-app: iChat');

          // The following is required if you want AngularJS Scenario tests to work
          //$('html').addClass('ng-app: iChat');
      });
  }
);
