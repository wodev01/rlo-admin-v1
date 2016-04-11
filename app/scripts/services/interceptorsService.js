'use strict';
app.factory('InterceptorsService',
    function InterceptorsService($cookies, $q, $injector, $stateParams, $location, cookieName, toastr) {

        return {
            request: function (req) {
                var token = $cookies.get(cookieName);

                //If 'token'(cookie) not available ask to user login.
                var deferred = $q.defer();
                if (!token) {
                    if ($location.path() !== '/login' && $location.path() !== '/resetPassword') {
                        $location.url('/login');
                    }
                    deferred.resolve(req);
                }
                else {
                    //If user already login and trying to access login screen.
                    if ($location.path() === '/login' || $location.path() === '/resetPassword') {
                        var state = $injector.get('$state');
                        var stateParams = $injector.get('$stateParams');
                        if (state.current.name !== '') {
                            if (state.current.name === 'login' || state.current.name === '/resetPassword') {
                                $location.url('/clients');
                            } else {
                                state.go(state.current.name, stateParams);
                            }
                        } else {
                            $location.url('/clients');
                        }
                    } else {
                        deferred.resolve(req);
                    }
                }
                return deferred.promise;
            },

            response: function (res) {
                return res;
            },

            // This is the responseError interceptor
            responseError: function (rejection) {
                var deferred = $q.defer();
                if (rejection.status === 401 || rejection.status === 403) {
                    if (rejection.status === 401) {
                        toastr.error('Username and password are wrong.');
                    } else {
                        toastr.error('Do not have permission.');
                    }
                    $cookies.remove(cookieName);
                    $injector.get('$state').transitionTo('login');
                    deferred.reject(rejection);
                }
                else {
                    deferred.reject(rejection);
                }
                return deferred.promise;
            }

        };

    });

/** @ngInject */