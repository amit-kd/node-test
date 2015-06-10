// the app/scripts/main.js file, which defines our RequireJS config
require.config({
    paths: {
        angular: '../assets/libs/angular.min',
        router:'../assets/libs/angular-ui-router.min',
        domReady: '../assets/libs/domReady',
        //jquery: '../assets/libs/jquery.min',
        //bootstrap: '../assets/libs/bootstrap.min',
        angularUI:'../assets/libs/ui-bootstrap-tpls.min'
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
        angularUI:{ 
          deps: ['angular'],         
          exports: 'angularUI'
        },
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
  'angularUI',  
  'app.constant',
  'components/login/loginModule',
  'components/login/loginService',
  'components/login/tokenInterceptor',
  'components/login/loginDirective',
  'components/login/loginController',   
  'components/register/registerModule',
  'components/register/registerService',
  'components/register/registerController'  
  // Any individual controller, service, directive or filter file
  // that you add will need to be pulled in here.
],
  function (angular,router, app,domReady) {
      'use strict';
      app.config(['$stateProvider','$urlRouterProvider',
        function ($stateProvider,$urlRouterProvider) {
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
            }); 
        }
      ]);
      domReady(function () {
          angular.bootstrap(document, ['iChat']);

          // The following is required if you want AngularJS Scenario tests to work
          //$('html').addClass('ng-app: iChat');
      });
  }
);
