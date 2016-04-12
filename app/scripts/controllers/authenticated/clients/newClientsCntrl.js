'use strict';
app.controller('newClientsCtrl',
  function ($scope,globalTimeZone) {

    $scope.client = {timezone: 'US/Central'};

    $scope.fnSaveClient = function(client){
        //TODO
    };

    $scope.fnInitManageClient = function () {
        $scope.timeZoneDDOptions = globalTimeZone;
    };

  });
