'use strict';
app.controller('clientUpdateStatusesCtrl',
    function ($scope, $mdDialog, clientService, clientLocationService, updateService, pagingOptions) {

        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var partnerId = $scope.client.id;

        $scope.pagingOptions = pagingOptions;
        $scope.paginationOptions = {
            pageNumber: 1,
            pageSize: 5
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.fnInitUpdateStatuses = function () {
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


        $scope.setPagingData = function (data) {
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
            $scope.clientUpdateStatusesData = data;
        };

        $scope.getPagedDataAsync = function (pageSize, page, searchText) {
            var reg = /^\d+$/;
            if (reg.test(page) && (pageSize || page || searchText)) {
                $scope.isDataNotNull = false;
                $scope.isMsgShow = false;

                updateService.fetchUpdateStatuses(partnerId, searchText, page, pageSize).then(function (data) {
                    $scope.isDataNotNull = true;
                    if (data.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                    $scope.setPagingData(data);
                    /*if ($scope.isMsgShow) {
                     setTimeout(function () {
                     $('#client-update-statuses-tab .ui-grid-viewport ')
                     .text('No update statuses available.')
                     .css({'text-align': 'center', 'height': '50px', 'overflow': 'hidden'});
                     }, 1000);
                     }*/
                });
            }
        };

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

        $scope.updateStatusesGridOptions = {
            data: 'clientUpdateStatusesData',
            rowHeight: 50,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enablePaginationControls: false,
            enableGridMenu: true,
            columnDefs: [
                {field: 'location_name', displayName: 'Location', minWidth: 180},
                {
                    name: 'Created',
                    field: 'created',
                    displayName: 'Created',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 180
                },
                {field: 'update_type', displayName: 'Type', minWidth: 100},
                {field: 'update_url', displayName: 'URL', minWidth: 200},
                {field: 'update_version', displayName: 'Update Version', minWidth: 150},
                {field: 'prior_version', displayName: 'Prior Version', minWidth: 150},
                {field: 'status', displayName: 'Status', minWidth: 150},
                {field: 'details', displayName: 'Details', visible: false, minWidth: 200}
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;

                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

    });