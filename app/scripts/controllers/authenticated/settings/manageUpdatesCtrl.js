'use strict';
app.controller('manageUpdatesCtrl',
    function ($scope, $rootScope, toastr, updateService) {

        $scope.update =
            updateService.getUpdateObj().id ? angular.copy(updateService.getUpdateObj()) : {applies_to_location: false};
        $scope.isProcessing = false;

        function isEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        }

        $scope.fnSaveUpdate = function (update) {
            var id = null;
            if (update.id) {
                id = update.id;
            }

            $scope.isProcessing = true;
            update.type = 'shopsync';
            update.package_type = 'ARCHIVE';

            updateService.saveUpdateDefinitions(id, update).then(function (res) {
                if (!isEmpty(res)) {
                    toastr.success('Update saved successfully.');
                    $scope.isProcessing = false;
                    $rootScope.$broadcast('refreshUpdates');
                } else {
                    toastr.error('Update not saved.');
                }
                $scope.$parent.fnCloseSwap();
            });
        };

    });