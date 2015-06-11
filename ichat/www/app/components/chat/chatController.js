define(['components/chat/chatModule'],
    function (chatModule) {
        chatModule.controller('chatCtrl',
            ['$scope', '$window', '$state', 'chatService', 'loginService',function ($scope,$window, $state, chatService, loginService) {
         $scope.init = function () {     
            if (!$window.sessionStorage.token) {
                $state.go("register");
            }
        };
        $scope.init();
        $scope.logout = function () {
            delete $window.sessionStorage.token;     
        };        
    }]);
});