'use strict';
app.controller('manageSubSegmentsCtrl',
    function ($scope, $mdDialog, $filter, $rootScope, $mdSidenav, $timeout, subSegment,
              toastr, shopLocationsService, shopLocationSegmentService, segmentConfigurationService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        var segmentId =
            shopLocationSegmentService.getShopLocSegmentObj().id ?
                shopLocationSegmentService.getShopLocSegmentObj().id : '';

        $scope.subSegment = undefined;
        $scope.subSegment = angular.copy(subSegment);
        $scope.isEdit = (typeof $scope.subSegment !== 'undefined') ? true : false;
        $scope.segmentPreviewData = $scope.item = {};
        $scope.invalidExpMsg = null;
        $scope.isSegmentPreviewDataNotNull = $scope.isSegmentPreviewMsg = $scope.isInvalidExpMsg = false;
        $scope.isProcessing = false;

        $scope.subSegmentDate = moment().toDate();

        $scope.fnPrevDate = function () {
            $scope.subSegmentDate = moment($scope.subSegmentDate).subtract(1, 'days').toDate();
        };

        $scope.fnNextDate = function () {
            $scope.subSegmentDate = moment($scope.subSegmentDate).add(1, 'days').toDate();
        };

        $scope.fnSaveSubSegment = function (subSegment) {
            $scope.isProcessing = true;

            if ($scope.subSegment.id) {
                shopLocationSegmentService.editSubSegments(locId, segmentId, subSegment)
                    .then(function (res) {
                        if (res.id != null || res.id != '') {
                            toastr.success('Sub-segment updated successfully.');
                            $rootScope.$broadcast('refreshSubSegments');
                            $scope.fnCloseDialog();
                        } else {
                            toastr.error('Segment can\'t saved');
                        }
                        $scope.isProcessing = false;
                    });
            } else {
                shopLocationSegmentService.createSubSegments(locId, segmentId, subSegment)
                    .then(function (res) {
                        if (res.id != null || res.id != '') {
                            toastr.success('Sub-segment Created successfully.');
                            $rootScope.$broadcast('refreshSubSegments');
                            $scope.fnCloseDialog();
                        } else {
                            toastr.error('Sub-segment can\'t saved');
                        }
                        $scope.isProcessing = false;
                    });
            }

            $rootScope.$broadcast('refreshSegments');
        };

        $scope.fnSegmentPreview = function () {
            $scope.isInvalidExpMsg = $scope.isSegmentPreviewDataNotNull = $scope.isSegmentPreviewMsg = false;

            var segment_date = moment($scope.subSegmentDate).format('YYYY-MM-DD');

            segmentConfigurationService.fetchSegmentPreview(locId, segment_date, $scope.subSegment.expression)
                .then(function (data) {

                    if (data.status === 400) {
                        var obj = JSON.parse(data.data);
                        $scope.isInvalidExpMsg = true;
                        $scope.invalidExpMsg = obj.messages[0].message;
                        $scope.isSegmentPreviewDataNotNull = false;
                        $scope.isSegmentPreviewMsg = true;

                    } else if (data.length !== 0) {
                        $scope.segmentPreviewData = data;
                        $scope.isSegmentPreviewDataNotNull = true;
                        $scope.isSegmentPreviewMsg = false;

                    } else {
                        $scope.isSegmentPreviewDataNotNull = false;
                        $scope.isSegmentPreviewMsg = true;

                    }
                });
        };

        $scope.fnSegmentPreviewEditor = function (row) {
            $scope.repairOrder = row;
            $mdSidenav('segmentPreviewROSwap').open().then(function () {
                angular.element('#sub-segment-dialog div.previewSection md-content.contentViewSection')
                    .css({'width': '99.95%', 'overflow': 'hidden', 'overflow-y': 'hidden'}); // overflow-y for IE, Edge

                var scrollTop = angular.element('#sub-segment-dialog div.previewSection md-content.contentViewSection').scrollTop();
                angular.element('#sub-segment-dialog #segment-preview-ro-sidenav')
                    .css({'-moz-transform': 'translate3d(-100%, ' + scrollTop + 'px, 0px)'});

            });

        };

        $scope.fnCloseSegmentPreviewROSwap = function () {
            delete $scope.selectedRow;
            $mdSidenav('segmentPreviewROSwap').close().then(function () {
                angular.element('#sub-segment-dialog div.previewSection md-content.contentViewSection')
                    .css({'overflow-y': 'auto', 'width': '100%'});
            });
        };

        $scope.fnInitManageSubSegment = function () {
            $scope.isSegmentPreviewMsg = $scope.isEdit ? false : true;
            $scope.isSegmentPreviewMsg ? '' : $scope.fnSegmentPreview();
        };

        $scope.fnCloseDialog = function () {
            $mdDialog.hide();
        };

        $scope.fnInitInspectedItems = function (itemName, inspectedItems) {
            //find object By Name in inspected items.
            $scope.item[itemName] = $.grep(inspectedItems, function (e) {
                return e.name === itemName;
            })[0];
        };

        $scope.setClickedRow = function(groupIndex, rowIndex) {
            $scope.selectedGroup = groupIndex;
            $scope.selectedRow = rowIndex;
        };

        $scope.segmentPreviewSwapView = 'views/authenticated/shopLocations/segments/segmentPreviewRODetails.html';

    });