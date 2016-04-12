'use strict';
app.controller('manageUpdatesCtrl',
    function ($scope, $rootScope, toastr, updateService) {

        $scope.update = updateService.getUpdateObj().id ? angular.copy(updateService.getUpdateObj()) : {};
        $scope.isProcessing = false;

        $scope.fnInitUpdate = function(){};

        function isEmpty(obj) {
            for(var prop in obj) {if(obj.hasOwnProperty(prop)){return false;}}
            return true;
        }

        $scope.fnSaveUpdate = function (update) {
            var id = null;
            if (update.id){id = update.id;}
            $scope.isProcessing = true;
            $scope.updateForm.$invalid = true;
            update.type = 'shopsync';
            update.package_type = 'ARCHIVE';
            updateService.saveUpdateDefinitions(id, update).then(function(res){
                if(!isEmpty(res)){
                    toastr.success('Update saved successfully.');
                    if(id === null){$scope.fnResetForm();}
                    $scope.isProcessing = false;
                    $scope.updateForm.$invalid = false;
                    $scope.$parent.fnCloseSwap();
                    $rootScope.$broadcast('refreshUpdates');
                }else{
                    toastr.error('Update not saved');
                }
                $rootScope.fnCloseManageUpdate();
            });
        };

        $scope.fnResetForm = function(){
            $scope.update = {};
            $scope.updateForm.$setUntouched();
        };
    });