define(['components/login/loginModule'],
  function (loginModule) {
      loginModule.factory('loginService', ['$http',
        function ($http) {
            return {
                 isAuthenticated: false,
                 signIn: function(username, password) {
                    return $http.post(options.api.base_url + '/signin', {username: username, password: password});
                 }
            };
        }]);
  });