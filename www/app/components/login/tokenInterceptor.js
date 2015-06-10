define(['components/login/loginModule'],
  function (loginModule) {
      loginModule.factory('tokenInterceptor', ['$q', '$window', '$location', 'loginService',
        function ($q, $window, $location, loginService) {
            return {
                 request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function (response) {
            if (response != null && response.status == 200 && $window.sessionStorage.token && !loginService.isAuthenticated) {
                loginService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection != null && rejection.status === 401 && ($window.sessionStorage.token || loginService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                loginService.isAuthenticated = false;
                $location.path("/login");
            }

            return $q.reject(rejection);
        }
            };
        }]);
  });