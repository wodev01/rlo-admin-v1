'use strict';
app.controller('updatesCtrl',
    function ($scope, $mdSidenav, $mdDialog, pagingOptions, updateService, $stateParams) {
        $scope.rightView = 'views/authenticated/settings/manageUpdate.html';
        $scope.searchUpdateFilter = '';

        $scope.fnNewUpdateView = function () {
            $scope.updateHeading = 'New Update';
            $scope.fnOpenSwap();
        };

        $scope.pagingOptions = pagingOptions;
        $scope.paginationOptions = {
            pageNumber: 1,
            pageSize: 5
        };

        $scope.fnFilterKeyEvent = function (searchUpdateFilter) {
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber,searchUpdateFilter);
        };

        $scope.getPagedDataAsync = function (pageSize, pageNumber, searchText) {
            var reg = /^\d+$/;
            if (reg.test(pageNumber) && (pageSize || pageNumber || searchText)) {
                $scope.isDataNotNull = false;
                $scope.isMsgShow = false;
                updateService.fetchUpdatesDefinitions(searchText, pageNumber, pageSize).then(function (data) {
                    if (data.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                    $scope.updatesData = data;
                });
            }
        };

        $scope.$on('refreshUpdates', function () {
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
        });

        $scope.fnUpdatesPageSizeChange = function (paginationOptions) {
            paginationOptions.pageNumber = 1;
            $scope.getPagedDataAsync(paginationOptions.pageSize, paginationOptions.pageNumber);
        };

        $scope.fnPreviousPage = function () {
            $scope.paginationOptions.pageNumber--;
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
        };

        $scope.fnNextPage = function () {
            $scope.paginationOptions.pageNumber++;
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
        };

        $scope.updateAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-warn" ng-click="grid.appScope.fnUpdateDelete(row,$event)">' +
            '   <md-icon md-font-set="material-icons">delete</md-icon>' +
            '   <md-tooltip md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.updateGridOptions = {
            data: 'updatesData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enablePaginationControls: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    field: 'created',
                    displayName: 'Created',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 180,
                    enableHiding: false
                },
                {field: 'type', displayName: 'Type', minWidth: 100, enableHiding: false},
                {field: 'package_type', displayName: 'Package Type', minWidth: 100, enableHiding: false},
                {field: 'url', displayName: 'URL', minWidth: 180, enableHiding: false},
                {field: 'signature', displayName: 'Signature', minWidth: 100, enableHiding: false},
                {field: 'version', displayName: 'Version', minWidth: 80, width: 80, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.updateAction,
                    width: 50,
                    enableColumnMenu: false,
                    enableSorting: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnUpdateDelete = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this update?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                updateService.deleteUpdateDefinitions(row.entity.id).then(function () {
                    $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
                });
            });
        };

        $scope.fnUpdateEdit = function (row) {
            $scope.updateHeading = row.entity.type;
            updateService.setUpdateObj(row.entity);
            $scope.fnOpenSwap();
        };

        //Swapping view open function
        $scope.fnOpenSwap = function () {
            setTimeout(function () {
                $scope.rightView = '';
                $scope.$apply();
                $scope.rightView = 'views/authenticated/settings/manageUpdate.html';
                $scope.$apply();
                $mdSidenav('updateSwap').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $scope.fnCloseSwap = function () {
            $mdSidenav('updateSwap').close().then(function () {
            });
        };

        $scope.fnInitUpdates = function () {
            if ($stateParams.settingsName == 'updates') {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            }
        };

    });
