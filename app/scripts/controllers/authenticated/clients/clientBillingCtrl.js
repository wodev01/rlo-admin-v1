'use strict';
app.controller('clientBillingCtrl',
    function ($scope, $mdDialog, $rootScope, $filter, toastr,
              clientService, clientBillingServices, subscriptionService, clientLocationService) {

        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var cId = $scope.client.id;

        $scope.isSubscriptionDefLoaded = false;
        $scope.subscriptionInfo = {};

        $scope.fnCreateSubDD = function () {
            $scope.selectStatusOptions = [
                {name: 'Disabled', value: 'Disabled'},
                {name: 'Active', value: 'Active'},
                {name: 'Need Payment Details', value: 'NeedPaymentDetails'},
                {name: 'Active Verify Subscriptions', value: 'ActiveVerifySubscriptions'},
                {name: 'Unconfirmed', value: 'Unconfirmed'},
                {name: 'Payment Errors', value: 'PaymentErrors'}
            ];
            if (!$scope.client.subscriptionStatus) {
                $scope.subscriptionInfo.subscription_status = $scope.selectStatusOptions[0].value;
            }
        };


        $scope.paymentInfo = {};

        $scope.fnClientBillingInit = function () {
            $scope.fnCreateSubDD();
            $scope.fnGetClientPaymentInfo();
            $scope.fnFetchClientSubscriptionInfo();
            $scope.fnFetchSubscription();
        };

        $scope.fnGetClientPaymentInfo = function () {
            clientBillingServices.fetchClientPaymentInfo(cId).then(function (res) {
                $scope.paymentInfo = res;
                $scope.paymentExpiration = res.exp_month && res.exp_year ? res.exp_month + '/' + res.exp_year : '';
            });
        };

        $scope.fnFetchClientSubscriptionInfo = function () {
            clientBillingServices.fetchClientSubscriptionInfo(cId).then(function (res) {
                res.last_payment = parseDateFormat(res.last_payment);
                res.next_payment_due = parseDateFormat(res.next_payment_due);
                res.subscription_total = $filter('currency')($filter('CentToDollar')(res.subscription_total));
                res.balance_cents = res.balance_cents / 100;
                res.receipt_emails = res.receipt_emails.join();
                if (!res.locations) {
                    res.locations = [];
                }
                $scope.subscriptionInfo = res;
                $scope.fnFetchLocations();
            });
        };

        //$broadcast event
        $rootScope.$on('getUpdatedPaymentInfo', function () {
            $scope.fnGetClientPaymentInfo();
        });
        $rootScope.$on('ClientLocationListener', function () {
            $scope.fnFetchLocations();
        });

        $scope.fnOpenClientPaymentInfo = function (ev) {

            var updateClientPaymentInfoCtrl = ['$scope', '$rootScope', function ($scope, $rootScope) {
                ChargeIO.init({
                    public_key: CarglyPartner.user.paymentProcessingPublicKey
                });

                $scope.isProcessing = false;
                $scope.updateUserPaymentInfo = function () {
                    $scope.isProcessing = true;
                    ChargeIO.create_token($scope.paymentInfo, chargeIOResponseHandler, function (response) {
                        // Show the errors on the form
                        console.log(response.error.message);
                        toastr.error('Charge IO create token failed.');
                    });
                };

                $scope.fnCancel = function () {
                    $mdDialog.cancel();
                };

                function chargeIOResponseHandler(response) {
                    clientBillingServices.updateClientPaymentInfo(cId, response)
                        .then(function (res) {
                            if (res && res.status === 500) {
                                toastr.error('Payment information saving failed.');
                            } else {
                                toastr.success('Payment information saved.');
                                $rootScope.$broadcast('getUpdatedPaymentInfo');
                                $rootScope.$broadcast('evBillingHistoryGrid');
                            }
                            $mdDialog.hide();
                            $scope.isProcessing = false;
                        });
                }
            }];

            $mdDialog.show({
                controller: updateClientPaymentInfoCtrl,
                templateUrl: 'views/authenticated/clients/modals/updatePaymentInfo.html',
                targetEvent: ev
            });
            $scope.isProcessing = false;

        };

        $scope.fnOpenClientChargeNow = function (ev) {

            var chargeNowCtrl = ['$scope', '$rootScope', function ($scope, $rootScope) {
                //API call
                $scope.invoice = {
                    amount: '',
                    description: '',
                    reference: ''
                };

                $scope.isProcessing = false;

                $scope.fnSaveInvoice = function (invoice) {
                    var clientInvoice = angular.copy(invoice);
                    clientInvoice.amount = clientInvoice.amount * 100;
                    $scope.isProcessing = true;
                    clientBillingServices.saveInvoice(cId, clientInvoice).then(function (res) {
                        if (res && res.status === 500) {
                            toastr.error('Customer Bill information saving failed.');
                        } else {
                            toastr.success('Customer Bill information saved.');
                            $rootScope.$broadcast('evBillingHistoryGrid');
                        }
                        $scope.isProcessing = false;
                        $mdDialog.hide();
                    });
                };

                $scope.fnCancel = function () {
                    $mdDialog.cancel();
                };
            }];

            $mdDialog.show({
                controller: chargeNowCtrl,
                templateUrl: 'views/authenticated/clients/modals/chargeNow.html',
                targetEvent: ev
            });
        };

        /*------------------------ Subscription Information Start --------------------------------------*/
        $scope.isProcessing = false;
        $scope.checkboxes = [];
        $scope.subTotal = {}; //subscriptions total
        $scope.grandTotal = 0;
        $scope.subArr = {};

        $scope.fnInitLocation = function (locId, subLocArr) {
            $scope.subTotal[locId] = 0;

            if (subLocArr) {
                var subLocObj = $.grep(subLocArr, function (e) {
                    return e.id === locId;
                })[0];
                if (subLocObj) {
                    $scope.subArr[locId] = subLocObj.subscriptions;
                }
            }
        };

        $scope.isSelected = {};
        $scope.fnFetchSubscription = function () {
            $scope.grandTotal = 0;
            subscriptionService.fetchSubscriptions().then(function (res) {
                $scope.checkboxes = res.subscription_definitions;
            });
        };
        $scope.fnFetchLocations = function () {
            $scope.isSubscriptionDefLoaded = false;
            clientLocationService.fetchLocations(cId).then(function (res) {
                $scope.locations = res;
                $scope.isSubscriptionDefLoaded = true;
            });
        };

        $scope.fnInitCheckbox = function (checkName, subArr, id, locId, amountCents) {
            angular.forEach(subArr, function (key) {
                if (key === checkName) {
                    $scope.isSelected[id] = true;
                    $scope.subTotal[locId] = $scope.subTotal[locId] + amountCents;
                    $scope.grandTotal = $scope.grandTotal + amountCents;
                }
            });
        };

        $scope.fnCheckboxChange = function (subLocArr, isSelected, locId, subName, amountCents) {
            var findSubByLoc = $.grep(subLocArr, function (e) {
                return e.id === locId;
            })[0];
            if (findSubByLoc) {
                if (isSelected === true) {
                    findSubByLoc.subscriptions.push(subName);
                    $scope.subTotal[locId] = $scope.subTotal[locId] + amountCents;
                    $scope.grandTotal = $scope.grandTotal + amountCents;
                } else {
                    var findIndex = findSubByLoc.subscriptions.indexOf(subName);
                    if (findIndex > -1) {
                        findSubByLoc.subscriptions.splice(findIndex, 1);
                    }
                    $scope.subTotal[locId] = $scope.subTotal[locId] - amountCents;
                    $scope.grandTotal = $scope.grandTotal - amountCents;
                }
            } else {
                if (isSelected === true) {
                    subLocArr.push({'id': locId, 'subscriptions': [subName]});
                    $scope.subTotal[locId] = $scope.subTotal[locId] + amountCents;
                    $scope.grandTotal = $scope.grandTotal + amountCents;
                }
            }
        };

        function parseDateFormat(date) {
            return $filter('date')(date, 'M/d/yyyy h:mm a');
        }

        /*---- Date picker Dialog-------*/
        $scope.openDatePicker = function (ev, subscriptionInfo) {

            var DatePickerDialogController = ['$scope', '$mdDialog', function ($scope, $mdDialog) {

                $scope.displayMode = 'full';
                $scope.dateValue = subscriptionInfo.next_payment_due ? subscriptionInfo.next_payment_due : new Date();

                $scope.fnSave = function (val) {
                    subscriptionInfo.next_payment_due = parseDateFormat(val);
                    $scope.hide();
                };

                $scope.fnCancel = function () {
                    $scope.hide();
                };

                $scope.hide = function () {
                    $mdDialog.hide();
                };
            }];

            $mdDialog.show({
                controller: DatePickerDialogController,
                templateUrl: 'views/authenticated/clients/modals/datePickerDialog.html',
                targetEvent: ev
            });
        };
        /*---- End of Date picker Dialog-------*/

        //If location remove then it remove from subscription location array.
        $scope.fnRemoveLocFromSub = function (locArr, subLocArr) {
            angular.forEach(subLocArr, function (val, index) {
                var findLocBySubLocId = $.grep(locArr, function (e) {
                    return e.id === val.id;
                })[0];
                if (!findLocBySubLocId) {
                    subLocArr.splice(index, 1);
                }
            });
        };

        $scope.fnSaveSubscriptionInfo = function (subscriptionInfo, grandTotal) {
            $scope.fnRemoveLocFromSub($scope.locations, subscriptionInfo.locations);
            var subInfo = angular.copy(subscriptionInfo);
            delete subInfo.last_payment;
            delete subInfo.subscription_total;
            subInfo.balance_cents = subInfo.balance_cents * 100;
            if (!(subInfo.next_payment_due === null || subInfo.next_payment_due === '')) {
                subInfo.next_payment_due = new Date(subInfo.next_payment_due).toISOString();
            }
            subInfo.subscription_total = angular.copy(grandTotal);
            subInfo.receipt_emails = subInfo.receipt_emails.split(',');
            $scope.isProcessing = true;
            clientBillingServices.saveClientSubscriptionInfo(cId, subInfo).then(function (res) {
                if (!res.status) {
                    toastr.success('Subscription information saved.');
                    $scope.fnFetchClientSubscriptionInfo();
                    $scope.grandTotal = 0;
                    $rootScope.$broadcast('RefreshClientsGrid');
                }
                $scope.isProcessing = false;
            });
        };
        /*------------------------ End of Subscription Information Start ----------------------------*/

    });