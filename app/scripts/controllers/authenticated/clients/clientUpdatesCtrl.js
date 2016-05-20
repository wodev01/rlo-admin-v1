'use strict';
app.controller('clientUpdatesCtrl',
    function ($scope, $mdSidenav, $rootScope, pagingOptions, $mdDialog, updateService, clientService, clientLocationService, shopLocationsService) {

        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var partnerId = $scope.client.id;

        $rootScope.rightUpdateSwapView = 'views/authenticated/clients/clientUpdateManage.html';
        $scope.updatesDefinitions = [];
        $rootScope.isFetchUpdateDefinitions = false;
        $scope.intLocIndex = 0;
        $scope.isProcessingRunUpdate = false;

        $scope.fnNewUpdateView = function () {
            $rootScope.updateHeading = 'New Update';
            $scope.fnOpenManageUpdate();
        };

        $scope.pagingOptions = pagingOptions;
        $scope.paginationOptions = {
            pageNumber: 1,
            pageSize: 5
        };

        $scope.fnInitUpdates = function () {
            $scope.fnFetchLocations();
            $scope.fnFetchUpdatesDefinitions();
        };
        $scope.selectType = '';
        $scope.fnFetchUpdatesDefinitions = function () {
            updateService.fetchUpdatesDefinitions().then(function (res) {
                $scope.updatesDefinitions = res;
                $scope.updatesDefinitions.unshift({type: 'All Update Types'});
                $scope.selectType = 'All Update Types';
            });
        };

        $scope.fnUpdatesDefinitionsDDChange = function (selectType) {
            $scope.selectType = selectType;
            if (selectType === 'All Update Types') {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            }
            else {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber, selectType);
            }
        };

        $scope.fnFetchLocations = function () {
            clientLocationService.fetchLocations(partnerId).then(function (res) {
                $scope.locations = res;
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            });
        };

        $scope.fnTextBoxKeyEvent = function (searchFilter) {
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber, searchFilter);
        };

        $scope.setLocationData = function (data) {
            angular.forEach(data, function (val) {
                var findLocByIdObj = $.grep($scope.locations, function (e) {
                    return e.id === val.location_id;
                })[0];
                if (findLocByIdObj) {
                    val.location_name = findLocByIdObj.name;
                }
                else {
                    val.location_name = 'All locations';
                }
            });
            $scope.clientUpdatesData = data;
        };

        $scope.getPagedDataAsync = function (pageSize, pageNumber, searchText) {
            var reg = /^\d+$/;
            if (reg.test(pageNumber) && (pageSize || pageNumber || searchText)) {
                $scope.isDataNotNull = false;
                $scope.isMsgShow = false;

                updateService.fetchUpdates(partnerId, searchText, pageNumber, pageSize).then(function (data) {
                    $scope.isDataNotNull = true;
                    if (data.updates.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                    $scope.setLocationData(data.updates);
                });
            }
        };

        $scope.$on('refreshUpdates', function () {
            $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
        });

        $scope.fnUpdatesPageSizeChange = function (paginationOptions) {
            paginationOptions.pageNumber = 1;
            if ($scope.selectType === 'All Update Types') {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            }
            else {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber, $scope.selectType);
            }
        };

        $scope.fnPreviousPage = function () {
            $scope.paginationOptions.pageNumber--;
            if ($scope.selectType === 'All Update Types') {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            }
            else {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber, $scope.selectType);
            }
        };

        $scope.fnNextPage = function () {
            $scope.paginationOptions.pageNumber++;
            if ($scope.selectType === 'All Update Types') {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
            }
            else {
                $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber, $scope.selectType);
            }
        };

        $scope.updateAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-warn" aria-label="Delete" ' +
            '           ng-click="grid.appScope.fnUpdateDelete(row,$event)">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip>' +
            '</md-button></div>';

        $scope.updateGridOptions = {
            data: 'clientUpdatesData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enablePaginationControls: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'location_name', displayName: 'Location', minWidth: 180, enableHiding: false},
                {
                    field: 'created',
                    displayName: 'Created',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 160,
                    enableHiding: false
                },
                {field: 'update_type', displayName: 'Type', minWidth: 100, enableHiding: false},
                {field: 'update_url', displayName: 'URL', minWidth: 180, enableHiding: false},
                {field: 'signature', displayName: 'Signature', minWidth: 100, enableHiding: false},
                {field: 'version', displayName: 'Version', minWidth: 80, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.updateAction,
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

        $scope.fnUpdateDelete = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this update?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);
            $mdDialog.show(confirm).then(function () {
                updateService.deleteUpdate(partnerId, row.entity.id).then(function () {
                    $scope.getPagedDataAsync($scope.paginationOptions.pageSize, $scope.paginationOptions.pageNumber);
                });
            });
        };

        //Swapping view open function
        $scope.fnOpenManageUpdate = function () {
            $rootScope.isFetchUpdateDefinitions = true;
            setTimeout(function () {
                $rootScope.rightUpdateSwapView = '';
                $scope.$apply();
                $rootScope.rightUpdateSwapView = 'views/authenticated/clients/clientUpdateManage.html';
                $scope.$apply();
                $mdSidenav('manageUpdateSwap').open().then(function () {
                });
            });
        };

        //Swapping view close function
        $rootScope.fnCloseManageUpdate = function () {
            $mdSidenav('manageUpdateSwap').close().then(function () {
                $rootScope.isFetchUpdateDefinitions = false;
            });
        };

        $scope.fnRunUpdate = function (index) {
            shopLocationsService.fetchNextConfig($scope.locations[index].id).then(function (res) {
                if (res.run_update !== 'yes') {
                    res.run_update = 'yes';
                    shopLocationsService.saveNextConfig($scope.locations[index].id, res).then(function () {
                        $scope.intLocIndex -= 1;
                    });
                } else {
                    $scope.intLocIndex -= 1;
                }
            });
        };

        $scope.$watch('intLocIndex', function (current) {
            if (current !== 0) {
                $scope.fnRunUpdate(current - 1);
            } else {
                $scope.isProcessingRunUpdate = false;
            }
        });

        $scope.fnRunUpdateNow = function (event) {
            var confirm = $mdDialog.confirm()
                .title('Run Update Now')
                .content('Are you sure you want to run an update now?')
                .ok('Run')
                .ariaLabel('Ok')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm).then(function () {
                $scope.isProcessingRunUpdate = true;
                $scope.intLocIndex = $scope.locations.length;
            }, function () {
            });
        };
    });
