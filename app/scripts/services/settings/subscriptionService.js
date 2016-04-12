'use strict';
app.factory('subscriptionService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var subscriptionService = {};

        //Get subscription data
        subscriptionService.fetchSubscriptions = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/subscription-definitions',
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

        //save and update subscription
        subscriptionService.saveSubscription = function(subscription){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/subscription-definitions',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(subscription),
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

        //delete subscription
        subscriptionService.deleteSubscription = function(definitionName){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/subscription-definitions/'+definitionName,
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

        /*-------------- Getter and Setter Method ---------*/
        var subscriptionObj = {};
        subscriptionService.setSubscriptionObj = function(newObj){
            subscriptionObj = newObj;
        };
        subscriptionService.getSubscriptionObj = function(){
            return subscriptionObj;
        };

        return subscriptionService;
    }
]);
