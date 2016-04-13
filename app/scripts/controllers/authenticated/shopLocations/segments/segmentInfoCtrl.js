'use strict';
app.controller('segmentInfoCtrl',
    function ($scope, $mdSidenav, $rootScope, toastr, shopLocationsService, shopLocationSegmentService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.segment =
            shopLocationSegmentService.getShopLocSegmentObj().id ?
                shopLocationSegmentService.getShopLocSegmentObj() : {};

        $scope.fnSaveSegment = function(segment) {
            $scope.isProcessing = true;

            if (segment.id) {
                shopLocationSegmentService.editShopLocationSegments(locId, segment)
                    .then(function (res) {
                        if (res.id != null || res.id != '') {
                            toastr.success('Segment updated successfully.');
                            $rootScope.$broadcast('refreshSegments');
                            $scope.fnManageShopLocSegmentsView();
                        } else {
                            toastr.error('Segment can\'t saved');
                        }
                        $scope.isProcessing = false;
                    });
            }
        };

        $scope.fnManageShopLocSegmentsView = function() {
            $mdSidenav('manageShopLocSegmentsView').close().then(function(){
                $rootScope.isManageSegmentOpenTabsView = false;
                shopLocationSegmentService.setShopLocSegmentObj({});
            });
        };

    });