define(['components/chat/chatModule'],
  function (chatModule) {
      chatModule.factory('chatService', [
        function () {
            return {
                  sendMessage: function(message) {                   
                    
                  }
            };
        }]);
  });