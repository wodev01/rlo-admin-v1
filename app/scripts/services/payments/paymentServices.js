'use strict';
app.factory('paymentService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var paymentService = {};

        paymentService.fetchUserPaymentInfo = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + CarglyPartner.user.partnerId + '/payment-info',
                type: 'GET',
                success: function(data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        paymentService.savePaymentInfo = function(data){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + CarglyPartner.user.partnerId + '/payment-info',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
                success: function(data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(data);
                }
            });
            return defer.promise;
        };

        paymentService.fetchPayment = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+ CarglyPartner.user.partnerId +'/payments',
                type: 'GET',
                success: function(data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        paymentService.savePayment = function(data){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+ CarglyPartner.user.partnerId +'/payments',
                type: 'POST',
                data: data,
                success: function(data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        return paymentService;
    }
]);
