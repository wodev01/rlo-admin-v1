'use strict';
app.controller('templatesCtrl',
    function ($scope, $rootScope, $timeout, $mdDialog, $mdSidenav,
              toastr, localStorage, templateService, $stateParams) {

        $rootScope.rightTemplateSwapView = 'views/authenticated/settings/templateManage.html';
        var partnerId = ""; // Get from fnInitTemplates();

        $scope.templatesData = {};
        $scope.isTemplatesDataNotNull = $scope.isTemplatesMsgShow = false;

        $scope.intIndex = undefined;

        /*---------- Create Template ----------*/
        $scope.fnCreateTemplate = function () {
            $rootScope.editTemplateName = 'Create New Template';
            $scope.fnOpenTemplateSwap();
        };

        /*---------- Open Template Swapping View----------*/
        $scope.fnOpenTemplateSwap = function () {
            $timeout(function () {
                $rootScope.rightTemplateSwapView = '';
                $scope.$apply();
                $rootScope.rightTemplateSwapView = 'views/authenticated/settings/templateManage.html';
                $scope.$apply();
                $mdSidenav('manageTemplateSwap').open().then(function () {
                });
            });

        };

        /*---------- Close Template Swapping View ----------*/
        $rootScope.fnCloseManageTemplate = function () {
            localStorage.removeItem('preview_values');
            $mdSidenav('manageTemplateSwap').close().then(function () {
            });
            templateService.setTemplateObj({});
        };

        /*---------- Get templates data from server ----------*/
        $scope.getPagedDataAsync = function () {
            $scope.isTemplatesDataNotNull = $scope.isTemplatesMsgShow = false;

            templateService.fetchTemplates(partnerId)
                .then(function (data) {
                    if (data.length !== 0) {
                        $scope.templatesData = data;
                        $scope.isTemplatesDataNotNull = true;
                        $scope.isTemplatesMsgShow = false;
                    } else {
                        $scope.isTemplatesDataNotNull = false;
                        $scope.isTemplatesMsgShow = true;
                    }
                }, function (error) {
                    toastr.error('Failed retrieving templates.', 'STATUS CODE: ' + error.status);
                });

        };

        /*---------- Template Grid Options ----------*/
        $scope.templateAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" aria-label="Edit" ng-click="grid.appScope.fnEditTemplate(row);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-pencil"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Edit</md-tooltip></md-button>' +
            '<md-button class="md-icon-button md-warn" aria-label="Delete" ng-click="grid.appScope.fnRemoveTemplate(row,$event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-trash"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Delete</md-tooltip></md-button></div>';

        $scope.templateGridOptions = {
            data: 'templatesData',
            rowHeight: 50,
            multiSelect: false,
            enableVerticalScrollbar: 0,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [
                {field: 'name', displayName: 'Name', minWidth: 200, enableHiding: false},
                {field: 'subject', displayName: 'Subject', minWidth: 250, enableHiding: false},
                {field: 'from_name', displayName: 'From Name', minWidth: 150, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    width: 100,
                    enableSorting: false,
                    enableColumnMenu: false,
                    cellTemplate: $scope.templateAction,
                    enableColumnResizing: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        /*---------- Edit Template ----------*/
        $scope.fnEditTemplate = function (row) {
            $rootScope.editTemplateName = 'Edit ' + row.entity.name;
            templateService.setTemplateObj(row.entity);
            $scope.fnOpenTemplateSwap();
        };

        /*---------- Remove Template ----------*/
        $scope.fnRemoveTemplate = function (row, event) {
            var templateId = row.entity.id;

            var confirm = $mdDialog.confirm()
                .title('Delete')
                .content('Would you like to delete this template?')
                .ariaLabel('Delete')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(event);

            $mdDialog.show(confirm).then(function () {
                templateService.removeTemplate(partnerId, templateId)
                    .then(function (data) {
                        toastr.success('Template deleted successfully...');
                        $scope.getPagedDataAsync();
                    }, function (error) {
                        toastr.error('Error deleting template. Please try again...', 'STATUS CODE: ' + error.status);
                    });
            });

        };

        /*---------- Refresh grid ----------*/
        $scope.$on('refreshTemplatesGrid', function () {
            $scope.getPagedDataAsync();
        });

        /*---------- Initialize Templates ----------*/
        $scope.fnInitTemplates = function () {
            if (CarglyPartner.user) {
                $scope.userObj = CarglyPartner.user;
                partnerId = $scope.userObj.partnerId;
                if ($stateParams.settingsName == 'templates') {
                    $scope.getPagedDataAsync();
                }
            }
        };
    });