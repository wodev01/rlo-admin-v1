'use strict';
app.controller('clientUserManageCtrl',
    function ($scope, $rootScope, toastr, clientService, clientUsersService, clientLocationService) {

        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var clientId = $scope.client.id;
        $scope.isProcessing = false;

        $scope.user = clientUsersService.getUserObj().id ? angular.copy(clientUsersService.getUserObj()) : {
            role: 'User',
            customerContact: undefined,
            owner: false,
            verified: false
        };

        $scope.locationDDOptions = [];

        $scope.fnIsCheckboxChecked = function (user) {
            user.owner = (user.owner === 'true') ? true : false;
            user.verified = (user.verified === 'true') ? true : false;
        };

        $scope.fnSaveUser = function (user) {
            var userId = user.id ? user.id : null;
            $scope.isProcessing = true;
            $scope.userForm.$invalid = true;

            if (userId === null) {
                clientUsersService.createUser(clientId, user)
                    .then(function (res) {
                        $scope.fnResetForm();
                        $rootScope.$broadcast('RefreshUsersGrid');
                        $scope.userForm.$invalid = false;
                        toastr.success('New User has been created.');
                        $rootScope.fnCloseManageUser();
                        $scope.isProcessing = false;
                    }, function (error) {
                        toastr.error('User can\'t saved. Repeated email or invalid information.');
                        $scope.isProcessing = false;
                    });

            } else {
                clientUsersService.updateUser(userId, user)
                    .then(function (res) {
                        toastr.success('User saved successfully.');
                        $rootScope.$broadcast('RefreshUsersGrid');
                        $scope.userForm.$invalid = $scope.isProcessing = false;
                        $rootScope.fnCloseManageUser();

                    }, function (error) {
                        toastr.error('User can\'t saved. Repeated email or invalid information.');
                        $scope.isProcessing = false;
                    });
            }
        };

        $scope.fnResetForm = function () {
            $scope.user = {role: 'User', customerContact: false, owner: false, verified: false};
            $scope.userForm.name.$touched = false;
            $scope.userForm.email.$touched = false;
            $scope.fnFetchLocations();
        };

        $scope.fnInitUser = function () {
            if ($rootScope.isFetchLocations) {
                $scope.fnFetchLocations();
            }
            $scope.fnIsCheckboxChecked($scope.user);
        };

        $scope.fnFetchLocations = function () {
            if (clientId) {
                clientLocationService.fetchLocations(clientId)
                    .then(function (res) {
                        if (res.length > 0) {
                            $scope.locationDDOptions = res;
                            if (!$scope.user.id) {
                                $scope.user.defaultLocation = res[0].id;
                            }
                        }
                    }, function (error) {
                        toastr.error('Cannot get location information.');
                    });
            }
        };
    });