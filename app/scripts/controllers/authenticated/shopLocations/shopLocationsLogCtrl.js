'use strict';
app.controller('shopLocationsLogCtrl',
    function ($scope, shopLocationsService) {

        $scope.shopLocationData = shopLocationsService.getShopLocationsObj().id ? angular.copy(shopLocationsService.getShopLocationsObj()) : {};
        var locId = $scope.shopLocationData.id ? $scope.shopLocationData.id : null;
        $scope.logs =[];
        $scope.isProcessing = false;

        $scope.fnInitShopLocLog = function(){
            $scope.fnFetchLog();
        };

        $scope.fnFetchLog = function(){
            if(locId){
                $scope.isProcessing = true;
                shopLocationsService.fetchLog(locId).then(function(res){
                    $scope.isProcessing = false;
                    $scope.logs = JSON.parse(res);
                });
            }
        };
    });