'use strict';
app.controller('clientLocationManageCtrl',
    function ($scope, $rootScope, toastr, globalTimeZone, clientService, clientLocationService) {
        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var cId = $scope.client.id;
        $scope.isProcessing = false;

        $scope.location = clientLocationService.getLocationObj().id ? angular.copy(clientLocationService.getLocationObj()) : {timezone: 'US/Central'};

        $scope.fnSaveLocation = function (location) {
            var locationId = location.id ? location.id : null;
            $scope.isProcessing = true;
            $scope.locationForm.$invalid = true;
            if (locationId === null) {
                clientLocationService.createLocation(cId, location).then(function (res) {
                    if (res.location_id) {
                        $scope.fnResetForm();
                        $rootScope.$broadcast('ClientLocationListener');
                        $rootScope.fnCloseManageLoc();
                        $scope.isProcessing = false;
                        $scope.locationForm.$invalid = false;
                        toastr.success('New Location has been created.');
                    }

                    $rootScope.fnCloseManageLoc();
                });
            } else {
                clientLocationService.updateLocation(locationId, location).then(function (res) {
                    if (res === null) {
                        $rootScope.$broadcast('ClientLocationListener');
                        $scope.isProcessing = false;
                        $scope.locationForm.$invalid = false;
                        toastr.success('Location saved successfully.');
                    }

                    $rootScope.fnCloseManageLoc();
                });
            }
        };

        $scope.fnResetForm = function () {
            $scope.location = {timezone: 'US/Central'};
            $scope.locationForm.name.$touched = false;
            $scope.locationForm.phone.$touched = false;
            $scope.locationForm.address.$touched = false;
            $scope.locationForm.city.$touched = false;
            $scope.locationForm.state.$touched = false;
            $scope.locationForm.zip.$touched = false;
        };

        $scope.fnInitClientLocationManage = function () {
            $scope.timeZoneDDOptions = globalTimeZone;
        };

    });