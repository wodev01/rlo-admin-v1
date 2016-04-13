'use strict';
app.factory('clientPaymentsServices',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var clientPaymentsServices = {};

        //Get client payment information
        clientPaymentsServices.fetchClientPayments = function () {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/client-payments',
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

        return clientPaymentsServices;
    }
]);