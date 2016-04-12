'use strict';
app.controller('newClientsCtrl',
    function ($scope, $rootScope, toastr, globalTimeZone, clientService) {

        $scope.client = {timezone: 'US/Central'};

        $scope.fnSaveClient = function (client) {
            clientService.saveClient(client)
                .then(function (response) {
                    toastr.success('Client save successfully.');
                    $scope.client = {timezone: 'US/Central'};
                    $scope.newClientForm.$setUntouched();
                    $rootScope.$broadcast('RefreshClientsGrid');

                }, function (error) {
                    toastr.error('Can\'t be saved, repeated email or invalid information.',
                        'STATUS CODE: ' + error.status);
                });

            $scope.fnCloseNewClientSwap();
        };

        $scope.fnInitManageClient = function () {
            $scope.timeZoneDDOptions = globalTimeZone;
        };

    });