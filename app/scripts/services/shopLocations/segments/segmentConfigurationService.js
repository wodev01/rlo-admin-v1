'use strict';
app.factory('segmentConfigurationService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var segmentConfigurationService = {};

        segmentConfigurationService.fetchSubSegments = function(locId, segmentId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId,
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

        segmentConfigurationService.reorderSubSegments = function(locId, segmentId, subSegmentId, position){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId
                        + '/subsegments/' + subSegmentId + '/reorder/' + position,
                type: 'POST',
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

        segmentConfigurationService.fetchSegmentPreview = function(locId, day, expression) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segmentpreview?day=' + day + '&expression=' + expression,
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
        var segmentConfigurationObj = {};
        segmentConfigurationService.setShopLocSegmentObj = function(newObj){
            segmentConfigurationObj = newObj;
        };
        segmentConfigurationService.getShopLocSegmentObj = function(){
            return segmentConfigurationObj;
        };

        return segmentConfigurationService;
    }

]);