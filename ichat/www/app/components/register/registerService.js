define(['components/register/registerModule'],
  function (registerModule) {
      registerModule.factory('registerService', ['$http','options',
        function ($http,options) {
            return {
                  register: function(username, password, passwordConfirmation) {                   
                    var req = {
                      url:options.api.baseUrl + '/authnicate/register',
                      method:'POST',
                      data:{phoneNo: username, password: password },
                      config:{
                        headers:{
                          'Content-Type':'application/json'
                        }
                      }
                    };
                    return $http.post(req.url,req.data);
                  }
            };
        }]);
  });