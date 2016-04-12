'use strict';
app.controller('usersCtrl',
    function ($scope, $mdSidenav, $mdDialog, $stateParams, userService) {
        $scope.rightView = 'views/authenticated/settings/manageUser.html';
        $scope.locHoverMsg = '';
        $scope.fnNewUserView = function () {
            $scope.userName = 'New User';
            $scope.fnOpenSwap();
        };

        $scope.getPagedDataAsync = function () {
            setTimeout(function () {
                userService.fetchUsers().then(function (data) {
                    if (data.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                        CarglyPartner.users = data;
                        $scope.usersData = data;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                });
            }, 100);
        };

        $scope.$on('refreshUsers', function () {
            $scope.getPagedDataAsync();
        });

        $scope.userAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-accent" ng-click="grid.appScope.fnUserEdit(row,$event)">' +
            '   <md-icon md-font-set="material-icons">edit</md-icon>' +
            '	<md-tooltip md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-warn md-hue-2" ng-click="grid.appScope.fnUserDelete(row,$event)">' +
            '   <md-icon md-font-set="material-icons">delete</md-icon>' +
            '	<md-tooltip md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.usersGrid = {
            data: 'usersData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'email', displayName: 'Email', minWidth: 200, enableHiding: false},
                {field: 'role', displayName: 'Role', minWidth: 80, enableHiding: false},
                {field: 'verified', displayName: 'Verified', minWidth: 80, enableHiding: false},
                {
                    name: 'Action',
                    displayName: '',
                    cellTemplate: $scope.userAction,
                    width: 100,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ]  ,
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnUserDelete = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this user?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                userService.deleteUser(row.entity.id).then(function () {
                    $scope.getPagedDataAsync();
                });
            });
        };

        $scope.fnUserEdit = function (row) {
            $scope.intIndex = row.rowIndex;
            $scope.userName = row.entity.name;
            userService.setUserObj(row.entity);
            $scope.fnOpenSwap();
        };

        //Swapping view open function
        $scope.fnOpenSwap = function () {
            setTimeout(function () {
                $scope.rightView = '';
                $scope.$apply();
                $scope.rightView = 'views/authenticated/settings/manageUser.html';
                $scope.$apply();
                $mdSidenav('userSwap').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $scope.fnCloseSwap = function () {
            $mdSidenav('userSwap').close().then(function () {
            });
        };

        $scope.fnInitUsers = function () {
            if ($stateParams.settingsName == 'users') {
                $scope.getPagedDataAsync();
            }
        };

    });
