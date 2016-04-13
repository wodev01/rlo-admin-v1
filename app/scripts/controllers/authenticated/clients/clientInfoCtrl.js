'use strict';
app.controller('clientInfoCtrl',
    function ($scope, $rootScope, toastr, globalTimeZone, clientService, clientUsersService) {
        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var clientId = $scope.client.id;

        $scope.users = [];
        $scope.timeZoneDDOptions = [];
        $scope.contactDDOptions = [];
        $scope.selectedContact = $scope.client.contactId;
        $scope.isProcessing = false;

        $scope.fnCreateContactDD = function (data) {
            angular.forEach(data, function (obj) {
                $scope.contactDDOptions.push({contactName: obj.name, contactId: obj.id});
            });
        };

        $scope.fnFetchUsers = function () {
            $scope.contactDDOptions = [];
            clientUsersService.fetchUsersByPartnerId(clientId)
                .then(function (res) {
                    $scope.users = res;
                    $scope.fnCreateContactDD(res);
                }, function (error) {
                    toastr.error('Failed retrieving users.', 'STATUS CODE: ' + error.status);
                });
        };

        $scope.fnChangeContactDD = function (client, selectedContact) {
            if (selectedContact) {
                var findByUserId = $.grep($scope.users, function (e) {
                    return e.id === selectedContact;
                })[0];

                if (findByUserId) {
                    client.contactId = findByUserId.id;
                    client.contactName = findByUserId.name;
                    client.contactEmail = findByUserId.email;
                }
            }
        };

        /*---------- Saving client information ----------*/
        $scope.fnSaveClientInfo = function (client) {
            var clientCopy = angular.copy(client);
            delete clientCopy.groupsName;

            var postJson = {};
            postJson.name = clientCopy.partner;
            postJson.timezone = clientCopy.timezone;
            postJson.contact_name = clientCopy.contactName;
            postJson.contact_email = clientCopy.contactEmail;
            postJson.contact_phone = clientCopy.contactPhone;
            postJson.contact_id = clientCopy.contactId;

            $scope.isProcessing = true;
            clientService.updateClientInfo(clientId, postJson)
                .then(function (res) {
                    if (res === null) {
                        $rootScope.$broadcast('RefreshClientsGrid');
                        toastr.success('Client information updated.');
                    }
                    $scope.isProcessing = false;
                }, function (error) {
                    toastr.error('Failed saving information.', 'STATUS CODE: ' + error.status);
                    $scope.isProcessing = false;
                });
        };

        /*---------- Initialization ----------*/
        $scope.fnInitClientInfo = function () {
            $scope.timeZoneDDOptions = globalTimeZone;
            $scope.fnFetchUsers();
        };

    });
