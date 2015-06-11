define(['components/login/loginModule'],
  function (loginModule) {
      loginModule.factory('loginService', ['$http','options',
        function ($http,options) {
            return {
                 isAuthenticated: false,
                 signIn: function(username, password) {
                    return $http.post(options.api.baseUrl + '/authnicate', {phoneNo: username, password: password});
                 }
            };
        }]);
  });