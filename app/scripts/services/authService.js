'use strict';
app.factory('AuthService',['$q', '$state', '$location', '$cookies', 'cookieName', 'ErrorMsg',
    function($q, $state, $location, $cookies, cookieName, ErrorMsg) {
        var AuthService = {};

        function fnRedirectURL(url, defer){
            if ($state.current.name === '') {
                $location.url(url);
                defer.resolve();
            } else {
                defer.reject();
            }
        }

        //Get clients for current user partner:
        AuthService.fnGetUser = function () {
            var token = $cookies.get(cookieName);
            var defer = $q.defer();
            if (!angular.isUndefined(token)) {
                CarglyPartner._getUser(token, function (response) {
                    defer.resolve(response);
                }, function (error) {
                    if (error) {
                        ErrorMsg.CheckStatusCode(error.status);
                    }
                });
            } else {
                if (CarglyPartner.queryParams != null && CarglyPartner.queryParams.resetpw != null
                    && CarglyPartner.queryParams.resetpw != '') {
                    fnRedirectURL('/reset-password', defer);
                } else {
                    fnRedirectURL('/login', defer);
                }
            }
            return defer.promise;
        };

        AuthService.fnAuthTokenUndefined = function(){
            var token = $cookies.get(cookieName);
            var defer = $q.defer();
            if (angular.isUndefined(token)) {
                if(CarglyPartner.queryParams != null && CarglyPartner.queryParams.resetpw != null
                    && CarglyPartner.queryParams.resetpw != '') {
                    fnRedirectURL('/reset-password', defer);
                } else {
                    defer.resolve();
                }
            } else {
                fnRedirectURL('/clients', defer);
            }
            return defer.promise;
        };

        AuthService.fnResetPWTokenVerified = function () {
            var defer = $q.defer();
            /*----- Resolve reset password page if resetpw token exist ----*/
            if(CarglyPartner.queryParams != null && CarglyPartner.queryParams.resetpw != null
                && CarglyPartner.queryParams.resetpw != '') {
                defer.resolve();
            } else {
                fnRedirectURL('/login', defer);
            }
            return defer.promise;
        };

        return AuthService;
    }
]);
