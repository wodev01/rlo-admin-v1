'use strict';
app.factory('clientLocationService', ['$q', 'ErrorMsg',
    function ($q, ErrorMsg) {
        var clientLocationService = {};

        //Get users data
        clientLocationService.fetchLocations = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/locations',
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

        //create Location
        clientLocationService.createLocation = function (partnerId, location) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/locations',
                type: 'POST',
                data: location,
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

        //update Location
        clientLocationService.updateLocation = function (id, location) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/locations' + (id ? '/' + id : '' ),
                type: 'POST',
                data: location,
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

        /*-------------- Getter and Setter Method ---------*/
        var locationObj = {};
        clientLocationService.setLocationObj = function (newObj) {
            locationObj = newObj;
        };
        clientLocationService.getLocationObj = function () {
            return locationObj;
        };

        return clientLocationService;
    }
]);