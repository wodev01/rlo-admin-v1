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
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //retrieve all the clients for RLO
        groupService.fetchClients = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients',
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //retrieve the clients using filter for RLO
        groupService.fetchClientsUsingFilter = function(filter){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients?filter='+filter,
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                  ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //Delete a member partner from a group. Requires that current user has access to partner as either an agent or coach.
        groupService.deleteMemberPartnerFromGroup = function(groupId, partnerId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/groups/'+ groupId +'/members/' + partnerId,
                type: 'DELETE',
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        // Fetch all members of the group
        groupService.fetchGroupMembers = function(groupId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/groups/'+ groupId +'/members',
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        /*-------------- Getter and Setter Method ---------*/
        var groupObj = {};
        groupService.setGroupObj = function(newObj){
          groupObj = newObj;
        };
        groupService.getGroupObj = function(){
          return groupObj;
        };

        return groupService;
    }
]);
