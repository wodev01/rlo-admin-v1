'use strict';
app.factory('ErrorMsg',['$state', 'toastr', '$cookies', 'cookieName',
    function($state, toastr, $cookies, cookieName) {
        var ErrorMsg = {};

        function fnLogout(){
            CarglyPartner.logout(function () {
                $cookies.remove(cookieName);
                $state.go('login');
            }, function () {});
        }

        ErrorMsg.CheckStatusCode = function(statusCode){
            switch (statusCode)
            {
                case 401:
                    toastr.remove();
                    toastr.error('Access is denied due to invalid credentials.', '401 - Unauthorized');
                    fnLogout();
                    break;

                case 403:
                    toastr.remove();
                    toastr.error('Do not have permission.', '403 - Forbidden');
                    fnLogout();
                    break;

                case 409:
                    toastr.remove();
                    toastr.error('The email address provided is already associated with another partner account.',
                        '409 - Conflict');
                    break;

                case 500:
                    toastr.remove();
                    toastr.error('An unexpected error has occurred. Please refresh the page and try again.',
                        '500 - Internal Server Error');
                    break;

                default:
                    break;
            }
        };

        return ErrorMsg;
    }
]);
