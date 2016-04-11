'use strict';
app.controller('ResetPasswordCtrl',
    function ($scope, $state, $stateParams, $location, toastr) {

        if (angular.isUndefined($stateParams.resetpw)) {
            $state.go('login');
        }

        $scope.resetPassword = function () {
            if ($scope.password !== $scope.retypePassword) {
                toastr.error('Password must be matched.');
            } else {
                if ($stateParams.resetpw) {
                    CarglyPartner.resetPassword($scope.password, function () {
                        toastr.success('Password changed successfully.');
                        $state.go('login');
                    }, function (error) {
                        toastr.error('Something goe\'s wrong while resetting password.', error.status);
                    });
                } else {
                    $location.url('/login');
                }
            }
            return false;
        };

    });