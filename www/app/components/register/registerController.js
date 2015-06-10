define(['components/register/registerModule'],
    function (registerModule) {
        registerModule.controller('registerCtrl',
            ['$scope', '$location', '$window', 'registerService', 'loginService',function ($scope,$location, $window, registerService, loginService) {
	$scope.showModal = false;
    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };
    $scope.register = function register(username, password, passwordConfirm) {
            if (loginService.isAuthenticated) {
                $location.path("/chat");
            }
            else {
                registerService.register(username, password, passwordConfirm).success(function(data) {
                    $location.path("/login");
                }).error(function(status, data) {
                    console.log(status);
                    console.log(data);
                });
            }
    }
    }]);
});