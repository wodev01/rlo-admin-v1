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

        //Resend Confirmation Email
        clientUsersService.reconfirm = function (userId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/account/'+ userId +'/reconfirm',
                type: 'POST',
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

        //Reset Password request sent
        clientUsersService.requestPasswordReset = function (email) {
            var defer = $q.defer();
            CarglyPartner.requestPasswordReset(email,
                function(data) {
                    defer.resolve(data);
                },
                function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            );
            return defer.promise;
        };

        //create new user
        clientUsersService.createUser = function (partnerId, user) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+partnerId+'/users',
                type: 'POST',
                data: user,
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

        //Send welcome email
        clientUsersService.sendWelcomeEmail = function (welcomeEmail) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/sendWelcomeEmail',
                type: 'POST',
                data: { email: welcomeEmail },
                success: function(data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //update user
        clientUsersService.updateUser = function (id, user) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/users' + (id ? '/' + id : '' ),
                type: 'POST',
                data: user,
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
    }
]);