'use strict';
app.controller('clientLocationCtrl',
    function ($scope, $rootScope, $mdSidenav, clientService, clientLocationService) {
        $scope.client = clientService.getClientObj().id ? clientService.getClientObj() : {};
        var cId = $scope.client.id;

        $rootScope.rightLocationSwapView = 'views/authenticated/clients/clientLocationManage.html';

        $scope.fnInitLocation = function (selectedTab) {
            if (selectedTab === 3) {
                $scope.getPagedDataAsync();
            }
        };

        $scope.fnNewLocationView = function () {
            $rootScope.editLocName = 'New Location';
            clientLocationService.setLocationObj({});
            $scope.fnOpenManageLoc();
        };

        $scope.getPagedDataAsync = function () {
            $scope.isDataNotNull = false;
            $scope.isMsgShow = false;

                clientLocationService.fetchLocations(cId).then(function (data) {
                    if (data.length !== 0) {
                        $scope.isDataNotNull = true;
                        $scope.isMsgShow = false;
                        $scope.locationData = data;
                    } else {
                        $scope.isDataNotNull = false;
                        $scope.isMsgShow = true;
                    }
                });
        };

        //$broadcast event
        $scope.$on('ClientLocationListener', function () {
            $scope.getPagedDataAsync();
        });

        $scope.colorIndicator =
            '<div class="checked_item after-status" location-indicator data-obj="row.entity"></div>';

        $scope.locationAction = '<div layout="row">' +
        '<md-button class="md-icon-button md-primary" aria-label="Edit" ng-click="grid.appScope.fnLocationEdit(row,$event)">' +
        '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
        '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip>' +
        '</md-button></div>';


        $scope.locationGridOptions = {
            data: 'locationData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    name: 'colorIndicator',
                    displayName: '',
                    cellTemplate: $scope.colorIndicator,
                    width: 50,
                    enableSorting: false,
                    enableColumnMenu: false
                },
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'address', displayName: 'Address', minWidth: 200, enableHiding: false},
                {field: 'city', displayName: 'City', minWidth: 100, enableHiding: false},
                {field: 'state', displayName: 'State', minWidth: 90, enableHiding: false},
                {field: 'zip', displayName: 'Zip', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.locationAction,
                    width: 50,
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

        $scope.fnLocationEdit = function (row) {
            $scope.intIndex = row.rowIndex;
            $rootScope.editLocName = row.entity.name;
            clientLocationService.setLocationObj(row.entity);
            $scope.fnOpenManageLoc();
        };

        $scope.fnOpenManageLoc = function () {
            setTimeout(function () {
                $rootScope.rightLocationSwapView = '';
                $scope.$apply();
                $rootScope.rightLocationSwapView = 'views/authenticated/clients/clientLocationManage.html';
                $scope.$apply();
                $mdSidenav('manageLocSwap').open().then(function () {
                });
            });
        };

        $rootScope.fnCloseManageLoc = function () {
            $mdSidenav('manageLocSwap').close().then(function () {
            });
        };
    });
