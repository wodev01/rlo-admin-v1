'use strict';
app.factory('templateService', ['$q', 'ErrorMsg',
    function ($q, ErrorMsg) {
        var templateService = {};

        // Fetch templates
        templateService.fetchTemplates = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates',
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

        // Create template
        templateService.createTemplate = function (partnerId, template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates',
                type: 'POST',
                data: template,
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

        // Edit template
        templateService.editTemplate = function (partnerId, template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates/' + template.id,
                type: 'POST',
                data: template,
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

        // Delete  template
        templateService.removeTemplate = function (partnerId, templateId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/email-templates/' + templateId,
                type: 'DELETE',
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

        // Interpolate template
        templateService.interpolateTemplate = function (template) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/interpolate',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(template),
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

        // Send test email
        templateService.sendTestEmail = function (partnerId, testEmailData) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/send-email',
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(testEmailData),
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
        var templateObj = {};
        templateService.setTemplateObj = function(newObj){
            templateObj = newObj;
        };
        templateService.getTemplateObj = function(){
            return templateObj;
        };

        return templateService;
    }

]);