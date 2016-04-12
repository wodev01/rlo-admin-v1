'use strict';
app.factory('groupService',['$q', 'ErrorMsg',
  function($q, ErrorMsg) {
    var groupService = {};

    //Get groups for current user partner:
    groupService.fetchGroups = function(){
      var defer = $q.defer();
      CarglyPartner.ajax({
        url: '/partners/api/groups',
        type: 'GET',
        success: function (data) {
          console.log("Get group data: ",data);
          defer.resolve(data);
        },
        error:function(error) {
          ErrorMsg.CheckStatusCode(error.status);
          defer.resolve(error);
        }
      });
      return defer.promise;
    };


    return groupService;
  }
]);
