'use strict';
app.factory('GetUserService',['$q', '$cookies', '$rootScope', 'cookieName', 'localStorage', 'userObjKey', 'ErrorMsg',
    function($q, $cookies, $rootScope, cookieName, localStorage, userObjKey, ErrorMsg) {
        var GetUserService = {};

        //Get clients for current user partner:
        GetUserService.fetchUser = function () {
            var token = $cookies.get(cookieName);
            var defer = $q.defer();
            CarglyPartner._getUser(token, function (response) {
                localStorage.setItem(userObjKey,escape(JSON.stringify(response)));
                $rootScope.isSettingsUpdatesTabShown = response.role === 'Super';
                defer.resolve(response);
            },function(error){
                if (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                }
            });
            return defer.promise;
        };

        return GetUserService;
    }
]);
