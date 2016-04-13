'use strict';
app.controller('manageSegmentsCtrl',
    function ($scope, $mdSidenav, $rootScope, toastr, shopLocationsService, shopLocationSegmentService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.segment = shopLocationSegmentService.getShopLocSegmentObj().id ? shopLocationSegmentService.getShopLocSegmentObj() : {};
        $scope.segmentName = angular.copy(shopLocationSegmentService.getShopLocSegmentObj().name);

        $scope.fnSaveSegment = function(segment) {
            $scope.isProcessing = true;

            if (segment.id) {
                shopLocationSegmentService.editShopLocationSegments(locId, segment)
                    .then(function (res) {
                        if (res.id != null || res.id != '') {
                            toastr.success('Segment updated successfully.');
                            $rootScope.$broadcast('refreshSegments');
                            $scope.fnCloseManageSegmentView();
                        } else {
                            toastr.error('Segment can\'t saved');
                        }
                        $scope.isProcessing = false;
                    });
            } else {
                shopLocationSegmentService.saveShopLocationSegments(locId, segment)
                    .then(function (res) {
                        if (res.id != null || res.id != '') {
                            toastr.success('Segment created successfully.');
                            $rootScope.$broadcast('refreshSegments');
                            $scope.fnCloseManageSegmentView();
                        } else {
                            toastr.error('Segment can\'t saved');
                        }
                        $scope.isProcessing = false;
                    });
            }
        };

        $scope.fnCloseManageSegmentView = function() {
            $mdSidenav('manageSegmentView').close().then(function(){
                $rootScope.isManageSegmentOpen = false;
                shopLocationSegmentService.setShopLocSegmentObj({});
            });
        };

    });