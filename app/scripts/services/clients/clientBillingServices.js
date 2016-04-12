'use strict';
app.factory('clientBillingServices',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var clientBillingServices = {};

        clientBillingServices.fetchClientPaymentInfo = function(id){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/payment-info',
                type: 'GET',
                data: null,
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

        clientBillingServices.fetchClientPayments = function(id){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/payments',
                type: 'GET',
                data: null,
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

        clientBillingServices.fetchClientSubscriptionInfo = function(id){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/subscription-info',
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

        clientBillingServices.saveClientSubscriptionInfo = function(id,data){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/subscription-info',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
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

        clientBillingServices.updateClientPaymentInfo = function(id,data){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/payment-info',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
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

        clientBillingServices.saveInvoice = function(id, payment){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + id + '/payments',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(payment),
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

		clientBillingServices.refundPayment = function(id, paymentId){
			var defer = $q.defer();
			CarglyPartner.ajax({
				url: '/partners/api/' + id + '/payments/'+ paymentId +'/refund',
				type: 'POST',
				contentType: 'application/json; charset=utf-8',
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

        return clientBillingServices;
    }
]);

