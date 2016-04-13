'use strict';
app.controller('shopLocationsCustomersCtrl',
    function ($scope, $filter, shopLocationsService) {

        $scope.shopLocationData = shopLocationsService.getShopLocationsObj().id ? angular.copy(shopLocationsService.getShopLocationsObj()) : {};

        var locId = $scope.shopLocationData.id;
        $scope.customerIndex = 0;
        $scope.vehicleObj = null;
        $scope.selectedRow = null;
        $scope.breadcrumbArr = [{name: 'Customers'}];
        $scope.searchCustomerFilter = '';
        $scope.isMsgShow = false;
        $scope.customerFilter = {};

        $scope.fnInitShopLocCustomers = function () {
            $scope.fnFilterKeyEvent();
        };

        $scope.fnFilterKeyEvent = function (searchCustomerFilter) {
            $scope.getPagedDataAsync(searchCustomerFilter, $scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        };

        $scope.customersFilterOptions = {
            filterText: '',
            useExternalFilter: false
        };

        $scope.customersTotalServerItems = 0;
        $scope.pagingOptions = {
            pageSizes: [5, 10, 25, 50],
            pageSize: 5,
            currentPage: 1
        };

        $scope.setPagingData = function (data) {
            var pagedData = data; //data.slice((page - 1) * pageSize, page * pageSize);
            $scope.customersData = pagedData;
            $scope.customersTotalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.getPagedDataAsync = function (searchText, pageSize, page) {
            $scope.isDataNotNull = false;
            $scope.isMsgShow = false;

            if (locId) {
                shopLocationsService.customersData(locId, searchText).then(function (data) {
                    if (data.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                        $scope.setPagingData(data, page, pageSize);
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                });
            }
        };

        $scope.$watch('pagingOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                //was there a page change? if not make sure to reset the page to 1 because it must have been a size change
                if (newVal.currentPage === oldVal.currentPage && oldVal.currentPage !== 1) {
                    $scope.pagingOptions.currentPage = 1; //  this will also trigger this same watch
                } else {
                    // update the grid with new data
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.customersFilterOptions.filterText);
                }
            }
        }, true);

        $scope.$watch('filterOptions', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.customersFilterOptions.filterText);
            }
        }, true);

        $scope.customerAction = '<div class="ui-grid-cell-contents" layout="column" layout-fill>' +
            '<md-button class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnViewCustomerDetails(row,$event);">' +
            '   <md-icon md-font-set="material-icons">launch</md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">View</md-tooltip>' +
            '</md-button></div>';

        $scope.customersGridOptions = {
            data: 'customersData',
            rowHeight: 50,
            multiSelect: false,
            showColumnMenu: false,
            enableFiltering: true,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.customerAction,
                    width: 50,
                    enableSorting: false,
                    enableFiltering: false,
                    enableColumnMenu: false
                },
                {field: 'first_name', displayName: 'First Name', minWidth: 200, enableHiding: false},
                {field: 'last_name', displayName: 'Last Name', minWidth: 200, enableHiding: false},
                {field: 'company', displayName: 'Company', minWidth: 200, enableHiding: false},
                {
                    field: 'phone_numbers',
                    displayName: 'Phone',
                    cellFilter: 'joinTelArray',
                    minWidth: 200,
                    enableHiding: false
                },
                {
                    field: 'email_addresses',
                    displayName: 'Email',
                    cellFilter: 'joinArray',
                    minWidth: 200,
                    enableHiding: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnOnSelectBreadcrumb = function (customerIndex) {
            $scope.customerIndex = customerIndex;
            $scope.breadcrumbArr.splice(customerIndex + 1, $scope.breadcrumbArr.length);

            if (customerIndex == 0) delete $scope.selectedRow;
        };

        $scope.fnViewCustomerDetails = function (row, ev) {
            $scope.intGridIndex = row.rowIndex;
            $scope.customerIndex = 1;
            $scope.customer = row.entity;
            $scope.breadcrumbArr.push({name: row.entity.first_name + ' ' + row.entity.last_name});
        };

        $scope.fnViewVehicleDetails = function (obj) {
            $scope.customerIndex = 2;
            $scope.vehicleObj = obj;
            $scope.breadcrumbArr.push({
                name: obj.year + ' ' + obj.make + ' ' + obj.model
            });
        };

        $scope.setClickedRow = function (index) {
            $scope.selectedRow = index;
        };

        $scope.fnChangeFilter = function (customerFilter) {
            $scope.getPagedDataAsync(customerFilter, $scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        };

    });
