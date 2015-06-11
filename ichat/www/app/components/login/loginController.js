// define(['components/login/loginModule'],
//     function (loginModule) {
//         loginModule.controller('loginCtrl',
//             ['$scope','$location', '$window', '$modal','loginService',function ($scope,$location, $window,$modal, loginService) {
//               $scope.signIn = function signIn(username, password) {
//                   if (username != null && password != null) {
//                       loginService.signIn(username, password).success(function(data) {
//                           loginService.isAuthenticated = true;
//                           $window.sessionStorage.token = data.token;
//                           $location.path("/chat");
//                       }).error(function(status, data) {
//                           console.log(status);
//                           console.log(data);
//                       });
//                   }
//               }
//     }]);
// });


define(['components/login/loginModule'],
    function (loginModule) {
        loginModule.controller('modalCtrl', ['$scope', '$modalInstance','$state',
          function($scope, $modalInstance,$state) {
            $scope.ok = function (user) {             
             $state.go('^');
              $modalInstance.close(user);
            };

            $scope.cancel = function () {
              $state.go('^');
              $modalInstance.dismiss('cancel');
            };
          }
        ]).controller('loginCtrl',
            ['$scope','$state', '$window', '$modal','loginService',function ($scope,$state, $window,$modal, loginService) {              
              $scope.init = function () {               
                var modalInstance = $modal.open({
                  animation: true,                 
                  templateUrl: 'myModalContent.html',
                  controller: 'modalCtrl' ,
                  size: 'sm'          
                });

                modalInstance.result.then(function (user) {
                   $scope.signIn(user.username,user.password);
                });
              };
              $scope.init();
              $scope.signIn = function signIn(username, password) {
                  if (username != null && password != null) {
                      loginService.signIn(username, password).success(function(data) {
                          loginService.isAuthenticated = true;
                          $window.sessionStorage.token = data.token;
                          $state.go("/chat");
                      }).error(function(status, data) {
                          console.log(status);
                          console.log(data);
                      });
                  }
              }
    }]);
});