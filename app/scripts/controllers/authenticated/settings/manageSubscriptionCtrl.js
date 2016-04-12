'use strict';
app.controller('manageSubscriptionCtrl',
    function ($scope, toastr, $rootScope, subscriptionService) {
        $scope.isProcessing = false;
        $scope.subscription = subscriptionService.getSubscriptionObj().name ? angular.copy(subscriptionService.getSubscriptionObj()) : {};

        $scope.fnSaveSubscription = function(subscription,editSubscriptionName){
            var subscriptionObj = angular.copy(subscription);
            subscriptionObj.amount_cents = subscriptionObj.amount_cents * 100;
            $scope.isProcessing = true;
            $scope.subscriptionForm.$invalid = true;
            subscriptionService.saveSubscription(subscriptionObj).then(function(res){
                if(res === null){
                    $scope.isProcessing = false;
                    $scope.subscriptionForm.$invalid = false;
                    if(editSubscriptionName === 'New Subscription'){$scope.fnResetForm();}
                    toastr.success('Subscription saved successfully.');
                    $scope.$parent.fnCloseSwap();
                    $rootScope.$broadcast('refreshSubscriptions');
                }
            });
        };

        $scope.fnInitSubscription = function(){
            $scope.subscription.amount_cents = $scope.subscription.amount_cents / 100;
        };

        $scope.fnResetForm = function(){
            $scope.subscription = {};
            $scope.subscriptionForm.$setUntouched();
        };

    });