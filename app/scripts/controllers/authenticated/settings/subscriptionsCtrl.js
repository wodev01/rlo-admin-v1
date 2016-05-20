'use strict';
app.controller('subscriptionsCtrl',
    function ($scope, $mdSidenav, $mdDialog, toastr, $stateParams, subscriptionService) {
        $scope.rightView = 'views/authenticated/settings/manageSubscription.html';

        $scope.fnNewSubscriptionView = function () {
            $scope.editSubscriptionName = 'New Subscription';
            $scope.isNameEditable = false;
            $scope.fnOpenSwap();
        };

        $scope.getPagedDataAsync = function () {
            setTimeout(function () {
                subscriptionService.fetchSubscriptions().then(function (data) {
                    var sd = data.subscription_definitions;
                    if (sd.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                        $scope.subscriptionsData = sd;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                });
            }, 100);
        };

        $scope.$on('refreshSubscriptions', function () {
            $scope.getPagedDataAsync();
        });

        $scope.subscriptionAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" aria-label="Edit" ng-click="grid.appScope.fnSubscriptionEdit(row,$event)">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-warn" aria-label="Delete" ng-click="grid.appScope.fnSubscriptionDelete(row,$event)">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.subscriptionGridOptions = {
            data: 'subscriptionsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'description', displayName: 'Description', minWidth: 200, enableHiding: false},
                {
                    field: 'amount_cents',
                    displayName: 'Amount',
                    cellFilter: 'CentToDollar | currency',
                    minWidth: 100,
                    enableHiding: false
                },
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.subscriptionAction,
                    width: 100,
                    enableColumnMenu: false,
                    enableSorting: false,
                    enableColumnResizing: false
                }
            ] ,
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnSubscriptionDelete = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this subscription?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                subscriptionService.deleteSubscription(row.entity.name).then(function (res) {
                    if (res === null) {
                        $scope.getPagedDataAsync();
                    } else {
                        toastr.error('Subscription not deleted.');
                    }
                });
            });
        };

        $scope.fnSubscriptionEdit = function (row) {
            $scope.intIndex = row.rowIndex;
            $scope.editSubscriptionName = row.entity.description;
            $scope.isNameEditable = true;
            subscriptionService.setSubscriptionObj(row.entity);
            $scope.fnOpenSwap();
        };

        //Swapping view open function
        $scope.fnOpenSwap = function () {
            setTimeout(function () {
                $scope.rightView = '';
                $scope.$apply();
                $scope.rightView = 'views/authenticated/settings/manageSubscription.html';
                $scope.$apply();
                $mdSidenav('subscriptionSwap').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $scope.fnCloseSwap = function () {
            $mdSidenav('subscriptionSwap').close().then(function () {
                subscriptionService.setSubscriptionObj({});
            });
        };

        $scope.fnInitSubscriptions = function () {
            if ($stateParams.settingsName == 'subscriptions') {
                $scope.getPagedDataAsync();
            }
        };
    });
