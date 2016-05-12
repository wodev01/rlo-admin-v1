'use strict';
app.controller('clientUsersCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, toastr, clientService, clientUsersService) {

        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var cId = $scope.client.id;
        $rootScope.isFetchLocations = false;
        $rootScope.rightUserSwapView = 'views/authenticated/clients/clientUserManage.html';

        $scope.fnInitUsers = function () {
            $scope.getPagedDataAsync();
        };

        $scope.fnNewUserView = function () {
            $rootScope.editUserName = 'New User';
            clientUsersService.setUserObj({});
            $scope.fnOpenManageUser();
        };

        $scope.getPagedDataAsync = function () {
            $scope.isDataNotNull = false;
            $scope.isMsgShow = false;
            clientUsersService.fetchUsersByPartnerId(cId).then(function (data) {
                if (data.length !== 0) {
                    $scope.isDataNotNull = true;
                    $scope.usersData = data;
                } else {
                    $scope.isDataNotNull = false;
                    $scope.isMsgShow = true;
                }
            });
        };

        //$broadcast event
        $scope.$on('RefreshUsersGrid', function () {
            $scope.getPagedDataAsync();
        });

        $scope.userAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" aria-label="Edit" ng-click="grid.appScope.fnUserEdit(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-primary" aria-label="Resend Confirmation" ng-click="grid.appScope.fnResendConfirmation(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-check"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Resend Confirmation</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-primary" aria-label="Reset password" ng-click="grid.appScope.fnResetPassword(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-key"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Reset Password</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-primary" aria-label="Welcome Email" ng-click="grid.appScope.fnSendWelcomeEmail(row,$event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-envelope"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Send Welcome Email</md-tooltip></md-button>' +
            '</div>';

        $scope.userGridOptions = {
            data: 'usersData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'email', displayName: 'Email', minWidth: 200, enableHiding: false},
                {field: 'role', displayName: 'Role', minWidth: 100, enableHiding: false},
                {field: 'verified', displayName: 'Verified', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.userAction,
                    width: 200,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnSendWelcomeEmail = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Resend Welcome E-mail')
                .content('Resending welcome email to your mail-id ?')
                .ariaLabel('Ok')
                .ok('Resend')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm)
                .then(function () {
                    clientUsersService.sendWelcomeEmail(row.entity.email).then(function () {
                        toastr.success('Welcome Email sent successfully.');
                    });
                });
        };

        $scope.fnResendConfirmation = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Resend Confirmation')
                .content('Resending confirmation to your email-id ?')
                .ariaLabel('Ok')
                .ok('Resend')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm)
                .then(function () {
                    clientUsersService.reconfirm(row.entity.id).then(function () {
                        toastr.success('Confirmation email sent successfully.');
                    });
                });
        };

        $scope.fnResetPassword = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Reset Password Request')
                .content('Resetting password to your email-id ?')
                .ariaLabel('Ok')
                .ok('Reset')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm)
                .then(function () {
                    clientUsersService.requestPasswordReset(row.entity.email).then(function () {
                        toastr.success('Password request sent successfully.');
                    });
                });
        };

        $scope.fnUserEdit = function (row) {
            $scope.intIndex = row.rowIndex;
            $rootScope.editUserName = row.entity.name;
            clientUsersService.setUserObj(row.entity);
            $scope.fnOpenManageUser();
        };

        $scope.fnOpenManageUser = function () {
            $rootScope.isFetchLocations = true;
            setTimeout(function () {
                $rootScope.rightUserSwapView = '';
                $scope.$apply();
                $rootScope.rightUserSwapView = 'views/authenticated/clients/clientUserManage.html';
                $scope.$apply();
                $mdSidenav('manageUserSwap').open().then(function () {
                });
            });
        };

        $rootScope.fnCloseManageUser = function () {
            $mdSidenav('manageUserSwap').close().then(function () {
                $rootScope.isFetchLocations = false;
            });
        };
    });
