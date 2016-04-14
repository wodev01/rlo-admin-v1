'use strict';
app.factory('AuthService',['$q', '$location', '$cookies', '$rootScope', 'cookieName', 'ErrorMsg',
    function($q, $location, $cookies, $rootScope, cookieName, ErrorMsg) {
        var AuthService = {};

        //Get clients for current user partner:
        AuthService.fnGetUser = function () {
            var token = $cookies.get(cookieName);
            var defer = $q.defer();
            CarglyPartner._getUser(token, function (response) {
                $rootScope.isSettingsUpdatesTabShown = response.role === 'Super';
                defer.resolve(response);
            },function(error){
                if (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                }
            });
            return defer.promise;
        };

        AuthService.fnResetPWTokenVerified = function () {
            var defer = $q.defer();
            /*----- Resolve reset password page if resetpw token exist ----*/
            if(CarglyPartner.queryParams != null && CarglyPartner.queryParams.resetpw != null
                && CarglyPartner.queryParams.resetpw != '') {
                defer.resolve();
            } else {
                $location.url('/login');
                defer.resolve();
            }
            return defer.promise;
        };

        return AuthService;
    }
]);
