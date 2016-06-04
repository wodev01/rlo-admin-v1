'use strict';
app.controller('paymentsCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav,
              toastr, groupService, clientService, clientPaymentsServices, clientBillingServices) {

        $scope.rightEditView = 'views/authenticated/clients/manageClient.html';
        $scope.isTabsLoad = false;
        $scope.groups = [];
        $scope.clients = [];
        $scope.isPaymentFailed = false;

        $scope.fnFetchClients = function () {
            clientService.fetchClients()
                .then(function (res) {
                    angular.forEach(res, function (val) {
                        var arrGroupsName = [];
                        angular.forEach(val.groups, function (val) {
                            var findGroupByIdObj = $.grep($scope.groups, function (e) {
                                return e.id === val;
                            })[0];

                            if (findGroupByIdObj) {
                                arrGroupsName.push(findGroupByIdObj.name);
                            }
                        });
                        val.groupsName = arrGroupsName.join();
                    });
                    $scope.clients = res;
                }, function (error) {
                    toastr.error('Failed retrieving clients data.', 'STATUS CODE: ' + error.status);
                });
        };

        $scope.fnFetchGroups = function () {
            groupService.fetchGroups()
                .then(function (res) {
                    $scope.groups = res;
                    $scope.fnFetchClients();
                }, function (error) {
                    toastr.error('Failed retrieving groups data.', 'STATUS CODE: ' + error.status);
                });
        };

        $scope.fnFetchClientPayments = function () {
            $scope.isDataNotNull = $scope.isMsg = false;

            clientPaymentsServices.fetchClientPayments()
                .then(function (res) {
                    if (res && res.length !== 0) {
                        angular.forEach(res, function (key) {
                            key.status = key.status ? key.status : 'FAILED';
                            key.details = key.details ? JSON.parse(key.details) : key.details;
                        });
                        $scope.isDataNotNull = true;
                        $scope.isMsg = false;
                        $scope.paymentsData = res;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsg = true;
                    }
                }, function (error) {
                    toastr.error('Failed retrieving client payments data.', 'STATUS CODE: ' + error.status);
                });
        };

        $scope.isPaid = function (row) {
            return row.entity.status === 'PAID';
        };

        $scope.isProcessing = false;
        $scope.error_tooltip = '<div layout="row" class="ui-grid-cell-contents">' +
            '<md-tooltip ng-show="{{row.entity.details.messages[0]}}" ng-if="$root.isMobile === null" md-direction="top" ' +
            '   aria-label="Error Message">' +
            '       <span ng-bind="row.entity.details.messages[0].message ? row.entity.details.messages[0].message : \'Unknown\'"></span></md-tooltip>' +
            '<div ng-show="{{row.entity.details.messages[0]}}"> ' +
            '   <md-button class="md-icon-button md-warn" aria-label="Error Message">' +
            '       <md-icon md-font-set="fa fa-lg fa-fw fa-exclamation-circle"></md-icon>' +
            '   </md-button>' +
            '</div>{{row.entity.status}}</div>';

        $scope.paymentsAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" aria-label="Open Client"' +
            '           ng-click="grid.appScope.fnOpenClientPaymentPage(row);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-eye"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top" aria-label="Open Client">Open Client</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-primary" ng-if="grid.appScope.isPaid(row)" aria-label="Refund"' +
            '           ng-disabled="grid.appScope.isProcessing" ' +
            '           ng-click="grid.appScope.fnRefund(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-credit-card"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top" aria-label="Refund">Refund</md-tooltip>' +
            '</md-button></div>';

        $scope.paymentsGridOptions = {
            data: 'paymentsData',
            rowHeight: 50,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableSorting: false,
            columnDefs: [
                {field: 'client_name', displayName: 'Name', minWidth: 200, enableColumnMenu: false},
                {
                    field: 'date',
                    displayName: 'Date',
                    minWidth: 160,
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    enableColumnMenu: false
                },
                {field: 'invoice_num', displayName: 'Invoice #', minWidth: 200, enableColumnMenu: false},
                {field: 'description', displayName: 'Description', minWidth: 200, enableColumnMenu: false},
                {
                    name: 'status',
                    displayName: 'Status',
                    cellTemplate: $scope.error_tooltip,
                    minWidth: 130,
                    enableColumnMenu: false
                },
                {
                    field: 'amount_cents',
                    displayName: 'Amount',
                    cellFilter: 'CentToDollar | currency',
                    minWidth: 100,
                    enableColumnMenu: false
                },
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.paymentsAction,
                    width: 100,
                    enableColumnMenu: false,
                    enableColumnResizing: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnRefund = function (row, ev) {
            var confirm = $mdDialog.confirm()
                .title('Refund')
                .content('Are you sure you want to perform this refund?')
                .ariaLabel('Ok')
                .ok('Refund')
                .cancel('Cancel')
                .targetEvent(ev);

            $mdDialog.show(confirm).then(function () {
                $scope.isProcessing = true;
                clientBillingServices.refundPayment(row.entity.client_id, row.entity.id)
                    .then(function () {
                        $scope.fnFetchClientPayments();
                    }, function (error) {
                        toastr.error('Failed refunding payments.', 'STATUS CODE: ' + error.status);
                    });
            });
        };

        $scope.fnOpenClientPaymentPage = function (row) {
            $scope.editClientName = row.entity.client_name;

            var clientObj = $.grep($scope.clients, function (e) {
                return e.id == row.entity.client_id;
            })[0];

            if (!clientObj) {
                toastr.error('The client id could not be found.');
                return;
            }

            clientService.setClientObj(clientObj);
            $scope.fnOpenClientManageSwap();
        };

        //Swapping view open function
        $scope.fnOpenClientManageSwap = function () {
            setTimeout(function () {
                $scope.rightEditView = '';
                $scope.$apply();
                $scope.rightEditView = 'views/authenticated/clients/manageClient.html';
                $scope.$apply();
                $scope.isTabsLoad = true;
                $mdSidenav('manageClientSwap').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $scope.fnCloseClientManageSwap = function () {
            $mdSidenav('manageClientSwap').close().then(function () {
            });
        };

        $scope.fnInitPayments = function () {
            $scope.fnFetchClientPayments();
            $scope.fnFetchGroups();
        };

        $rootScope.rightUserSwapView = 'views/authenticated/clients/clientUserManage.html';
        $rootScope.rightLocationSwapView = 'views/authenticated/clients/clientLocationManage.html';

    });