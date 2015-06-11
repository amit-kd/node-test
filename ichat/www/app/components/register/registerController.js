define(['components/register/registerModule'],
    function (registerModule) {
        registerModule.controller('registerCtrl',
            ['$scope', '$state', '$window', 'registerService', 'loginService',function ($scope,$state, $window, registerService, loginService) {
	$scope.showModal = false;
    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };
    $scope.register = function register(username, password, passwordConfirm) {       
            if ($window.sessionStorage.token) {
                $state.go("/chat");
            }
            else {
                if(password === passwordConfirm){
                registerService.register(username, password, passwordConfirm).success(function(data) {
                    username="";
                    password="";
                    passwordConfirm="";
                    $state.go("register.login");
                }).error(function(data,status) {
                    alert(data.errors[0].errorCode);
                    console.log(status);
                });    
            }else{
                alert("password is not matching!")
            }
                
            }
    }
    }]);
});