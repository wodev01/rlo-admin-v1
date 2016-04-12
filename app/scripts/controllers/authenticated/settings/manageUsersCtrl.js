'use strict';
app.controller('manageUsersCtrl',
    function ($scope, $rootScope, toastr, userService, locationService) {

        $scope.isProcessing = false;
        if (userService.getUserObj().id) {
            $scope.user = angular.copy(userService.getUserObj());
            $scope.user.verified = userService.getUserObj().verified === 'true';
            userService.setUserObj({});
        } else {
            $scope.user = {
                name: '',
                email: '',
                role: 'User',
                defaultLocation: '',
                customerContact: 'false',
                verified: ''
            };
        }

        $scope.fnInitUser = function(){
            $scope.fnFetchLocations();
        };

        $scope.fnSaveUser = function (user) {
            var id = null;
            if (user.id){id = user.id;}
            $scope.isProcessing = true;
            $scope.userForm.$invalid = true;
            userService.saveUser(id, user).then(function(res){
                if(res === null){
                    toastr.success('User saved successfully.');
                    if(id === null){$scope.fnResetForm();}
                    $scope.isProcessing = false;
                    $scope.userForm.$invalid = false;
                    $rootScope.$broadcast('refreshUsers');
                    $scope.fnCloseSwap();
                }else{
                    toastr.error('User can\'t saved. Repeated email or invalid information.');
                    $scope.isProcessing = false;
                }
            });
        };

        $scope.fnResetForm = function(){
            $scope.user = {role:'User',customerContact:false,verified: false};
            $scope.userForm.name.$touched = false;
            $scope.userForm.email.$touched = false;
            $scope.fnFetchLocations();
        };

        $scope.fnFetchLocations = function () {
            locationService.fetchLocation().then(function(data){
                $scope.locations = data;
                if(!$scope.user.id){
                    $scope.user.defaultLocation = data[0].id;
                }
            });
        };
    });