'use strict';

/**
 * @ngdoc function
 * @name rloAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the rloAdminApp
 */
app.controller('MainCtrl',
  function ($scope, $state, $location, $cookies, $mdSidenav, $mdUtil, cookieName) {

  $scope.fnToggleSideNav = function (componentId) {
    $mdSidenav(componentId).toggle().then(function () {
      if ($mdSidenav(componentId).isOpen()) {
        var leftNavElem = $('.left-side-nav').parent().find('md-backdrop').first();
        $(leftNavElem).css('z-index', '61');
      }
    });
  };

  $scope.fnIsActive = function (viewLocation) {
    return viewLocation === $location.path() ? 'md-warn' : '';
  };

  $scope.fnLogout = function () {
    CarglyPartner.logout(function () {
      $cookies.remove(cookieName);
      $state.go('login');
    }, function () {
    });
  };

  $scope.fnStateSettings = function () {
    $state.go('main.settings', {'settingsName': 'account'});
  };

  $scope.fnInitMain = function () {
    if (CarglyPartner.user) {
      $scope.userObj = CarglyPartner.user;
    }
  };
});
