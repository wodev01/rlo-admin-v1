'use strict';

app.controller('downloadCustomerCSVCtrl',
    function ($scope, pId, locationId, cookieName, $mdDialog,
              $timeout, $filter, $cookies, $state, $window, encodeParamService) {

        var token = $cookies.get(cookieName);
        $scope.downloadFilter = {};
        $scope.drpObj;

        $scope.fnInit = function () {
            $timeout(function () {
                $('#download-customer-csv-dialog #pickDateRange').daterangepicker({
                    datepickerOptions: {
                        numberOfMonths: 2,
                        maxDate: null
                    },
                    initialText: 'Select Date Period...',
                    presetRanges: [],
                    onChange: function () {
                        $scope.drpObj = $('#download-customer-csv-dialog #pickDateRange').daterangepicker('getRange');
                    }
                });

            }, 100);
        };

        $scope.fnDownload = function () {
            $mdDialog.hide();

            $scope.downloadFilter['from'] =
                $scope.drpObj && $scope.drpObj.start ? moment($scope.drpObj.start).format('YYYY-MM-DD') : '';
            $scope.downloadFilter['to'] =
                $scope.drpObj && $scope.drpObj.end ? moment($scope.drpObj.end).format('YYYY-MM-DD') : '';
            $scope.downloadFilter['oauth_token'] = token;

            $scope.downloadLink = 'https://carglyplatform.appspot.com/partners/api/crm/' +
                pId + '/customers.csv' + encodeParamService.getEncodedParams($scope.downloadFilter);

            $window.open($scope.downloadLink, '_blank');
        };

        $scope.fnHide = function () {
            $mdDialog.hide();
        };

    });