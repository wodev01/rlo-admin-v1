'use strict';
app.factory('clientEmailService', ['$q', '$rootScope', 'encodeParamService','ErrorMsg',
    function ($q, $rootScope, encodeParamService, ErrorMsg) {
        var clientEmailService = {};

        //Get emails data
        clientEmailService.fetchClientEmails = function (partnerId, pagingOptions) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/emails' + encodeParamService.getEncodedParams(pagingOptions),
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        /*-------------- Getter and Setter Method ---------*/
        var clientEmailObj = {};
        clientEmailService.setClientEmailObj = function (newObj) {
            clientEmailObj = newObj;
        };
        clientEmailService.getClientEmailObj = function () {
            return clientEmailObj;
        };
        return clientEmailService;
    }
]);