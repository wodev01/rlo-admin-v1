'use strict';
app.controller('clientEmailsCtrl',
    function ($scope, $rootScope, $mdSidenav, $timeout,
              toastr, clientService, clientEmailService) {

        $scope.client = clientService.getClientObj().id ? angular.copy(clientService.getClientObj()) : {};
        var partnerId = $scope.client.id;

        $scope.isEmailsDataNotNull = $scope.isEmailsMsgShow = $scope.isMoreEmailData = false;
        $scope.isPagingData = true;
        $scope.clientEmailsData = {};

        $scope.pagingOptions = {
            page_num: 1,
            page_size: 20
        };

        /*---------- Get Client Emails ----------*/
        $scope.getPagedDataAsync = function () {
            $scope.isEmailsDataNotNull = $scope.isEmailsMsgShow = false;

            clientEmailService.fetchClientEmails(partnerId, $scope.pagingOptions)
                .then(function (data) {
                    if (data.length !== 0) {
                        $scope.isEmailsDataNotNull = true;
                        $scope.isEmailsMsgShow = false;
                        $scope.clientEmailsData = data;
                    } else {
                        $scope.isEmailsDataNotNull = false;
                        $scope.isEmailsMsgShow = true;
                    }

                }, function (error) {
                    if (error.status !== 401 && error.status !== 500) {
                        toastr.error('Something goe\'s wrong, getting emails data.');
                    }
                    $scope.isEmailsMsgShow = true;
                    $scope.isEmailsDataNotNull = false;

                });

        };

        $scope.clientEmailAction = '<div class="ui-grid-cell-contents padding-left-0">' +
            '   <md-button class="md-icon-button md-primary" aria-label="View" ng-click="grid.appScope.fnViewEmailClient(row)">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-eye"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">View</md-tooltip>' +
            '</md-button>' +
            '</div>';

        $scope.clientEmailsGridOptions = {
            data: 'clientEmailsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    field: 'sent',
                    displayName: 'Sent',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 200,
                    enableHiding: false
                },
                {field: 'location_name', displayName: 'Location', minWidth: 200, enableHiding: false},
                {field: 'to_email', displayName: 'Email', minWidth: 200, enableHiding: false},
                {field: 'state', displayName: 'Status', minWidth: 100, enableHiding: false},
                {
                    field: 'last_event',
                    displayName: 'Modified',
                    cellFilter: 'date:\'MM/dd/yyyy h:mm a\'',
                    minWidth: 200,
                    enableHiding: false
                },
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.clientEmailAction,
                    width: '50',
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ]
        };

        // Swapping view open function
        $scope.fnOpenManageEmailClient = function () {
            $timeout(function () {
                $rootScope.rightClientEmailSwapView = '';
                $scope.$apply();
                $rootScope.rightClientEmailSwapView = 'views/authenticated/clients/clientEmailManage.html';
                $scope.$apply();
                $mdSidenav('manageClientEmailSwap').open().then(function () {
                });
            });
        };

        /*---------- View Email Client ----------*/
        $scope.fnViewEmailClient = function (row) {
            $rootScope.locationName = row.entity.location_name;
            clientEmailService.setClientEmailObj(row.entity);
            $scope.fnOpenManageEmailClient();
        };

        $rootScope.fnCloseClientEmailSwap = function () {
            $mdSidenav('manageClientEmailSwap').close().then(function () {
                clientEmailService.setClientEmailObj({});
            });
        };

        /*---------- Load more emails data ----------*/
        $scope.fnShowMoreEmails = function () {
            if (!$scope.isMoreEmailData) {
                $scope.pagingOptions.page_num += 1;
                $scope.isMoreEmailData = true;
                $scope.isPagingData = true;

                clientEmailService.fetchClientEmails(partnerId, $scope.pagingOptions)
                    .then(function (data) {
                        if (data.length !== 0) {
                            $scope.clientEmailsData = $scope.clientEmailsData.concat(data);
                            $scope.isMoreEmailData = false;
                        } else {
                            $scope.isPagingData = false;
                        }
                    }, function (error) {
                        if (error.status !== 401 && error.status !== 500) {
                            toastr.error('Something goe\'s wrong, getting emails data.');
                        }

                    });
            }
        };

        /*---------- Initialization ----------*/
        $scope.fnInitEmails = function () {
            $scope.getPagedDataAsync();
        };

        $rootScope.rightClientEmailSwapView = 'views/authenticated/clients/clientEmailManage.html';

    });