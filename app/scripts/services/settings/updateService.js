'use strict';
app.factory('updateService',['$q', 'ErrorMsg',
    function($q, ErrorMsg) {
        var updateService = {};

        //Get updates definitions data
        updateService.fetchUpdatesDefinitions = function(type, page_num, page_size){
            var param = '';
            if(type && page_num && page_size){param = '?type='+type+'&page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_num){param = '?type='+type+'&page_num='+page_num;}
            else if(page_num && page_size){param = '?page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_size){param = '?type='+type+'&page_size='+page_size;}
            else if(type){param = '?type='+type;}
            else if(page_num){param = '?filter='+page_num;}
            else if(page_size){param = '?page_size='+page_size;}

            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/update-definitions'+param,
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

        //delete update definitions by row id
        updateService.deleteUpdateDefinitions = function(id){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/update-definitions/' + id,
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

        //save and update update definitions.
        updateService.saveUpdateDefinitions = function(id, updateObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/update-definitions' + (id ? '/' + id : '' ),
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(updateObj),
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

        //Get updates data
        updateService.fetchUpdates = function(partnerId,type, page_num, page_size){
            var param = '';
            if(type && page_num && page_size){param = '?type='+type+'&page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_num){param = '?type='+type+'&page_num='+page_num;}
            else if(page_num && page_size){param = '?page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_size){param = '?type='+type+'&page_size='+page_size;}
            else if(type){param = '?type='+type;}
            else if(page_num){param = '?filter='+page_num;}
            else if(page_size){param = '?page_size='+page_size;}

            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+partnerId+'/updates'+param,
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

        //delete update by row id
        updateService.deleteUpdate = function(partnerId,id){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+partnerId+'/updates/' + id,
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

        //create update.
        updateService.createUpdate = function(partnerId, updateObj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+partnerId+'/updates',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(updateObj),
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

        //Get update status data
        updateService.fetchUpdateStatuses = function(partnerId,type, page_num, page_size){
            var param = '';
            if(type && page_num && page_size){param = '?type='+type+'&page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_num){param = '?type='+type+'&page_num='+page_num;}
            else if(page_num && page_size){param = '?page_num='+page_num+'&page_size='+page_size;}
            else if(type && page_size){param = '?type='+type+'&page_size='+page_size;}
            else if(type){param = '?type='+type;}
            else if(page_num){param = '?filter='+page_num;}
            else if(page_size){param = '?page_size='+page_size;}

            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/'+partnerId+'/update-statuses'+param,
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

        //create update status.
        updateService.createUpdateStatus = function(obj){
            var defer = $q.defer();
            CarglyPartner.ajax({
                url:  '/partners/api/updates/status',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(obj),
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
        var updateObj = {};
        updateService.setUpdateObj = function(newObj){
            updateObj = newObj;
        };
        updateService.getUpdateObj = function(){
            return updateObj;
        };

        return updateService;
    }
]);
