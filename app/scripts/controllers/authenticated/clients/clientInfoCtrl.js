'use strict';
app.controller('clientInfoCtrl',
  function ($scope, $rootScope, toastr, globalTimeZone, clientService,clientUsersService) {
      $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
      var clientId = $scope.client.id;

      $scope.users = [];
      $scope.timeZoneDDOptions = [];
      $scope.contactDDOptions = [];
      $scope.selectedContact = $scope.client.contactId;

      $scope.fnCreateContactDD = function (data) {
        angular.forEach(data, function (obj) {
          $scope.contactDDOptions.push({contactName: obj.name, contactId: obj.id});
        });
      };

      $scope.fnFetchUsers = function () {
          $scope.contactDDOptions = [];
          clientUsersService.fetchUsersByPartnerId(clientId)
              .then(function (res) {
                  $scope.users = res;
                  $scope.fnCreateContactDD(res);
              }, function (error) {
                  toastr.error('Failed retrieving users.', 'STATUS CODE: ' + error.status);
              });
      };

      $scope.fnChangeContactDD = function (client, selectedContact) {
          if (selectedContact) {
              var findByUserId = $.grep($scope.users, function (e) {
                  return e.id === selectedContact;
              })[0];

              if (findByUserId) {
                  client.contactId = findByUserId.id;
                  client.contactName = findByUserId.name;
                  client.contactEmail = findByUserId.email;
              }
          }
      };

    /*---------- Saving client information ----------*/
    $scope.fnSaveClientInfo = function (client) {
        //TODO
    };

      /*---------- Initialization ----------*/
      $scope.fnInitClientInfo = function () {
          $scope.timeZoneDDOptions = globalTimeZone;
          $scope.fnFetchUsers();
      };

  });
