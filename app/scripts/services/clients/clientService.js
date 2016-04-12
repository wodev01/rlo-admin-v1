app.factory('clientService',['$q','ErrorMsg', 'encodeParamService',
  function ($q, ErrorMsg, encodeParamService) {

    var clientService = {};
    var pagingCursor = '';

    // Retrieve the clients using parameters.
    clientService.filterClientsData = function (filterObj) {
        var defer = $q.defer();

        CarglyPartner.ajax({
            url: '/partners/api/agent/clients' + encodeParamService.getEncodedParams(filterObj),
            type: 'GET',
            success: function (data, status, headers) {
                pagingCursor = headers['x-paging-cursor'];
                var response = {};
                response.data = data;
                response.status = status;
                response.headers = headers;
                defer.resolve(response);
            },
            error: function (error) {
                ErrorMsg.CheckStatusCode(error.status);
                defer.reject(error);
            }
        });

        return defer.promise;
    };

    /*---------- Get more clients using x-paging-cursor header ----------*/
    clientService.fetchMoreClients = function () {
        var defer = $q.defer();

        var filterObj = {};
        filterObj.cursor = pagingCursor;

        CarglyPartner.ajax({
            url: '/partners/api/agent/clients' + encodeParamService.getEncodedParams(filterObj),
            type: 'GET',
            success: function (data, status, headers) {
                pagingCursor = headers['x-paging-cursor'];
                var response = {};
                response.data = data;
                response.status = status;
                response.headers = headers;
                defer.resolve(response);
            },
            error: function (error) {
                ErrorMsg.CheckStatusCode(error.status);
                defer.reject(error);
            }
        });

        return defer.promise;
    };

    /*-------------- Getter and Setter Method ---------*/
    var clientObj = {};
    clientService.setClientObj = function (newObj) {
        clientObj = newObj;
    };
    clientService.getClientObj = function () {
        return clientObj;
    };
    return clientService;
  }
]);
