'use strict';
app.factory('clientUsersService',['$q', 'ErrorMsg',
  function($q, ErrorMsg) {
      var clientUsersService = {};

      //Get users data
      clientUsersService.fetchUsersByPartnerId = function(partnerId){
          var defer = $q.defer();
              CarglyPartner.ajax({
                  url: '/partners/api/'+partnerId+'/users',
                  type: 'GET',
                  success: function (data) {
                      defer.resolve(data);
                  },
                  error:function(error) {
                      ErrorMsg.CheckStatusCode(error.status);
                      defer.reject(error);
                  }
              });
          return defer.promise;
      };

      /*-------------- Getter and Setter Method ---------*/
      var userObj = {};
      clientUsersService.setUserObj = function(newObj){
        userObj = newObj;
      };
      clientUsersService.getUserObj = function(){
        return userObj;
      };
      return clientUsersService;
  }]);
