'use strict';

/**
 * @ngdoc function
 * @name rloAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rloAdminApp
 */
app.controller('MainCtrl',
  function ($scope, $state, $location, $cookies, $mdSidenav, $mdUtil, cookieName, localStorage, userObjKey) {

  $scope.fnToggleSideNav = function (componentId) {
    $mdSidenav(componentId).toggle().then(function () {
      if ($mdSidenav(componentId).isOpen()) {
        var leftNavElem = $('.left-side-nav').parent().find('md-backdrop').first();
        $(leftNavElem).css('z-index', '61');
      }
    });
  };

  $scope.fnIsActive = function (viewLocation) {
    return viewLocation === $location.path() ? 'md-warn nd-hue-2' : '';
  };

  $scope.fnLogout = function () {
    CarglyPartner.logout(function () {
      $cookies.remove(cookieName);
      localStorage.removeItem(userObjKey);
      $state.go('login');
    }, function () {
    });
  };

  $scope.fnStateSettings = function () {
    $state.go('main.settings', {'settingsName': 'account'});
  };

  $scope.fnInitMain = function () {
    if (localStorage.getItem(userObjKey)) {
      $scope.userObj = JSON.parse(unescape(localStorage.getItem(userObjKey)));
    }
  };
});
