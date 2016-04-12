'use strict';
app.controller('accountCtrl',
    function ($scope, accountServices, toastr, globalTimeZone, $stateParams) {
        $scope.isProcessing = false;

        $scope.updateAccountForm = function () {
            if (CarglyPartner.accountInfo) {
                $scope.user = {
                    businessName: CarglyPartner.accountInfo.businessName,
                    website: CarglyPartner.accountInfo.website,
                    address: CarglyPartner.accountInfo.address,
                    city: CarglyPartner.accountInfo.city,
                    state: CarglyPartner.accountInfo.state,
                    zip: CarglyPartner.accountInfo.zip,
                    timezone: CarglyPartner.accountInfo.timezone,
                    contactName: CarglyPartner.accountInfo.contactName,
                    paymentProcessingSecretKey: CarglyPartner.accountInfo.paymentProcessingSecretKey,
                    paymentProcessingPublicKey: CarglyPartner.accountInfo.paymentProcessingPublicKey,
                    paymentProcessingAccountId: CarglyPartner.accountInfo.paymentProcessingAccountId
                };
                $scope.email = CarglyPartner.accountInfo.email;
            }
        };

        $scope.fetchAccount = function () {
            $scope.isProcessing = true;
            accountServices.fetchAccount(CarglyPartner.user.id)
                .then(function (data) {
                    $scope.isProcessing = false;
                    CarglyPartner.accountInfo = data;
                    $scope.updateAccountForm();
                });
        };

        $scope.fnCancelAccount = function () {
            $scope.fetchAccount();
        };

        $scope.updateUser = function () {
            var id = CarglyPartner.user.id;
            if (id.length === 0) {
                id = null;
            }
            $scope.isProcessing = true;
            accountServices.updateAccount(id, $scope.user).then(function (res) {
                if (res === null) {
                    $scope.isProcessing = false;
                    toastr.success('Account updated successfully.');
                    $scope.fetchAccount();
                }
            });
        };

        $scope.fnInitAccount = function () {
            $scope.timeZoneDDOptions = globalTimeZone;
            if ($stateParams.settingsName == 'account') {
                $scope.fetchAccount();
            }
        };
    });
