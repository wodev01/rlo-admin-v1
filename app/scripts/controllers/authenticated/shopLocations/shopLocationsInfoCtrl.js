'use strict';
app.controller('shopLocationsInfoCtrl',
	function ($scope, $filter, shopLocationsService) {

        $scope.shopLocationData = shopLocationsService.getShopLocationsObj().id ? angular.copy(shopLocationsService.getShopLocationsObj()) : {};

        $scope.fnInitShopLocInfo = function(){
            $scope.shopLocationData.lastConfigUpdated = $filter('date')($scope.shopLocationData.lastConfigUpdated,'M/d/yyyy h:mm a');
            if($scope.shopLocationData.lastConfig !== null){$scope.shopLocationData.lastConfig.settings['carglyconnect.lastsync'] = $filter('date')($scope.shopLocationData.lastConfig.settings['carglyconnect.lastsync'],'M/d/yyyy h:mm a');}
        };
});