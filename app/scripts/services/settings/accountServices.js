'use strict';
app.factory('accountServices',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var accountServices = {};

        //Get account data
        accountServices.fetchAccount = function (id) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/account/' + id,
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

        //Update account
        accountServices.updateAccount = function (id, user) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/account' + (id ? '/' + id : '' ),
                type: 'POST',
                data: user,
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

        return accountServices;
    }
]);