'use strict';
app.factory('clientService', ['$q', 'ErrorMsg', 'encodeParamService',
    function ($q, ErrorMsg, encodeParamService) {

        var clientService = {};
        var pagingCursor = '';

        //Get clients for current user partner:
        clientService.fetchClients = function () {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients',
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //retrieve the clients using status filter for RLO
        clientService.fetchClientsUsingStatusFilter = function (status) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients' + (status ? '?status=' + status : ''),
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //retrieve the clients using filter for RLO
        clientService.fetchClientsUsingFilter = function (filter) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients' + (filter ? '?filter=' + filter : ''),
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

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

        //Create clients for current user partner:
        clientService.saveClient = function (client) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/agent/clients',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(client),
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

        //Update client Information for current user partner:
        clientService.updateClientInfo = function (partnerId, client) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/details',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(client),
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