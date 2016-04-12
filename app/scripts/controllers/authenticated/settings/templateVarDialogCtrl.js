'use strict';

app.controller('templateVarDialogCtrl',
    function ($scope, $mdDialog, localStorage) {

        $scope.templateVarJSON =
            localStorage.getItem('preview_values') ?
                angular.fromJson(localStorage.getItem('preview_values')) : {};

        $scope.fnSetVariables = function(templateVarJSON) {
            localStorage.setItem('preview_values', angular.toJson(templateVarJSON));
            $mdDialog.hide();
        };

        $scope.fnCloseDialog = function () {
            $mdDialog.cancel();
        };

    });