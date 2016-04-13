'use strict';
app.controller('shopLocationsSegmentsCtrl',
    function ($scope, $rootScope, $mdDialog, $mdSidenav, toastr, shopLocationsService, shopLocationSegmentService) {

        $rootScope.rightOpenSegmentsSwapView = 'views/authenticated/shopLocations/manageShopLocSegments.html';

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $rootScope.isManageSegmentOpen = false;
        $rootScope.isManageSegmentOpenTabsView = false;
        $scope.isShopLocSegmentMsgShow = false;
        $scope.isShopLocSegmentDataNotNull = false;

        $scope.fnRematchLastSixMonths = function () {
            shopLocationSegmentService.rematchLastSixMonths(locId)
                .then(function () {
                    toastr.success('Re-applying segment rules could take a while. please be patient.');
                });
        };

        $scope.fnCreateNewSegment = function () {
            $scope.fnOpenManageSegmentView();
        };

        $scope.getPagedDataAsync = function () {
            $scope.isShopLocationsMsgShow = false;
            $scope.isShopLocationsDataNotNull = false;

            if (locId) {
                shopLocationSegmentService.fetchShopLocationSegments(locId)
                    .then(function (data) {
                        if (data.length !== 0) {
                            $scope.isShopLocSegmentMsgShow = false;
                            $scope.isShopLocSegmentDataNotNull = true;
                            $scope.shopLocationSegmentsData = data;
                        } else {
                            $scope.isShopLocSegmentMsgShow = true;
                            $scope.isShopLocSegmentDataNotNull = false;
                        }
                    });

            } else {
                toastr.error('Location ID not found...');
            }
        };

        $scope.fnInitSegments = function () {
            $scope.getPagedDataAsync();
        };

        $scope.shopLocationSegmentsAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-accent" ' +
            '           ng-click="grid.appScope.fnOpenManageShopLocSegmentsView(row, $event);">' +
            '   <md-icon md-font-set="material-icons">visibility</md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Open</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-warn md-hue-2" ' +
            '           ng-click="grid.appScope.fnRemoveManageShopLocSegmentsView(row,$event);">' +
            '   <md-icon md-font-set="material-icons">delete</md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip>' +
            '</md-button></div';

        $scope.shopLocationSegmentsGridOptions = {
            data: 'shopLocationSegmentsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {field: 'name', displayName: 'Segment Name', minWidth: 100, enableHiding: false},
                {field: 'sub_segments', displayName: 'SubSegment', cellFilter: 'joinArrayOfObj', enableHiding: false},
                {field: 'delivery_enabled', displayName: 'Delivery Enabled', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.shopLocationSegmentsAction,
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

        /*----- For update segment ----------*/
        $scope.fnEditManageSegmentsView = function (row) {
            shopLocationSegmentService.setShopLocSegmentObj(angular.copy(row.entity));
            $scope.fnOpenManageSegmentView();
        };
        /*---- For create and update segment ------------*/
        $scope.fnOpenManageSegmentView = function () {
            $mdSidenav('manageSegmentView').open().then(function () {
                $rootScope.isManageSegmentOpen = true;
            });
        };

        $scope.fnRemoveManageShopLocSegmentsView = function (row, event) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Are you sure you want to remove?')
                .ariaLabel('Delete')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm).then(function () {
                var segmentId = row.entity.id;

                shopLocationSegmentService.removeShopLocationSegments(locId, segmentId).then(function (res) {
                    if (res === null) {
                        $rootScope.$broadcast('refreshSegments');
                        toastr.success('Segment deleted successfully...');
                    }
                });

            }, function () {
            });
        };

        $scope.$on('refreshSegments', function () {
            $scope.getPagedDataAsync();
        });

        /*----- Segment Inner Tabs -----*/
        $scope.fnOpenManageShopLocSegmentsView = function (row) {
            shopLocationSegmentService.setShopLocSegmentObj(angular.copy(row.entity));
            $rootScope.segmentName = angular.copy(row.entity.name);
            $mdSidenav('manageShopLocSegmentsView').open().then(function () {
                $rootScope.isManageSegmentOpenTabsView = true;
            });
        };

        $rootScope.rightManageSegmentSwapView = 'views/authenticated/shopLocations/segments/manageSegment.html';

    });