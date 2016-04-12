'use strict';
app.factory('userService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var userService = {};

        //Get users data
        userService.fetchUsers = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/users',
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

        //delete user by row id
        userService.deleteUser = function(rowID){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/users/' + rowID,
                type: 'DELETE',
                data: null,
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

        //save and update user
        userService.saveUser = function(id, newUser){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/users' + (id ? '/' + id : '' ),
                type: 'POST',
                data: newUser,
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
        var userObj = {};
        userService.setUserObj = function(newObj){
            userObj = newObj;
        };
        userService.getUserObj = function(){
            return userObj;
        };


        return userService;
    }
]);
