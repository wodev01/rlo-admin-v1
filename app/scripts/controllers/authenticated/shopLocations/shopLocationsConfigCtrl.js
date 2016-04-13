'use strict';
app.controller('shopLocationsConfigCtrl',
    function ($scope, $filter, shopLocationsService) {

        $scope.shopLocationData = shopLocationsService.getShopLocationsObj().id ? angular.copy(shopLocationsService.getShopLocationsObj()) : {};

        $scope.fnInitShopLocConfig = function(){
            if($scope.shopLocationData.lastConfig !== null) {$scope.shopLocationData.lastConfig.settings['carglyconnect.lastsync'] = $filter('date')($scope.shopLocationData.lastConfig.settings['carglyconnect.lastsync'],'M/d/yyyy h:mm a');}

            $scope.lastConfig = $scope.shopLocationData.lastConfig;
            $scope.sms_info = $scope.lastConfig ? $scope.lastConfig.sms_info : {};
            $scope.settings = $scope.lastConfig ? $scope.lastConfig.settings : {};
            $scope.environment = $scope.lastConfig ? $scope.lastConfig.environment : {};
        };
    });