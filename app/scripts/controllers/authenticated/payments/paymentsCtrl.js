'use strict';
app.controller('paymentsCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, clientService, clientPaymentsServices, clientBillingServices, toastr) {

        $scope.rightEditView = 'views/authenticated/clients/manageClient.html';
        $scope.isTabsLoad = false;
        $scope.groups = [];
        $scope.clients = [];
        $scope.isPaymentFailed = false;

        $scope.fnInitPayments = function () {
            $scope.fnFetchClientPayments();
        };

        $scope.fnFetchClients = function () {
            clientService.fetchClients().then(function (res) {
                $scope.clients = res;
            });
        };

        $scope.fnFetchClientPayments = function () {
            setTimeout(function () {
                $scope.isDataNotNull = false;
                $scope.isMsg = false;
                clientPaymentsServices.fetchClientPayments().then(function (res) {
                    if (res.length > 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsg = false;
                        angular.forEach(res, function (key) {
                            key.status = key.status ? key.status : 'FAILED';
                            key.details = key.details ? JSON.parse(key.details) : key.details;
                        });
                        $scope.paymentsData = res;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsg = true;
                    }
                });
            }, 100);
        };

        $scope.isPaid = function (row) {
            return row.entity.status === 'PAID';
        };

        $scope.isProcessing = false;
        $scope.error_tooltip = '<div layout="row" class="ui-grid-cell-contents">' +
            '<div ng-show="{{row.entity.details.messages[0]}}"> ' +
            '   <md-button class="md-icon-button md-warn">' +
            '       <md-icon md-font-set="material-icons">highlight_off</md-icon>' +
            '       <md-tooltip md-direction="top">{{row.entity.details.messages[0].message}}</md-tooltip>' +
            '   </md-button>' +
            '</div>{{row.entity.status}}</div>';

        $scope.paymentsAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" ' +
            '           ng-click="grid.appScope.fnOpenClientPaymentPage(row,$event,grid.appScope.clients);" ' +
            '           ng-init="grid.appScope.fnOpenClientBtnInit();">' +
            '   <md-icon md-font-set="material-icons">visibility</md-icon>' +
            '   <md-tooltip md-direction="top">Open Client</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-primary" ng-if="grid.appScope.isPaid(row)" ' +
            '           ng-disabled="grid.appScope.isProcessing" ' +
            '           ng-click="grid.appScope.fnRefund(row,$event);">' +
            '   <md-icon md-font-set="material-icons">payment</md-icon>' +
            '   <md-tooltip md-direction="top">Refund</md-tooltip>' +
            '</md-button></div>';

        $scope.paymentsGridOptions = {
            data: 'paymentsData',
            rowHeight: 50,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [
                {field: 'client_name', displayName: 'Name', enableHiding: false, minWidth: 200},
                {
                    field: 'date',
                    displayName: 'Date',
                    minWidth: 180,
                    enableHiding: false,
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\''
                },
                {field: 'invoice_num', displayName: 'Invoice #', enableHiding: false, minWidth: 100},
                {field: 'description', displayName: 'Description', enableHiding: false, minWidth: 200},
                {
                    name: 'status',
                    displayName: 'Status',
                    cellTemplate: $scope.error_tooltip,
                    minWidth: 150,
                    enableHiding: false
                },
                {
                    field: 'amount_cents',
                    displayName: 'Amount',
                    enableHiding: false,
                    cellFilter: 'CentToDollar | currency',
                    minWidth: 120
                },
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.paymentsAction,
                    width: 100,
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
                clientBillingServices.refundPayment(row.entity.client_id, row.entity.id).then(function () {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                });
            });
        };

        $scope.fnOpenClientBtnInit = function () {
            if (!$scope.isPaymentFailed) {
                $scope.fnFetchClients();
                $scope.isPaymentFailed = true;
            }
        };

        $scope.fnOpenClientPaymentPage = function (row, ev, clients) {
            $scope.intIndex = row.rowIndex;
            $scope.editClientName = row.entity.client_name;
            $scope.isTabsLoad = true;
            var clientObj = {};
            clientObj = $.grep(clients, function (e) {
                return e.id === row.entity.client_id;
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
                $mdSidenav('manageClientSwap').open().then(function () {
                });
            });
        };
        //Swapping view close function
        $scope.fnCloseClientManageSwap = function () {
            $mdSidenav('manageClientSwap').close().then(function () {
            });
        };

        $scope.selectedTab = 0;
        $scope.fnGetSelectedTabVal = function (selectedTab) {
            $scope.$broadcast('SwitchTab', {tabIndex: selectedTab});
        };

        $rootScope.rightUserSwapView = 'views/authenticated/clients/clientUserManage.html';
        $rootScope.rightLocationSwapView = 'views/authenticated/clients/clientLocationManage.html';

    });