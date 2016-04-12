'use strict';
app.factory('locationService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var locationService = {};

        //Get locations data
        locationService.fetchLocation = function(){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/locations',
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //delete location by row id
        locationService.deleteLocation = function(rowID){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/locations/' + rowID,
                type: 'DELETE',
                data: null,
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //save and update location
        locationService.saveLocation = function(id, newLocation){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/locations' + (id ? '/' + id : '' ),
                type: 'POST',
                data: newLocation,
                success: function (data) {
                    defer.resolve(data);
                },
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

		//Get repair order data
        locationService.repairOrder = function(locationID){
			var defer = $q.defer();
			CarglyPartner.ajax({
				url: '/partners/api/locations/'+ locationID +'/events',
				type: 'GET',
				success: function (data) {
					defer.resolve(data);
				},
                error:function(error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
			});
			return defer.promise;
		};

        /*-------------- Getter and Setter Method ---------*/
        var locationObj = {};
        locationService.setLocationObj = function(newObj){
            locationObj = newObj;
        };
        locationService.getLocationObj = function(){
            return locationObj;
        };

        return locationService;
    }
]);
