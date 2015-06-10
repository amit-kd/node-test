define(['components/register/registerModule'],
  function (registerModule) {
      registerModule.factory('registerService', ['$http','options',
        function ($http,options) {
            return {
                  register: function(username, password, passwordConfirmation) {
                      return $http.post(options.api.base_url + '/register', {username: username, password: password, passwordConfirmation: passwordConfirmation });
                  }
            };
        }]);
  });