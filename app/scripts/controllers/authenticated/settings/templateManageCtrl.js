'use strict';
app.controller('templateManageCtrl',
    function ($scope, $rootScope, $mdDialog, toastr, localStorage, templateService) {

        var getTemplateObj = templateService.getTemplateObj();
        if (CarglyPartner.user) {
            $scope.userObj = CarglyPartner.user;
        }

        $scope.rendered_template = {};
        $scope.toggleText = 'Text';
        $scope.isInterpolated = $scope.isToggled = false;
        $scope.selectedIndex = 0;
        $scope.isProcessing = false;

        var templateObj = {
            'name': '',
            'subject': '',
            'from_address': '',
            'from_name': '',
            'reply_to_address': ''
        };

        $scope.template = Object.keys(getTemplateObj).length != 0 ? angular.copy(getTemplateObj) : templateObj;
        $scope.previewText = $scope.template.text;

        if ($scope.template.preview_values) {
            localStorage.setItem('preview_values', angular.toJson(JSON.parse(getTemplateObj.preview_values)));
        } else {
            $scope.isInterpolated = true;
            localStorage.setItem('preview_values', '{}');
        }

        /*---------- Create/Update template ----------*/
        $scope.fnSaveTemplate = function (template) {
            var preview_values = angular.fromJson(localStorage.getItem('preview_values'));

            if (preview_values) {
                template.preview_values = angular.toJson(preview_values);
            }

            $scope.isProcessing = true;

            if (!template.id) { // id generated when creating template
                /*---------- Create template ----------*/

                templateService.createTemplate($scope.userObj.partnerId, template)
                    .then(function (data) {
                        if (data.id) {
                            toastr.success('Template created successfully...');
                        }
                        $rootScope.fnCloseManageTemplate();
                        $scope.isProcessing = false;
                        $rootScope.$broadcast('refreshTemplatesGrid');

                    }, function (error) {
                        toastr.error('Error creating template. Please try again...', 'STATUS CODE: ' + error.status);
                        $scope.isProcessing = false;
                        $rootScope.fnCloseManageTemplate();

                    });

            } else {
                /*---------- Edit template ----------*/

                templateService.editTemplate($scope.userObj.partnerId, template)
                    .then(function (data) {
                        if (data.id) {
                            toastr.success('Template updated successfully...');
                        }
                        $rootScope.fnCloseManageTemplate();
                        $scope.isProcessing = false;
                        $rootScope.$broadcast('refreshTemplatesGrid');

                    }, function (error) {
                        toastr.error('Error updating template. Please try again...', 'STATUS CODE: ' + error.status);
                        $scope.isProcessing = false;
                        $rootScope.fnCloseManageTemplate();

                    });

            }

        };

        /*>>>>> End Create/Update template <<<<<*/

        /*---------- Set template variable ----------*/
        function setTemplateVariables() {
            angular.forEach($scope.preview_values, function (val, key) {
                delete $scope[key];
            });

            $scope.preview_values = {};
            $scope.preview_values =
                localStorage.getItem('preview_values') ?
                    localStorage.getItem('preview_values') : {};

            if ($scope.preview_values) {
                /*----- Template variables substituted to preview tab -----*/
                angular.forEach($scope.preview_values, function (val, key) {
                    $scope[key] = val;
                });
            }

            $scope.toggleText === 'Text' ?
                $scope.fnGetInterpolatedTemplate('html') : $scope.fnGetInterpolatedTemplate('text');

        }

        $scope.fnOpenSetTemplateVariableModal = function (ev) {
            $mdDialog.show({
                controller: 'templateVarDialogCtrl',
                templateUrl: 'views/authenticated/settings/modals/templateVariable.dialog.html',
                targetEvent: ev
            }).then(function () {
                setTemplateVariables();
            }, function () {
            });
        };

        /*---------- Toggle preview for 'Text' or 'HTML' tab ----------*/
        $scope.fnTogglePreview = function () {
            $scope.isToggled = !$scope.isToggled;
            $scope.toggleText = $scope.isToggled ? 'HTML' : 'Text';

            $scope.isToggled ? $scope.fnGetInterpolatedTemplate('text') : $scope.fnGetInterpolatedTemplate('html');
        };

        /*---------- Call for interpolation API for interpolating template variable ----------*/
        $scope.fnGetInterpolatedTemplate = function (type) {
            var interpolateObj = {};

            if ($scope.template[type]) {
                interpolateObj.template = $scope.template[type];
                interpolateObj.data = angular.fromJson(localStorage.getItem('preview_values'));

                $scope.isInterpolated = false;
                templateService.interpolateTemplate(interpolateObj)
                    .then(function (data) {
                        $scope.rendered_template[type] = data.rendered_template;
                        $scope.isInterpolated = true;
                        $scope.fnRefreshDom();

                    }, function (error) {
                        toastr.error('Error interpolating template. Please try again...',
                            'STATUS CODE: ' + error.status);
                        $scope.isInterpolated = false;

                    });
            }
        };

        /*---------- Send Test Email - Testing an email without having to save ----------*/
        $scope.fnSendTestEmail = function (ev) {
            var testEmailCtrl = ['$scope', 'scope_template', function ($scope, scope_template) {
                var testEmailData = {};

                testEmailData.template = scope_template.html;
                testEmailData.data = angular.fromJson(localStorage.getItem('preview_values'));
                testEmailData.from_address = scope_template.from_address;
                testEmailData.subject = scope_template.subject;

                $scope.fnSendTestEmail = function (toAddress) {
                    testEmailData.to_address = toAddress;

                    templateService.sendTestEmail($scope.userObj.partnerId, testEmailData)
                        .then(function (data) {
                            toastr.success('Test email sent...');
                        }, function (error) {
                            toastr.error('Error sending test email. Please try again...',
                                'STATUS CODE: ' + error.status);
                        });

                    $mdDialog.cancel();
                };

                $scope.fnCloseDialog = function () {
                    $mdDialog.cancel();
                };

            }];

            $mdDialog.show({
                controller: testEmailCtrl,
                locals: {scope_template: $scope.template},
                template: '<md-dialog aria-label="Test Email dialog" style="min-width: 300px;">' +
                '   <md-content layout-padding>' +
                '       <form name="testEmailForm" layout="column" novalidate>' +
                '           <div class="md-headline"> Send Test Email </div>' +
                '           <div layout="column">' +
                '               <md-input-container class="remove-error-space">' +
                '                   <label> To Address </label>' +
                '                   <input type="email" name="to_address" ng-model="to_address" required />' +
                '                   <div ng-if="testEmailForm.$submitted || testEmailForm.to_address.$touched">' +
                '                       <span class="error-msg" ng-if="testEmailForm.to_address.$error.required">To address is required.</span>' +
                '                      <span class="error-msg" ng-if="testEmailForm.to_address.$error.email">This field must be a valid email address.</span>' +
                '                   </div>' +
                '               </md-input-container>' +
                '           </div>' +
                '           <md-dialog-actions class="padding-right-0">' +
                '               <md-button class="md-raised md-primary" type="submit"' +
                '                           ng-click="testEmailForm.$valid && fnSendTestEmail(to_address);">Send</md-button>' +
                '               <md-button class="md-warn md-raised"' +
                '                           ng-click="fnCloseDialog();">Cancel</md-button>' +
                '           </md-dialog-actions>' +
                '       </form>' +
                '   </md-content>' +
                '</md-dialog>',
                targetEvent: ev

            }).then(function (answer) {
            }, function (err) {
            });
        };

        /* Refresh Dom */
        $scope.fnRefreshDom = function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

    });