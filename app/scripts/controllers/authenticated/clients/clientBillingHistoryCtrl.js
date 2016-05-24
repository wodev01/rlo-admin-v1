'use strict';
app.controller('clientBillingHistoryCtrl',
    function ($scope, $rootScope, $mdDialog, clientService, clientBillingServices) {
        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var cId = $scope.client.id;

        $scope.fnInitBillingHistory = function () {
            $scope.getPagedDataAsync();
        };

        //$broadcast event
        $rootScope.$on('evBillingHistoryGrid', function () {
            $scope.getPagedDataAsync();
        });

        $scope.getPagedDataAsync = function () {
            $scope.isDataNotNull = false;
            $scope.isMsg = false;
            clientBillingServices.fetchClientPayments(cId).then(function (res) {
                if (res.length > 0) {
                    $scope.isDataNotNull = true;
                    angular.forEach(res, function (key) {
                        key.details = key.details ? JSON.parse(key.details) : key.details;
                    });
                    $scope.billingHistoryData = res;
                } else {
                    $scope.isDataNotNull = true;
                    $scope.isMsg = true;
                }
                $scope.isProcessing = false;
            });
        };

        $scope.isPaid = function (row) {
            return row.entity.status === 'PAID';
        };

        $scope.isProcessing = false;

        $scope.errorTooltip = '<div layout="row" class="ui-grid-cell-contents">' +
            '<div ng-show="{{row.entity.details.messages[0]}}"> ' +
            '   <md-button class="md-icon-button md-warn" aria-label="Error Message">' +
            '       <md-icon md-font-set="fa fa-lg fa-fw fa-exclamation-circle"></md-icon>' +
            '       <md-tooltip ng-if="$root.isMobile === null" md-direction="top" aria-label="Error Message">{{row.entity.details.messages[0].message}}</md-tooltip>' +
            '   </md-button>' +
            '</div>{{row.entity.status}}</div>';

        $scope.billingHistoryAction = '<div layout="row">' +
            '<md-button ng-if="grid.appScope.isPaid(row)" ng-disabled="grid.appScope.isProcessing" class="md-icon-button md-primary" ng-click="grid.appScope.fnRefund(row,$event)" aria-label="Refund">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-credit-card"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top" aria-label="Refund">Refund</md-tooltip>' +
            '</md-button> </div>';

        $scope.billingHistoryGridOptions = {
            data: 'billingHistoryData',
            rowHeight: 50,
            enablePaging: false,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [
                {
                    field: 'date',
                    displayName: 'Date',
                    minWidth: 160,
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    enableHiding: false
                },
                {field: 'reference', displayName: 'Invoice #', minWidth: 200, enableHiding: false},
                {field: 'description', displayName: 'Description', minWidth: 250, enableHiding: false},
                {
                    field: 'status',
                    displayName: 'Status',
                    minWidth: 130,
                    cellTemplate: $scope.errorTooltip,
                    enableHiding: false
                },
                {
                    field: 'amount',
                    displayName: 'Amount',
                    cellFilter: 'CentToDollar | currency',
                    minWidth: 100,
                    enableHiding: false
                },
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.billingHistoryAction,
                    width: 50,
                    enableSorting: false,
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
                clientBillingServices.refundPayment(cId, row.entity.id)
                    .then(function () {
                        $scope.getPagedDataAsync();
                    });
            });
        };

    });
