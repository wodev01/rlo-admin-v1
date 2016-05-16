'use strict';
app.controller('shopLocationsCtrl',
    function ($scope, $mdSidenav, toastr, $rootScope, $cookies, $state,
              $mdDialog, $mdBottomSheet, groupService, clientBillingServices, shopLocationsService) {

        $scope.rightEditView = 'views/authenticated/shopLocations/manageShopLocations.html';
        $scope.isTabsLoad = false;
        $scope.searchFilter = '';
        $scope.selectedLocationId = '';
        $scope.isPagingCursor = false;
        $scope.isMoreShopLocations = false;

        $scope.filter = {
            'filter': '',
            'group_id': ''
        };

        $scope.fnInitShopLocations = function () {
            $scope.fnCreateFilters();
        };

        /*---- create group filter DD ------*/
        $scope.fnCreateFilters = function () {
            $scope.selectGroupOptions = [{name: 'All Groups', value: ''}];
            groupService.fetchGroups().then(function (res) {
                angular.forEach(res, function (key) {
                    $scope.selectGroupOptions.push({name: key.name, value: key.id});
                });
            });
            $scope.selectGroup = $scope.selectGroupOptions[0].value;
            $scope.$watch('searchFilter', function (newVal) {
                $scope.searchFilter = newVal;
                $scope.filter.filter = newVal;
                $scope.filter.group_id = $scope.selectGroup;
                $scope.getPagedDataAsync($scope.filter);
            });
        };

        $scope.fnChangeGroup = function (selectGroup) {
            $scope.filter.group_id = selectGroup;
            $scope.getPagedDataAsync($scope.filter);
        };

        $scope.setData = function (data) {
            angular.forEach(data, function (key) {
                key.lastConfig = JSON.parse(key.lastConfig);
                if (key.lastConfig) {
                    key.getSMSInfoNameAndDBHealth = key.lastConfig.sms_info.name + ' - ' + key.lastConfig.sms_info.db_health;
                }
            });
            $scope.shopLocationsData = data;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.getPagedDataAsync = function (filter) {
            $scope.isShopLocationsMsgShow = false;
            $scope.isShopLocationsDataNotNull = false;
            setTimeout(function () {
                if (filter) {
                    shopLocationsService.filterShopLocationsData(filter).then(function (response) {
                        if (response.data.length !== 0) {
                            $scope.isShopLocationsMsgShow = false;
                            $scope.isShopLocationsDataNotNull = true;
                            $scope.setData(response.data);
                        } else {
                            $scope.isShopLocationsDataNotNull = false;
                            $scope.isShopLocationsMsgShow = true;
                        }

                        if ($scope.isShopLocationsDataNotNull && !$scope.isShopLocationsMsgShow) {
                            $scope.isPagingCursor =
                                response.headers['x-paging-cursor'] ? false : true;
                        }
                    });
                } else {
                    shopLocationsService.filterShopLocationsData(filter).then(function (response) {
                        if (response.data.length !== 0) {
                            $scope.isShopLocationsMsgShow = false;
                            $scope.isShopLocationsDataNotNull = true;
                            $scope.setData(response.data);
                        } else {
                            $scope.isShopLocationsDataNotNull = false;
                            $scope.isShopLocationsMsgShow = true;
                        }

                        if ($scope.isShopLocationsDataNotNull && !$scope.isShopLocationsMsgShow) {
                            $scope.isPagingCursor =
                                response.headers['x-paging-cursor'] ? false : true;
                        }
                    });
                }
            }, 100);
        };

        $scope.selectedShopLocations = [];
        $scope.colorIndicator =
            '<div class="checked_item" style="margin-bottom: 5px;" location-indicator' +
            '     data-obj="row.entity"></div>';

        $scope.shopLocationsAction = '<div layout="row">' +
            '<md-button class="md-icon-button md-primary" aria-label="Open" ng-click="grid.appScope.fnShopLocationsEdit(row, $event);">' +
            '   <md-icon md-font-set="fa fa-lg fa-fw fa-eye"></md-icon>' +
            '   <md-tooltip ng-if="$root.isMobile === null" md-direction="top">Open</md-tooltip>' +
            '</md-button></div>';

        $scope.shopLocationsGridOptions = {
            data: 'shopLocationsData',
            rowHeight: 50,
            multiSelect: false,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {
                    name: 'status',
                    displayName: '',
                    cellTemplate: $scope.colorIndicator,
                    width: 50,
                    enableSorting: false,
                    enableColumnMenu: false
                },
                {field: 'name', displayName: 'Location', minWidth: 100, enableHiding: false},
                {field: 'subscriptions', displayName: 'Subscriptions', minWidth: 100, enableHiding: false},
                {field: 'phone', displayName: 'Phone', minWidth: 100, enableHiding: false},
                {field: 'currentVersion', displayName: 'Sync app’s version', minWidth: 100, enableHiding: false},
                {
                    name: 'action',
                    displayName: '',
                    cellTemplate: $scope.shopLocationsAction,
                    width: 50,
                    enableSorting: false,
                    enableColumnMenu: false
                }
            ],
            onRegisterApi: function (gridApi) {
                gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    row.isSelected = true;
                });
            }
        };

        $scope.fnShopLocationsEdit = function (row) {
            //Swapping view open function
            $scope.fnOpenManageShopLocationsSwapView(row);
        };

        //Swapping view close function
        $scope.fnCloseNewShopLocationsSwap = function () {
            $mdSidenav('newShopLocationView').close().then(function () {
            });
        };

        /*-------------- Load More Shop-locations ---------------*/
        $scope.fnLoadMoreShopLocations = function () {
            if (!$scope.isMoreShopLocations) {
                $scope.isMoreShopLocations = true;
                shopLocationsService.fetchMoreShopLocations()
                    .then(function (response) {
                        $scope.shopLocationsData = $scope.shopLocationsData.concat(response.data);
                        $scope.isPagingCursor =
                            response.headers['x-paging-cursor'] ? false : true;
                        $scope.isMoreShopLocations = false;
                    });
            }
        };

        /*----------- Manage Shop Locations ------------*/
        $scope.fnOpenManageShopLocationsSwapView = function (row) {
            clientBillingServices.fetchClientSubscriptionInfo(row.entity.partnerId)
                .then(function (res) {
                    $scope.shopLocationObj = row.entity;
                    $scope.shopLocationObj.subscription_status = res.subscription_status;

                    shopLocationsService.setShopLocationsObj(row.entity);
                    setTimeout(function () {
                        $scope.rightEditView = '';
                        $scope.$apply();
                        $scope.rightEditView = 'views/authenticated/shopLocations/manageShopLocations.html';
                        $scope.$apply();
                        $scope.isTabsLoad = true;
                        $mdSidenav('manageShopLocationsView').open()
                            .then(function () {
                            });
                    });
                });
        };

        $scope.fnCloseManageShopLocationsSwapView = function () {
            $scope.isTabsLoad = false;
            $mdSidenav('manageShopLocationsView').close().then(function () {
                shopLocationsService.setShopLocationsObj({});
            });
        };

        /*------------ manage tabs ------*/
        $scope.selectedIndex = 0;

        $scope.fnSendDailyEmail = function (shopLocationData, event) {
            var dailyEmailDialogCtrl = ['$scope', function ($scope) {
                $scope.prevYear = moment().year() - 1;
                $scope.selectedYear = '';

                $scope.fnSendDailyEmail = function () {
                    shopLocationsService.sendDailyEmail(shopLocationData.id, $scope.selectedYear)
                        .then(function () {
                            toastr.success('Email sent successfully.');
                        });
                    $scope.fnCloseDialog();
                };

                $scope.fnCloseDialog = function () {
                    $mdDialog.cancel();
                };
            }];

            $mdDialog.show({
                controller: dailyEmailDialogCtrl,
                template: '<md-dialog aria-label="Daily Email dialog">' +
                '   <md-content layout="column" layout-margin>' +
                '       <h2 layout-padding> Send Daily Email </h2>' +
                '       <div layout="column" layout-margin>' +
                '           <md-input-container>' +
                '               <md-select aria-label="Select Year" ng-model="selectedYear">' +
                '                   <md-option value="">Current Year</md-option>' +
                '                   <md-option ng-value="prevYear">{{prevYear}}</md-option>' +
                '               </md-select>' +
                '           </md-input-container>' +
                '       <div>' +
                '       <div layout-margin> Are you sure you want to send the email?</div>' +
                '       <div layout="row" layout-align="end center">' +
                '           <md-button class="md-raised md-primary"' +
                '                       ng-click="fnSendDailyEmail();">Send</md-button>' +
                '           <md-button class="md-raised md-warn" style="margin:0px 10px !important;"' +
                '                       ng-click="fnCloseDialog();">Cancel</md-button>' +
                '       </div>' +
                '    </md-content>' +
                '</md-dialog>',
                targetEvent: event

            }).then(function (answer) {
            }, function (err) {
            });

        };

        $scope.$on('locationChanged', function (event, locationId) {
            $scope.selectedLocationId = locationId;
            event.stopPropagation();
        });

        /*----------- End of Manage Shop Locations ------------*/

        $scope.fnOpenBottomSheet = function () {
            var parentElem = $('#manage-shoploc-sidenav.md-sidenav-right');
            parentElem.css('overflow', 'hidden');

            $mdBottomSheet.show({
                scope: $scope.$new(),
                clickOutsideToClose: true,
                parent: parentElem,
                template: '<md-bottom-sheet class="md-grid" layout="column" ng-cloak>' +
                '   <div layout="row" layout-align="start center" >' +
                '       <md-button class="md-raised md-primary" ' +
                '                  ng-click="fnSendDailyEmail(shopLocationObj, $event);">Send Daily Email' +
                '       </md-button>' +
                '   </div>' +
                '</md-bottom-sheet>'
            }).then(function () {
            }, function () {
                parentElem.css('overflow-y', 'auto');
            });
        };

        $scope.fnCheckSubscription = function (locationObj, subscription) {

            var hasSubscriptions = true;
            if (locationObj.subscriptions) {
                var locSubscriptions = locationObj.subscriptions;
                /*locSubscriptions.push('rlo_daily_email'); locationObj.subscription_status = 'Active';*/
                if (locSubscriptions.indexOf(subscription) > -1 && locationObj.subscription_status === 'Active') {
                    hasSubscriptions = false;
                }
            }
            return hasSubscriptions;
        };

    });
