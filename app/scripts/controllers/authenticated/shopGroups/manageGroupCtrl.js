'use strict';
app.controller('manageGroupCtrl',
    function ($scope, $rootScope, toastr, groupService, $mdDialog, $q) {
        var groupId = '';
        $scope.isAddBtnDisabled = true;
        $scope.isGroupMembersLoad = false;
        $scope.partnerId = '';
        $scope.selectedGroupsTab = 0;
        $scope.autoComplete = {};
        $scope.isProcessing = false;

        $scope.searchTextChange = function (text) {
            $scope.isAddBtnDisabled = true;
        };

        $scope.initMember = function (text) {
            var deferred = $q.defer();
            groupService.fetchClientsUsingFilter(text)
                .then(function (res) {
                    var clientsArr = [];
                    angular.forEach(res, function (key) {
                        clientsArr.push({label: key.partner, id: key.id});
                    });
                    $scope.members = clientsArr;
                    deferred.resolve($scope.members);
                });
            return deferred.promise;
        };

        $scope.selectedItemChange = function (item) {
            if (item) {
                $scope.isAddBtnDisabled = false;
                $scope.partnerId = item.id;
            }else{
                $scope.isAddBtnDisabled = true;
            }
        };

        $scope.fnManageGroupInit = function () {
            if (groupService.getGroupObj().id) {
                groupId = groupService.getGroupObj().id;
                $scope.group = angular.copy(groupService.getGroupObj());
                $scope.fnFetchClients($scope.group);
            } else {
                $scope.group = {
                    name: ''
                };
            }
        };

        $scope.fnFetchClients = function (group) {
            groupService.fetchClients().then(function (res) {
                if (group) {
                    $scope.fetchGroupMembers(group, res);
                }
            });
        };

        $scope.fnSaveGroup = function (group) {
            $scope.isProcessing = true;
            if (group.id) {
                groupService.editGroup(group.id, group).then(function (res) {
                    toastr.success('Group saved successfully.');
                    $scope.fnGroupToastMsg(res);
                    $scope.fnCloseManageGroupSwap();
                    $scope.isProcessing = false;
                }, function (error) {
                    toastr.error('Failed saving group information.', 'STATUS CODE: ' + error.status);
                    $scope.isProcessing = false;
                });
            } else {
                groupService.createGroup(group).then(function (res) {
                    toastr.success('Group created successfully.');
                    $scope.fnGroupToastMsg(res);
                    $scope.fnCloseManageGroupSwap();
                    $scope.isProcessing = false;
                }, function (error) {
                    toastr.error('Failed creating group.', 'STATUS CODE: ' + error.status);
                    $scope.isProcessing = false;
                });
            }
        };

        $scope.fnAddMemberToGroup = function (partnerId) {
            if (groupId) {
                groupService.addMemberPartnerToGroup(groupId, partnerId)
                    .then(function (res) {
                        $scope.fnFetchClients(res);
                        $rootScope.$broadcast('RefreshGroupsGrid');
                        toastr.success('Location added to membership list.');
                    }, function () {
                        toastr.error('Something goe\'s wrong while adding membership list.');
                    });
            }
            $scope.isAddBtnDisabled = true;
        };

        $scope.fnGroupToastMsg = function (arr) {
            if (arr.data) {
                var data = JSON.parse(arr.data);
                toastr.error(data.messages[0].message);
            } else {
                $rootScope.$broadcast('RefreshGroupsGrid');
            }
        };

        $scope.fetchGroupMembers = function (group) {
            $scope.isGroupMembersLoad = false;
            groupService.fetchGroupMembers(group.id).then(function (data) {
                $scope.isGroupMembersLoad = true;
                $scope.fnGenerateGroupMemberGrid(data);
            });
        };

        $scope.fnGenerateGroupMemberGrid = function (data) {
            $scope.groupsMembersData = data;
            $scope.groupMembersAction = '<div layout="row">' +
                '<md-button class="md-icon-button md-warn" ' +
                '           ng-click="grid.appScope.fnGroupMemberDelete(row,$event)">' +
                '   <md-icon md-font-set="material-icons">delete</md-icon>' +
                '   <md-tooltip md-direction="top">Delete</md-tooltip>' +
                '</md-button></div>';

            $scope.groupMembersGridOptions = {
                data: 'groupsMembersData',
                rowHeight: 50,
                multiSelect: false,
                enableVerticalScrollbar: 0,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                columnDefs: [
                    {field: 'partner', displayName: 'Member Name', enableHiding: false},
                    {
                        name: 'action',
                        displayName: '',
                        cellTemplate: $scope.groupMembersAction,
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

            $scope.fnGroupMemberDelete = function (row, event) {
                var confirm = $mdDialog.confirm()
                    .title('Delete')
                    .content('Would you like to delete this member from group?')
                    .ariaLabel('Delete')
                    .ok('Delete')
                    .cancel('Cancel')
                    .targetEvent(event);
                $mdDialog.show(confirm).then(function () {
                    groupService.deleteMemberPartnerFromGroup(groupId, row.entity.id)
                        .then(function (res) {
                            $scope.fnFetchClients(res);
                            $rootScope.$broadcast('RefreshGroupsGrid');
                        });
                });
            };
        };

    });