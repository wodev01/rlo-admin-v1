'use strict';
app.factory('shopLocationSegmentService',['$q', 'ErrorMsg', 'encodeParamService',
    function($q, ErrorMsg, encodeParamService) {
        var shopLocationSegmentService = {};

        shopLocationSegmentService.fetchShopLocationSegments = function(locId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments',
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

        shopLocationSegmentService.rematchLastSixMonths = function(locId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/rematch',
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

        shopLocationSegmentService.saveShopLocationSegments = function(locId, segmentObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(segmentObj),
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

        shopLocationSegmentService.editShopLocationSegments = function(locId, segmentObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentObj.id,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(segmentObj),
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

        shopLocationSegmentService.removeShopLocationSegments = function(locId, segmentId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId,
                type: 'DELETE',
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

        /*------------------ Sub Segments ----------------*/
        shopLocationSegmentService.fetchSubSegmentsCustomers = function(locId, segmentId, subSegmentId, customerFilter){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/'
                    + segmentId + '/subsegments/' + subSegmentId + '/customers'
                    + encodeParamService.getEncodedParams(customerFilter),
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

        shopLocationSegmentService.createSubSegments = function(locId, segmentId, subSegmentObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId + '/subsegments',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(subSegmentObj),
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

        shopLocationSegmentService.editSubSegments = function(locId, segmentId, subSegment){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId + '/subsegments/' + subSegment.id,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(subSegment),
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

        shopLocationSegmentService.removeSubSegments = function(locId, segmentId, subSegmentId){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId + '/subsegments/' + subSegmentId,
                type: 'DELETE',
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
        var shopLocSegmentObj = {};
        shopLocationSegmentService.setShopLocSegmentObj = function(newObj){
            shopLocSegmentObj = newObj;
        };
        shopLocationSegmentService.getShopLocSegmentObj = function(){
            return shopLocSegmentObj;
        };

        return shopLocationSegmentService;
    }
]);