'use strict';
app.factory('segmentInteractionService',['$q', 'ErrorMsg', 'encodeParamService',
    function($q, ErrorMsg, encodeParamService) {

        var segmentInteractionService = {};

        segmentInteractionService.fetchSegmentInteraction = function(locId, segmentId, paramsObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/segments/' + segmentId + '/interactions'
                            + encodeParamService.getEncodedParams(paramsObj),
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

        segmentInteractionService.saveSegmentInteraction = function(locId, interactionId, segmentInteractionObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/crm/' + locId + '/interactions/' + interactionId,
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(segmentInteractionObj),
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
        var segmentInteractionObj = {};
        segmentInteractionService.setShopLocSegmentObj = function(newObj){
            segmentInteractionObj = newObj;
        };
        segmentInteractionService.getShopLocSegmentObj = function(){
            return segmentInteractionObj;
        };

        return segmentInteractionService;
    }
]);