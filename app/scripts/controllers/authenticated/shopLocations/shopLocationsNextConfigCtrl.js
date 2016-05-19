'use strict';
app.controller('shopLocationsNextConfigCtrl',
    function ($scope, shopLocationsService) {

        $scope.shopLocationData = shopLocationsService.getShopLocationsObj().id ? angular.copy(shopLocationsService.getShopLocationsObj()) : {};
        var locId = $scope.shopLocationData.id ? $scope.shopLocationData.id : null;

        $scope.shopLocationData.lastConfig = $scope.shopLocationData.lastConfig ? $scope.shopLocationData.lastConfig : {
            'settings': {
                'shopmgmtsystem.subscriptions': 'timekeeping,inspections',
                'shopmgmtsystem.type': '',
                'shopmgmtsystem.db.location': '',
                'carglyconnect.location.name': '',
                'shopmgmtsystem.db.pinrequired': '',
                'carglyconnect.location.address': '',
                'carglyconnect.locationid': '',
                'carglyconnect.lastsyncro': '',
                'carglyconnect.url': '',
                'shopmgmtsystem.db.password': '',
                'server.ipaddress': '',
                'carglyconnect.location.state': '',
                'carglyconnect.location.city': '',
                'carglyconnect.location.zip': '',
                'carglyconnect.payments.publickey': '',
                'shopmgmtsystem.logo': '',
                'carglyconnect.location.phone': ''
            }
        };
        var settingsObjLen = Object.keys($scope.shopLocationData.lastConfig.settings).length;
        $scope.nextConfig = {};
        $scope.keyDDArr = [{label: 'Run Update', val: 'run_update'}, {label: '──────────', val: ''}];
        $scope.selectedKey = {};
        $scope.tableRowObjForDD = {};
        $scope.isChecked = false;
        $scope.isAddBtnShow = false;
        $scope.isResetBtnShow = false;
        $scope.isSaveDisabled = false;
        var MSG = 'Config is currently being update, please wait…';

        $scope.fnCreateDD = function () {
            if ($scope.shopLocationData.lastConfig) {
                angular.forEach($scope.shopLocationData.lastConfig, function (val, key) {
                    if (key === 'settings') {
                        angular.forEach(val, function (setVal, setKey) {
                            $scope.keyDDArr.push({label: setKey, val: setKey});
                        });
                    }
                });
            }
        };

        $scope.fnInitDD = function (key, nextConfig, keyDDArr) {
            $scope.selectedKey[key] = key;
            var newArr = [];

            /*------- create new option for current key ---------------*/
            for (var intIndex = 0; intIndex < keyDDArr.length; intIndex++) {
                if (nextConfig[keyDDArr[intIndex].val] === undefined) {
                    if (keyDDArr[intIndex].val !== '') {
                        if (keyDDArr[intIndex].val === 'run_update') {
                            newArr.unshift($scope.keyDDArr[1]);
                            newArr.unshift($scope.keyDDArr[0]);
                        } else {
                            newArr.push(keyDDArr[intIndex]);
                        }
                    }
                } else {
                    if (key === keyDDArr[intIndex].val) {
                        if (key === 'run_update') {
                            newArr.unshift(keyDDArr[1]);
                            newArr.unshift(keyDDArr[intIndex]);
                        } else {
                            newArr.unshift(keyDDArr[intIndex]);
                        }
                    }
                }
            }
            $scope.tableRowObjForDD[key] = newArr;

            /*---- pass remaining option to each DD -----*/
            angular.forEach($scope.tableRowObjForDD, function (rowVal, rowKey) {
                angular.forEach(rowVal, function (newArrVal, newArrIndex) {
                    angular.forEach($scope.selectedKey, function (selectedObjVal) {
                        if (newArrVal.val === selectedObjVal) {
                            if (rowKey !== selectedObjVal) {
                                if (key === 'run_update') {
                                    rowVal.splice(newArrIndex, 2);
                                } else {
                                    rowVal.splice(newArrIndex, 1);
                                }
                            }
                        }
                    });
                });
            });
        };

        $scope.fnChangeDD = function (nextConfig, key, selectedKey) {
            delete $scope.selectedKey[key];
            delete nextConfig[key];
            delete $scope.tableRowObjForDD[key];
            angular.forEach($scope.tableRowObjForDD, function (rowVal, rowKey) {
                if (key === 'run_update') {
                    $scope.tableRowObjForDD[rowKey].unshift($scope.keyDDArr[1]);
                    $scope.tableRowObjForDD[rowKey].unshift($scope.keyDDArr[0]);
                } else {
                    $scope.tableRowObjForDD[rowKey].push({label: key, val: key});
                }
            });
            nextConfig[selectedKey] = '';
        };

        $scope.fnTextBoxKeyEvent = function (nextConfig, key, val) {
            nextConfig[key] = val;
        };

        $scope.fnInitShopLocNextConfig = function () {
            $scope.fnCreateDD();
            $scope.fnFetchNextConfig();
        };

        function isEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        }

        $scope.fnFetchNextConfig = function () {
            if (locId) {
                shopLocationsService.fetchNextConfig(locId).then(function (res) {
                    if (!isEmpty(res)) {
                        $scope.nextConfig = res;
                        $scope.isUpdated = true;
                        $scope.msg = MSG;
                        $scope.isResetBtnShow = true;
                        $scope.isSaveDisabled = true;
                        shopLocationsService.saveNextConfig(locId, res).then(function (res) {
                            if (res === null) {
                                $scope.isUpdated = false;
                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }
                        });
                    } else {
                        var ncLen = Object.keys(res).length;
                        if (ncLen !== settingsObjLen) {
                            $scope.isAddBtnShow = true;
                            $scope.isSaveDisabled = false;
                        }
                    }
                });
            }
        };

        $scope.fnResetTable = function (nextConfig) {
            var ncLen = Object.keys(nextConfig).length;
            if (ncLen === settingsObjLen) {
                $scope.isAddBtnShow = false;
            } else {
                $scope.isAddBtnShow = true;
                $scope.isResetBtnShow = false;
            }
            $scope.isSaveDisabled = false;
        };

        var oldVal = {};
        $scope.fnCheckboxChange = function (isChecked, nextConfig, ncKey, ncVal) {
            if (ncVal) {
                oldVal[ncKey] = ncVal;
            }
            if (isChecked) {
                nextConfig[ncKey] = '';
            } else {
                nextConfig[ncKey] = oldVal[ncKey];
            }
        };

        $scope.fnAddRow = function (nextConfig, keyDDArr) {
            var ncLen = Object.keys(nextConfig).length;
            for (var intIndex = 0; intIndex < keyDDArr.length; intIndex++) {
                if (keyDDArr[intIndex].val !== '') {
                    if (nextConfig[keyDDArr[intIndex].val] === undefined) {
                        nextConfig[keyDDArr[intIndex].val] = '';
                        $scope.isChecked = true;
                        break;
                    }
                }
            }

            if (ncLen === settingsObjLen) {
                $scope.isAddBtnShow = false;
            }
        };

        $scope.fnDeleteRow = function (nextConfig, selectedKey) {
            delete nextConfig[selectedKey];
            delete $scope.selectedKey[selectedKey];
            var ncLen = Object.keys(nextConfig).length;
            if (ncLen - 1 !== settingsObjLen) {
                $scope.isAddBtnShow = true;
            }

            /*---------------  after delete value assign to each dd ----------------*/
            angular.forEach($scope.tableRowObjForDD, function (rowVal, rowKey) {
                if (selectedKey === 'run_update') {
                    $scope.tableRowObjForDD[rowKey].unshift($scope.keyDDArr[1]);
                    $scope.tableRowObjForDD[rowKey].unshift($scope.keyDDArr[0]);
                } else {
                    $scope.tableRowObjForDD[rowKey].push({label: selectedKey, val: selectedKey});
                }
            });
        };

        $scope.fnSaveNextConfig = function (nextConfig) {
            $scope.isUpdated = true;

            $scope.isSaveDisabled = true;
            $scope.isAddBtnShow = false;
            $scope.isResetBtnShow = true;
            $scope.msg = MSG;

            shopLocationsService.saveNextConfig(locId, nextConfig).then(function (res) {
                if (res === null) {
                    $scope.isUpdated = false;
                    oldVal = {};
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            });
        };
    });