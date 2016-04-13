'use strict';
app.controller('manageSegmentInteractionCtrl',
    function ($scope, $mdDialog, $filter, segmentInteractionObj, $rootScope,
                        toastr, segmentInteractionService, shopLocationsService) {

        var locId =
            shopLocationsService.getShopLocationsObj().id ?
                shopLocationsService.getShopLocationsObj().id : '';

        $scope.segmentInteraction = $scope.repairOrder = undefined;
        $scope.segmentInteraction = angular.copy(segmentInteractionObj);
        $scope.isProcessing = false;
        $scope.item = {};

        if ($scope.segmentInteraction) {
            $scope.segmentInteraction.due_date =
                $filter('date')($scope.segmentInteraction.due_date, 'MM/dd/yyyy h:mm a');

            $scope.repairOrder = $scope.segmentInteraction.repair_order;
        }

        $scope.fnSaveSegmentInteraction = function(segmentInteraction) {
            var paramsObj = {};
            paramsObj['delivery_type'] = segmentInteraction.delivery_type;
            paramsObj['status'] = segmentInteraction.status;
            $scope.isProcessing = true;

            segmentInteractionService.saveSegmentInteraction(locId, $scope.segmentInteraction.id, paramsObj)
                .then(function(res) {

                    if (res.status != 500) {
                        toastr.success('Segment Interaction updated successfully.');
                    } else {
                        toastr.error('Segment Interaction can\'t saved');
                    }

                    $rootScope.$broadcast('refreshSegmentInteraction');
                    $scope.isProcessing = false;
                    $scope.fnCloseDialog();

            }, function () {
                    toastr.error('Segment Interaction can\'t saved');
                    $scope.isProcessing = false;
                    $scope.fnCloseDialog();
                });
        };

        $scope.fnInitInspectedItems = function (itemName, inspectedItems) {
            //find object By Name in inspected items.
            $scope.item[itemName] = $.grep(inspectedItems, function (e) {
                return e.name === itemName;
            })[0];
        };

        $scope.fnCloseDialog = function() {
            $mdDialog.hide();
        };

        $scope.setClickedRow = function(groupIndex, rowIndex) {
            $scope.selectedGroup = groupIndex;
            $scope.selectedRow = rowIndex;
        };

    });