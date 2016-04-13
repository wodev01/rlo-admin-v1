'use strict';
app.controller('shopLocationsDashboardCtrl',
    function ($scope, $rootScope, $mdDialog, $filter, $timeout,
              toastr, shopLocationsService, shopLocationsDashboardServices) {

        $scope.shopLocation =
            shopLocationsService.getShopLocationsObj() ? shopLocationsService.getShopLocationsObj() : {};
        var partnerId = $scope.shopLocation.partnerId;

        $scope.locationDDOptions = [];
        $scope.selectedLocationOption = '';

        /*-- Summary section --*/
        $scope.isDailySummaryData = false;
        $scope.currentYearData = $scope.priorYearData = $scope.last_12_months = $scope.last_30_days = {};

        /*-- Summary section DD --*/
        $scope.summaryDDOptions = [];
        $scope.selectedSummaryOption = '';
        $scope.curr_summary_2015 = $scope.prior_summary_2015 = $scope.dec_summary_2015 = {};
        $scope.isSummary2015Data = false;

        /*-- Emp. performance chart --*/
        $scope.empPerformanceDDOptions = [];
        $scope.selectedEmpPerformanceOption = '';
        $scope.createEmpPerformanceJSON = {};
        $scope.isEmpPerformanceDataLoaded = false;
        $scope.isEmpPerformanceMsg = false;

        /*-- Marketing source chart --*/
        $scope.createMarketingSourceArr = [];
        $scope.isMarketingSourcesDataLoaded = false;
        $scope.isMarketingSourcesMsg = false;

        /*-- Customer Report chart --*/
        $scope.custRepoOptions = [];
        $scope.selectedCustRepoOptions = '';

        var halfMonthArr = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        var fullMonthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $scope.getLast12Month = [];
        var current_day = new Date().getDate();
        var current_month = new Date().getMonth() + 1;
        var current_year = new Date().getFullYear();

        $scope.fnCheckEventStartDate = function (year, month, day) {
            var event_start_date = '';
            if (new Date(year, month, 0).getDate() === day) {
                if (month === 12) {
                    event_start_date = (year + 1) + '-01-01T05:00:00.000Z';
                } else {
                    event_start_date = year + '-' + (month + 1) + '-01T05:00:00.000Z';
                }
            } else {
                event_start_date = year + '-' + month + '-' + (day + 1) + 'T05:00:00.000Z';
            }
            return event_start_date;
        };

        var event_start_date = $scope.fnCheckEventStartDate(current_year, current_month, current_day);
        var event_end_date = current_year + '-' + current_month + '-' + current_day + 'T05:00:00.000Z';

        $scope.createJSON = {};
        $scope.createPieChartJson = {};

        var summaryKeysArr = ['gross_sales_cents', 'average_daily_sales_gross_cents',
            'average_sale_cents', 'average_daily_sales_count'];
        $scope.varianceObj = [];
        var variance_obj = {};

        /*-- Monthly bar-chart section --*/
        $scope.isMonthlySummaryData = false;
        $scope.monthToDate = {};

        /*---------- Fetch locations ----------*/
        $scope.fnGetLocationDetails = function () {
            $scope.locationDDOptions = [];
            shopLocationsDashboardServices.fetchLocations(partnerId)
                .then(function (response) {
                    $scope.fnCreateLocationDD(response);
                }, function (error) {
                    toastr.error('Retrieving locations failed.', 'STATUS CODE: ' + error.status);
                });
        };

        /*----------- Create Location Drop Down-------------*/
        $scope.fnCreateLocationDD = function (response) {
            angular.forEach(response, function (obj) {
                $scope.locationDDOptions.push({id: obj.id, name: obj.name});
            });

            $scope.locationDDOptions.unshift({id: '', name: 'All locations'});
            $scope.selectedLocationOption = $scope.shopLocation.id;
            $scope.fnLocationChange($scope.selectedLocationOption);
        };

        /*---------- Location change event ----------*/
        $scope.fnLocationChange = function (selectedLocationOption) {
            $scope.currentDate = moment().toDate();

            console.log('Summary-Section: Call for /reports/daily_summary API');
            $scope.fnGetDailySummary(selectedLocationOption);

            console.log('Monthly-Barchart-section: Call for /reports/monthly_summary API');
            $scope.fnGetMonthlySummaryWithDateAndLocation(selectedLocationOption);

            initializeDashboardSection();
            dashboardRequest();
        };

        /*>>>>>>>>>>>>>>>>>>>> START: SECTION #01 >>>>>>>>>>>>>>>>>>>>*/
        /*---------- Calculate gross profit ----------*/
        $scope.fnCalculateGrossProfitCent = function (tmpYear) {
            var tmpResult = 0;
            tmpResult = (tmpYear.total_labor_profit_cents + tmpYear.total_parts_profit_cents +
                tmpYear.total_sublet_profit_cents) - tmpYear.total_discount_cents;
            return tmpResult;
        };

        function fnCalculateResult(currYearData, prevYearData, label, index) {
            var compareResult =
                (isNaN(prevYearData) || prevYearData === 0) ? 0 : (currYearData - prevYearData) / prevYearData;
            compareResult = parseInt(compareResult.toFixed(2) * 100);

            var tmpObj = {};
            tmpObj.value = (compareResult < 0 ? compareResult : '+' + compareResult) + '%';
            tmpObj.colorCode = compareResult < 0 ? '#ff0000' : '#008000';

            var innerObj = {};
            innerObj[label] = tmpObj;

            angular.extend(variance_obj, innerObj);
            $scope.varianceObj[index] = angular.copy(variance_obj);
        }

        $scope.fnCalcOverPrevYear = function (scope_currentYearData, scope_priorYearData, index) {
            var currYearData, prevYearData;
            currYearData = prevYearData = 0;

            angular.forEach(summaryKeysArr, function (label) {
                currYearData = scope_currentYearData[label] / 100;
                prevYearData = scope_priorYearData[label] / 100;
                fnCalculateResult(currYearData, prevYearData, label, index);
            });

            // For Gross Profit $
            currYearData = ($scope.fnCalculateGrossProfitCent(scope_currentYearData));
            prevYearData = ($scope.fnCalculateGrossProfitCent(scope_priorYearData));
            fnCalculateResult(currYearData / 100, prevYearData / 100, 'gross_profit_dollar', index);

            // For GP%
            currYearData = scope_currentYearData.gross_sales_cents == 0 ?
                0 : (currYearData / scope_currentYearData.gross_sales_cents) * 100;
            prevYearData = scope_priorYearData.gross_sales_cents == 0 ?
                0 : (prevYearData / scope_priorYearData.gross_sales_cents) * 100;

            fnCalculateResult(currYearData, prevYearData, 'gross_profit_per', index);
        };

        function isSummary2015Loaded() {
            count === 1 ? $scope.isSummary2015Data = true : ++count;
        }

        var count = 0;
        $scope.fnSummaryOptionChanged = function (selectedSummaryOption, locationId) {
            if (selectedSummaryOption === '2015') {
                count = 0;
                $scope.isSummary2015Data = false;
                shopLocationsDashboardServices.fetchDailySummary(partnerId, locationId, selectedSummaryOption)
                    .then(function (data) {
                        $scope.curr_summary_2015 = data.current_year;
                        $scope.prior_summary_2015 = data.prior_year;
                        $scope.fnCalcOverPrevYear($scope.curr_summary_2015, $scope.prior_summary_2015, 1);
                        isSummary2015Loaded();
                    });

                var from = '2015-12-01', to = '2015-12-31';
                shopLocationsDashboardServices.fetchMonthlySummaryWithDateAndLoc(partnerId, locationId, from, to)
                    .then(function (data) {
                        $scope.dec_summary_2015 = data.summaries.pop();
                        isSummary2015Loaded();
                    });
            }

        };

        $scope.fnCreateSummaryDD = function () {
            $scope.summaryDDOptions = [
                {name: 'Year-to-date/Month-to-date', value: 'year_month_to_date'},
                {name: 'Last 12 months/Last 30 days', value: 'last_12_months_30_days'},
                {name: '2015', value: '2015'}
            ];
        };

        /*---------- Get daily summary ----------*/
        $scope.fnGetDailySummary = function (locationId) {
            $scope.isDailySummaryData = false;

            shopLocationsDashboardServices.fetchDailySummary(partnerId, locationId)
                .then(function (res) {
                    $scope.currentYearData = res.current_year;
                    $scope.priorYearData = res.prior_year;
                    $scope.last_12_months = res.last_12_months;
                    $scope.last_30_days = res.last_30_days;
                    $scope.fnCreateSummaryDD();
                    $scope.fnCalcOverPrevYear($scope.currentYearData, $scope.priorYearData, 0);
                    $scope.isDailySummaryData = true;

                }, function (error) {
                    toastr.error('Retrieving daily summary failed.', 'STATUS CODE: ' + error.status);
                });
        };
        /*>>>>>>>>>>>>>>>>>>>> END: SECTION #01 >>>>>>>>>>>>>>>>>>>>*/


        /*>>>>>>>>>>>>>>>>>>>> START: SECTION #02, #03, #04 >>>>>>>>>>>>>>>>>>>>*/
        /*---------- Get monthly summary using date  ----------*/
        $scope.fnGetMonthlySummaryWithDateAndLocation = function (locationId) {
            $scope.isMonthlySummaryData = false;
            var from = moment().subtract(2, 'year').add(1, 'months').subtract(1, 'day').format('YYYY-MM-DD');
            var to = moment().daysInMonth();
            to = moment().date(to).format('YYYY-MM-DD');

            shopLocationsDashboardServices.fetchMonthlySummaryWithDateAndLoc(partnerId, locationId, from, to)
                .then(function (response) {
                    $scope.fnCreatechartGroupsDD();
                    $scope.isMonthlySummaryData = true;
                    var copySummaries = angular.copy(response.summaries);
                    $scope.monthlySummary = response.summaries;
                    $scope.fnCreateJSON($scope.monthlySummary);
                    $scope.monthToDate = copySummaries.pop();

                }, function (error) {
                    toastr.error('Retrieving monthly summary failed.', 'STATUS CODE: ' + error.status);
                });
        };

        /*---------------------- Repair Orders -----------------------------*/
        $scope.fnRepairOrders = function (locationId, event_sd, event_ed) {
            $scope.isRepairOrdersData = false;
            if (locationId) {
                shopLocationsDashboardServices.fetchRepairOrderWithDate(locationId, event_sd, event_ed)
                    .then(function (res) {
                        $scope.isRepairOrdersData = true;
                        $scope.isLocId = true;
                        if (res.length > 0) {
                            $scope.repairOrders = res;
                            $scope.isRepairOrderMsg = false;
                        } else {
                            $scope.isRepairOrderMsg = true;
                        }
                    });
            } else {
                $scope.isLocId = false;
                $scope.isRepairOrdersData = true;
                $scope.isRepairOrderMsg = false;
            }

            $scope.fnRefreshDom();
        };

        /*---------- Repair Order Dialog --------------------*/
        $scope.fnOpenRepairOrderModal = function (ev, repairOrder, repairOrders) {
            $mdDialog.show({
                controller: 'repairOrderModalCtrl',
                templateUrl: 'views/authenticated/shopLocations/modals/roDetailsDialog.html',
                targetEvent: ev,
                resolve: {
                    repairOrder: function () {
                        return repairOrder;
                    },
                    repairOrders: function () {
                        return repairOrders;
                    }
                }
            });
        };
        /*---------------------- End Repair Orders -----------------------------*/

        /*---------------------Create Json----------------*/
        $scope.fnCreateJSON = function (data) {
            $scope.createJSON = {};
            var firstObj = data[0];

            var strLegend = '';
            var intMonth = [];
            var arrLegend = [];
            for (var property in firstObj) {
                if (firstObj.hasOwnProperty(property)) {
                    $scope.createJSON[property] = [];
                }
            }

            //For 'Gross Profit $ Total' Calculation.
            $scope.createJSON.gross_profit_cents = [];
            //For 'Shop Efficiency'
            $scope.createJSON.shop_efficiency = [];
            //For 'Sold Hours per RO'
            $scope.createJSON.sold_hours_per_ro = [];

            angular.forEach(data, function (obj, intIndex) {

                //For 'Gross Profit $ Total' Calculation.
                var gross_profit_dollar = $filter('CentToDollar')($scope.fnCalculateGrossProfitCent(obj));

                for (var property in obj) {
                    if (obj.hasOwnProperty(property)) {
                        if (property !== 'labor_sold_cents_per_second') {
                            if (property.split('_').indexOf('cents') > -1) {
                                obj[property] = $filter('CentToDollar')(obj[property]);
                            }
                        }
                        if (property.split('_').pop() === 'rate') {
                            obj[property] = $filter('multiplyBy100')(obj[property]);
                        }
                        if (property.split('_').indexOf('seconds') > -1) {
                            obj[property] = $filter('hour')(obj[property]);
                        }
                    }
                }
                if (obj.labor_sold_cents_per_second) {
                    obj.labor_sold_cents_per_second = $filter('calEffectiveRate')(obj.labor_sold_cents_per_second);
                }

                //After seconds filter Sold Hours Divided by Actual Hours to calculate 'Shop Efficiency'
                var shop_efficiency = obj.total_labor_actual_seconds != 0 ? (obj.total_labor_sold_seconds / obj.total_labor_actual_seconds).toFixed(2) : 0;
                //After seconds filter Sold Hours Divided by RO Count to calculate 'Sold Hours per RO'
                var sold_hours_per_ro = obj.sale_count != 0 ? (obj.total_labor_sold_seconds / obj.sale_count).toFixed(2) : 0;

                var mmm = halfMonthArr[obj.month - 1];
                if (intIndex < 12) {
                    strLegend = 'Previous 12 months';
                    if (arrLegend.indexOf(strLegend) === -1) {
                        arrLegend.push(strLegend);
                    }
                } else {
                    strLegend = 'Most recent 12 months';
                    if (arrLegend.indexOf(strLegend) === -1) {
                        arrLegend.push(strLegend);
                    }
                }
                if (intMonth.indexOf(obj.month) !== -1) {
                    for (var prop in firstObj) {
                        if (firstObj.hasOwnProperty(prop)) {
                            $scope.fnCheckMonthInObj(mmm, strLegend, $scope.createJSON[prop], obj[prop]);
                        }
                    }

                    //For 'Gross Profit $ Total' Calculation.
                    $scope.fnCheckMonthInObj(mmm, strLegend, $scope.createJSON.gross_profit_cents, gross_profit_dollar);
                    //For 'Shop Efficiency'
                    $scope.fnCheckMonthInObj(mmm, strLegend, $scope.createJSON.shop_efficiency, shop_efficiency);
                    //For 'Sold Hours per RO'
                    $scope.fnCheckMonthInObj(mmm, strLegend, $scope.createJSON.sold_hours_per_ro, sold_hours_per_ro);

                } else {
                    intMonth.push(obj.month);
                    for (var pro in firstObj) {
                        if (firstObj.hasOwnProperty(pro)) {
                            $scope.fnPushObj(mmm, strLegend, $scope.createJSON[pro], obj[pro]);
                        }
                    }

                    //For 'Gross Profit $ Total' Calculation.
                    $scope.fnPushObj(mmm, strLegend, $scope.createJSON.gross_profit_cents, gross_profit_dollar);
                    //For 'Shop Efficiency'
                    $scope.fnPushObj(mmm, strLegend, $scope.createJSON.shop_efficiency, shop_efficiency);
                    //For 'Sold Hours per RO'
                    $scope.fnPushObj(mmm, strLegend, $scope.createJSON.sold_hours_per_ro, sold_hours_per_ro);
                }

            });
            $scope.setColumnValue = arrLegend;

        };

        $scope.fnPushObj = function (month, year, arrName, data) {
            var objJSON = {};
            objJSON.month = month;
            objJSON[year] = data;
            arrName.push(objJSON);
        };

        $scope.fnCheckMonthInObj = function (month, year, arrName, data) {
            $.each(arrName, function (i, val) {
                if (val.month === month) {
                    val[year] = data;
                }
            });
        };

        /*---------------------End of Create Json for Bar Chart----------------*/

        $scope.chartGroupsOptions = [
            {name: 'Key Indicators', value: 'key_indicators'},
            {name: 'Gross Sales', value: 'gross_sales'},
            {name: 'Cost of Sales', value: 'cost_of_sales'},
            {name: 'Gross Profit', value: 'gross_profit'},
            {name: 'Marketing', value: 'marketing'},
            {name: 'Repair Order Analysis', value: 'repair_order_analysis'},
            {name: 'Miscellaneous', value: 'miscellaneous'}
        ];

        $scope.fnCreatechartGroupsDD = function () {
            $scope.chartGroupsOptions = [
                {name: 'Key Indicators', value: 'key_indicators'},
                {name: 'Gross Sales', value: 'gross_sales'},
                {name: 'Cost of Sales', value: 'cost_of_sales'},
                {name: 'Gross Profit', value: 'gross_profit'},
                {name: 'Marketing', value: 'marketing'},
                {name: 'Repair Order Analysis', value: 'repair_order_analysis'},
                {name: 'Miscellaneous', value: 'miscellaneous'}
            ];
        };

        $scope.selectedGroupOption = $scope.chartGroupsOptions[0];
        $scope.chartGroups = {
            cost_of_sales: [
                {name: 'Labor Cost $', value: 'total_labor_cost_cents'},
                //{name: 'Other Cost $', value: ''}, //Missing
                {name: 'Parts Cost $', value: 'total_parts_cost_cents'},
                {name: 'Sublet Cost $', value: 'total_sublet_cost_cents'}
                //{name: 'Tires Cost $', value: ''} // Missing
            ],
            gross_profit: [
                {name: 'Gross Profit $ Total', value: 'gross_profit_cents'},
                {name: 'Labor Gross Profit $', value: 'total_labor_profit_cents'},
                //{name: 'Other Gross Profit $', value: ''}, //Missing
                {name: 'Parts Gross Profit $', value: 'total_parts_profit_cents'},
                {name: 'Sublet Gross Profit $', value: 'total_sublet_profit_cents'}
                //{name: 'Tires Gross Profit $', value: ''} //Missing
            ],
            gross_sales: [
                {name: 'Discounts $', value: 'total_discount_cents'},
                {name: 'Gross Sales $ Total', value: 'gross_sales_cents'},
                {name: 'Labor Sold $', value: 'total_labor_sold_cents'},
                {name: 'Other Sold $', value: 'total_other_sold_cents'},
                {name: 'Parts Sold $', value: 'total_parts_sold_cents'},
                {name: 'Sublet Sold $', value: 'total_sublet_sold_cents'}
                //{name: 'Tires Sold $', value: ''} //Missing
            ],
            key_indicators: [
                {name: 'Gross Sales $ Total', value: 'gross_sales_cents'},
                {name: 'Actual Hours Total', value: 'total_labor_actual_seconds'},
                {name: 'Average RO Sales $', value: 'average_sale_cents'},
                {name: 'Daily RO Count Average', value: 'average_daily_sales_count'},
                {name: 'Daily Sales $ Average', value: 'average_daily_sales_gross_cents'},
                {name: 'Effective Labor Rate $', value: 'labor_sold_cents_per_second'},
                {name: 'Gross Profit % Total', value: 'labor_and_parts_profit_rate'},
                {name: 'Labor Gross Profit %', value: 'labor_profit_rate'},
                {name: 'Parts Gross Profit %', value: 'parts_profit_rate'},
                {name: 'RO Count', value: 'sale_count'},
                {name: 'Shop Efficiency', value: 'shop_efficiency'}, // (Sold Hours Divided by Actual Hours)
                {name: 'Sold Hours per RO', value: 'sold_hours_per_ro'},  //(Sold Hours divided by RO Count)
                {name: 'Sold Hours Total', value: 'total_labor_sold_seconds'},
                {name: 'Sublet Gross Profit %', value: 'sublet_profit_rate'}
            ],
            marketing: [
                //{name: 'Active Customers', value: ''}, //Missing
                {name: 'New Customers Count', value: 'new_customers_count'},
                {name: 'Returning Customers Count', value: 'returning_customers_count'}
            ],
            miscellaneous: [
                {name: 'Day Count', value: 'day_count'},
                {name: 'Gross Sales $ with Taxes', value: 'gross_sales_after_tax_cents'},
                {name: 'Labor Cost $ per RO', value: 'average_labor_cost_cents'},
                {name: 'Labor Profit $ per RO', value: 'average_labor_profit_cents'},
                {name: 'Labor Sold $ After Discounts', value: 'total_labor_sold_cents_after_discounts'},
                {name: 'Parts Cost $ per RO', value: 'average_parts_cost_cents'},
                {name: 'Parts Profit $ per RO', value: 'average_parts_profit_cents'},
                {name: 'Parts Sold $ After Discounts', value: 'total_parts_sold_cents_after_discounts'},
                {name: 'Sublet Cost $ per RO', value: 'average_sublet_cost_cents'},
                {name: 'Sublet Profit $ per RO', value: 'average_sublet_profit_cents'},
                {name: 'Sublet Sold $ After discounts', value: 'total_sublet_sold_cents_after_discounts'},
                {name: 'Taxes $', value: 'total_tax_paid_cents'}
            ],
            repair_order_analysis: [
                {name: 'Average RO Sales $', value: 'average_sale_cents'},
                {name: 'Discount $ per RO', value: 'average_discount_cents'},
                {name: 'Labor $ per RO', value: 'average_labor_sold_cents'},
                {name: 'Other Sales $ per RO', value: 'average_other_sold_cents'},
                {name: 'Parts $ per RO', value: 'average_parts_sold_cents'},
                {name: 'RO Count', value: 'sale_count'},
                {name: 'Sublet $ per RO', value: 'average_sublet_sold_cents'}
            ]
        };

        $scope.chartOptions = $scope.chartGroups[$scope.selectedGroupOption.value];
        $scope.selectedChartType = $scope.chartOptions[6];
        $scope.barChartName = $scope.selectedChartType.name;
        $scope.sendJsonToBar = $scope.createJSON[$scope.selectedChartType.value];

        $scope.fnChangeGroup = function (selectedGroupOption) {
            $scope.chartOptions = $scope.chartGroups[selectedGroupOption.value];
            $scope.barChartName = $scope.selectedChartType.name;
        };

        /*------------ create DD for Monthly summary data-----------*/
        $scope.sendJsonToBar = [];

        $scope.fnGenerateBarChart = function (selectedChartType, selectedLocationOption) {
            if (selectedChartType) {
                $scope.barChartName = selectedChartType.name;
                $scope.sendJsonToBar = $scope.createJSON[selectedChartType.value];
                $scope.fnGenerateMonthlyBarChart(selectedChartType, selectedLocationOption);
                if (selectedChartType.value !== 'day_count'
                    && selectedChartType.value !== 'average_daily_sales_count'
                    && selectedChartType.value !== 'average_daily_sales_gross_cents') {
                    $scope.fnGenerateDailyBarChart(11, 'Most recent 12 months',
                        selectedChartType, selectedLocationOption);
                }
            }
        };

        $scope.fnReturnTooltipVal = function (name, value) {
            var val = '';
            if (name === 'gross_sales_cents' || name === 'average_sale_cents' || name === 'average_daily_sales_gross_cents' ||
                name === 'labor_sold_cents_per_second' || name === 'total_labor_sold_cents' || name === 'total_labor_cost_cents' ||
                name === 'total_labor_profit_cents' || name === 'total_parts_sold_cents' || name === 'total_parts_cost_cents' ||
                name === 'total_parts_profit_cents' || name === 'total_discount_cents' || name === 'average_labor_sold_cents' ||
                name === 'average_labor_cost_cents' || name === 'average_labor_profit_cents' || name === 'average_parts_sold_cents' ||
                name === 'average_parts_cost_cents' || name === 'average_parts_profit_cents' || name === 'average_discount_cents' ||
                name === 'total_labor_sold_cents_after_discounts' || name === 'total_parts_sold_cents_after_discounts' ||
                name === 'total_sublet_sold_cents' || name === 'total_sublet_cost_cents' || name === 'total_sublet_profit_cents' ||
                name === 'average_sublet_sold_cents' || name === 'average_sublet_cost_cents' || name === 'average_sublet_profit_cents' ||
                name === 'total_sublet_sold_cents_after_discounts' || name === 'gross_sales_after_tax_cents' || name === 'total_tax_paid_cents' ||
                name === 'total_other_sold_cents' || name === 'average_other_sold_cents' || name === 'gross_profit_cents') {
                val = $filter('currency')(value);
            } else if (name === 'labor_and_parts_profit_rate' || name === 'parts_profit_rate' || name === 'labor_profit_rate' || name === 'sublet_profit_rate') {
                val = value + '%';
            } else if (name === 'average_daily_sales_count') {
                val = $filter('number')(value, 2);
            } else {
                val = value;
            }
            return val;
        };

        /*--------------- Bar Chart ----------------*/
        $scope.fnGenerateMonthlyBarChart = function (selectedChartType, selectLocationOption) {
            if ($scope.isMonthlySummaryData) {
                var count = 0;
                $scope.isMonthlyBarMsg = false;
                var barChart = c3.generate({
                    bindto: '#bar-chart',
                    padding: {top: 40, right: 50},
                    data: {
                        json: $scope.sendJsonToBar,
                        keys: {
                            x: 'month', // it's possible to specify 'x' when category axis
                            value: $scope.setColumnValue
                        },
                        type: 'bar',
                        colors: {
                            'Previous 12 months': '#1F77B4',
                            'Most recent 12 months': '#FF7F0E'
                        },
                        color: function (color, d) {
                            // d will be 'id' when called for legends
                            if (d.value === 0) {
                                count++;
                            }
                            return color;
                        },
                        onclick: function (d) {
                            if (d.name) {
                                if (selectedChartType.value !== 'day_count' && selectedChartType.value !== 'average_daily_sales_count' && selectedChartType.value !== 'average_daily_sales_gross_cents') {
                                    $scope.fnGenerateDailyBarChart(d.index, d.name, selectedChartType, selectLocationOption);
                                }
                            } else {
                                if ($rootScope.isMobile) {
                                    toastr.info('Please put your finger on the specific target.');
                                }
                            }
                        }
                    },
                    grid: {y: {show: true}},
                    onrendered: function () {
                        $scope.isMonthlyBarMsg = $scope.sendJsonToBar.length + 12 === count ? true : false;
                        $scope.fnRefreshDom();
                        count = 0;
                    },
                    transition: {
                        duration: 1000
                    },
                    bar: {
                        width: {
                            ratio: 0.50
                        }
                    },
                    zoom: {enabled: false},
                    axis: {
                        x: {
                            label: {text: 'Month', position: 'outer-center'},
                            type: 'category', height: 50,
                            tick: {
                                rotate: 75,
                                multiline: false
                            }
                        },
                        y: {
                            label: {text: $scope.barChartName, position: 'outer-middle'}
                        }
                    },
                    tooltip: {
                        grouped: true,
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            var $$ = this, config = $$.config,
                                nameFormat = config.tooltip_format_name || function (name) {
                                        return name;
                                    },
                                valueFormat = config.tooltip_format_value || defaultValueFormat,
                                tooltipHtml, i, value, name, bgcolor, isAllZero = true, convertedVal;

                            if (!tooltipHtml) {
                                tooltipHtml = '<table class="' + $$.CLASS.tooltip + '"><tr><th colspan="2">' + $scope.barChartName + '</th></tr>';
                            }

                            for (i = 0; i < d.length; i++) {
                                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                                    continue;
                                }
                                name = nameFormat(d[i].name);
                                value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                                bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                                if (d[i].value !== 0) {
                                    isAllZero = false;
                                }

                                convertedVal = $scope.fnReturnTooltipVal(selectedChartType.value, value);
                                tooltipHtml += '<tr class="' + $$.CLASS.tooltipName + '-' + d[i].id + '">' +
                                    '<td class="name"><span style="background-color:' + bgcolor + '"></span>' + name + '</td>' +
                                    '<td class="value">' + convertedVal + '</td>' +
                                    '</tr>';
                            }

                            if (isAllZero) {
                                return;
                            }

                            if (d[0] !== undefined && d[1] !== undefined) {
                                var variance = d[0].value < d[1].value ? d[1].value - d[0].value : d[0].value - d[1].value;
                                if (variance % 1 !== 0) {
                                    variance = variance.toFixed(2);
                                }
                                convertedVal = $scope.fnReturnTooltipVal(selectedChartType.value, variance);

                                tooltipHtml += '<tr style="text-align: right">' +
                                    '<td>Variance</td>' +
                                    '<td>' + convertedVal + '</td>' +
                                    '</tr>';
                            }

                            tooltipHtml += '<tr>' +
                                '<td colspan="2">Click a month to see daily details.</td>' +
                                '</tr>' +
                                '</table>';

                            return tooltipHtml;
                        }
                    }
                });
            }
        };

        $scope.fnGenerateDailyBarChart = function (index, name, selectedChartType, selectLocationOption, flag) {

            angular.forEach($scope.createJSON[selectedChartType.value], function (key, val) {
                if (val === index) {
                    var year = '';
                    var selectedMonth = halfMonthArr.indexOf(key.month) + 1;
                    if (name === 'Previous 12 months' && selectedMonth > current_month) {
                        year = current_year - 2;
                    } else if (name === 'Previous 12 months' && selectedMonth <= current_month) {
                        year = current_year - 1;
                    } else if (name === 'Most recent 12 months' && selectedMonth > current_month) {
                        year = current_year - 1;
                    } else if (name === 'Most recent 12 months' && selectedMonth <= current_month) {
                        year = current_year;
                    }
                    $scope.isDailySummaryData = flag ? flag : true;
                    shopLocationsDashboardServices.fetchMonthlyData(partnerId, selectLocationOption, year + '-' + selectedMonth)
                        .then(function (res) {
                            $scope.isDailySummaryData = true;
                            var resArr = res.summaries;
                            angular.forEach(resArr, function (obj, intIndex) {

                                //For 'Gross Profit $ Total' Calculation.
                                var gross_profit_dollar = $filter('CentToDollar')($scope.fnCalculateGrossProfitCent(obj));
                                obj.gross_profit_cents = gross_profit_dollar;

                                for (var property in obj) {
                                    if (obj.hasOwnProperty(property)) {
                                        if (property !== 'labor_sold_cents_per_second') {
                                            if (property.split('_').indexOf('cents') > -1) {
                                                obj[property] = $filter('CentToDollar')(obj[property]);
                                            }
                                        }
                                        if (property.split('_').pop() === 'rate') {
                                            obj[property] = $filter('multiplyBy100')(obj[property]);
                                        }
                                        if (property.split('_').indexOf('seconds') > -1) {
                                            obj[property] = $filter('hour')(obj[property]);
                                        }
                                    }
                                }
                                if (obj.labor_sold_cents_per_second) {
                                    obj.labor_sold_cents_per_second = $filter('calEffectiveRate')(obj.labor_sold_cents_per_second);
                                }

                                //After seconds filter Sold Hours Divided by Actual Hours to calculate 'Shop Efficiency'
                                var shop_efficiency = obj.total_labor_actual_seconds != 0 ? (obj.total_labor_sold_seconds / obj.total_labor_actual_seconds).toFixed(2) : 0;
                                obj.shop_efficiency = shop_efficiency;
                                //After seconds filter Sold Hours Divided by RO Count to calculate 'Sold Hours per RO'
                                var sold_hours_per_ro = obj.sale_count != 0 ? (obj.total_labor_sold_seconds / obj.sale_count).toFixed(2) : 0;
                                obj.sold_hours_per_ro = sold_hours_per_ro;
                            });
                            $scope.dailyBarMonth = fullMonthArr[resArr[0].month - 1];
                            fnDailyBar(resArr, $scope.dailyBarMonth, name, selectedChartType.value, year, selectedMonth, selectLocationOption);
                        }, function (error) {
                            toastr.error('Failed retrieving monthly details.', 'STATUS CODE: ' + error.status);
                        });
                }
            });

            $scope.yAxiesLabel = selectedChartType.name;
            $scope.dailyHeading = selectedChartType.name;

            function fnDailyBar(data, mon, name, selectedOptions, year, selectedMonth, selectLocationOption) {
                /*---- assign color for data ----*/
                var objColor = {};
                if (name === 'Previous 12 months') {
                    objColor[selectedOptions] = '#1F77B4';
                } else if (name === 'Most recent 12 months') {
                    objColor[selectedOptions] = '#FF7F0E';
                }
                var count = 0;
                $scope.isDailyBarMsg = false;
                if ($scope.isDailySummaryData) {
                    var dailyBarChart = c3.generate({
                        bindto: '#daily-bar-chart',
                        padding: {top: 40, right: 50},
                        data: {
                            json: data,
                            keys: {x: 'day', value: [selectedOptions]},
                            type: 'bar',
                            colors: objColor,
                            color: function (color, d) {
                                // d will be 'id' when called for legends
                                if (d.value === 0) {
                                    count++;
                                }
                                return color;
                            },
                            onclick: function (d) {
                                var event_start_date = $scope.fnCheckEventStartDate(year, selectedMonth, d.index + 1);
                                var event_end_date = year + '-' + selectedMonth + '-' + (d.index + 1) + 'T05:00:00.000Z';
                                $scope.currentDate = new Date(year, selectedMonth - 1, d.index + 1);
                                $scope.fnRepairOrders(selectLocationOption, event_start_date, event_end_date);
                            }
                        },
                        grid: {y: {show: true}},
                        onrendered: function () {
                            $scope.isDailyBarMsg = data.length === count ? true : false;
                            $scope.fnRefreshDom();
                            count = 0;
                        },
                        transition: {
                            duration: 1000
                        },
                        bar: {width: {ratio: 0.50}},
                        zoom: {enabled: false},
                        axis: {
                            x: {
                                label: {text: mon, position: 'outer-center'},
                                type: 'category',
                                height: 50,
                                tick: {
                                    rotate: 75,
                                    multiline: false
                                }
                            },
                            y: {
                                label: {text: $scope.yAxiesLabel, position: 'outer-middle'}
                            }
                        },
                        tooltip: {
                            grouped: false,
                            contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                                var name = d[0].name;
                                var value = d[0].value;
                                var convertedVal = $scope.fnReturnTooltipVal(name, value);
                                var tooltip = '<table class="c3-tooltip">' +
                                    '<tbody>' +
                                    '<tr>' +
                                    '<th colspan="2">' + $scope.dailyHeading + '</th>' +
                                    '</tr>' +
                                    '<tr class="c3-tooltip-name-' + name + '">' +
                                    '<td class="name"><span style="background-color:' + objColor[name] + '"></span>' + $scope.dailyHeading + '</td>' +
                                    '<td class="value">' + convertedVal + '</td>' +
                                    '</tr>' +
                                    '<tr>' +
                                    '<td colspan="2">Click a day to see repair orders</td>' +
                                    '</tr>' +
                                    '</tbody>' +
                                    '</table>';
                                return tooltip;
                            }
                        },
                        legend: {hide: true}
                    });
                }
            }
        };
        /*>>>>>>>>>>>>>>>>>>>> END: SECTION #02, #03, #04 >>>>>>>>>>>>>>>>>>>>*/

        /*------------- 4th Row ----------------*/
        /*---------------- Employee Performance --------------*/
        $scope.fnCreateempPerformanceDD = function () {
            $scope.empPerformanceDDOptions = [
                {name: 'Service Advisor Gross Sales', value: 'gross_sales_cents'},
                {name: 'Service Advisor Avg. RO', value: 'avg_sale_cents'},
                {name: 'Service Advisor RO Count', value: 'sale_count'},
                {name: 'Service Advisor Gross Profit', value: 'gross_profit_cents'},
                {name: 'Service Advisor Gross Profit %', value: 'gross_profit_cents_per'},
                {name: 'Tech Sold', value: 'total_labor_sold_cents'},
                {name: 'Tech Cost', value: 'total_labor_cost_cents'},
                {name: 'Tech Profit', value: 'total_labor_profit_cents'},
                {name: 'Tech Actual Time', value: 'total_actual_seconds'},
                {name: 'Tech Effective Labor Rate', value: 'eff_labor_hourly_rate_cents'}
            ];

            $scope.empPerformanceBarChartName = $scope.empPerformanceDDOptions[0].name;
            $scope.selectedEmpPerformanceOption = $scope.empPerformanceDDOptions[0].value;
        };

        $scope.fnFetchWriterStatsByMonth = function (selectedLocation) {
            $scope.isEmpPerformanceDataLoaded = $scope.isEmpPerformanceMsg = false;
            $scope.createEmpPerformanceJSON = {};

            shopLocationsDashboardServices.fetchWriterStatsByMonth(partnerId, selectedLocation)
                .then(function (data) {
                    $scope.fnCreateempPerformanceDD();
                    if (data.length > 0) {
                        $scope.fnCreateEmpPerformanceChartJSON(data, data[0].writers[0], 'writers');
                    } else {
                        $scope.isEmpPerformanceMsg = true;
                    }
                    $scope.fnFetchTechStatsByMonth(selectedLocation);
                });

            $scope.fnRefreshDom();
        };

        $scope.fnFetchTechStatsByMonth = function (selectLocationOption) {
            shopLocationsDashboardServices.fetchTechStatsByMonth(partnerId, selectLocationOption)
                .then(function (data) {
                    $scope.isEmpPerformanceDataLoaded = true;
                    if (data.length > 0) {
                        $scope.fnCreateEmpPerformanceChartJSON(data, data[0].techs[0], 'techs');
                    }
                });
        };

        $scope.fnCreateEmpPerformanceChartJSON = function (data, getPropObj, field) {
            var firstObj = getPropObj;
            var empStr = '_emp';
            var gpPerStr = 'gross_profit_cents_per';

            for (var property in firstObj) {
                if (firstObj.hasOwnProperty(property)) {
                    if (property != 'name') {
                        $scope.createEmpPerformanceJSON[property] = [];
                        $scope.createEmpPerformanceJSON[property + empStr] = [];
                    }
                }
            }

            if (typeof getPropObj !== 'undefined' && field === 'writers') {
                $scope.createEmpPerformanceJSON[gpPerStr] = [];
                $scope.createEmpPerformanceJSON[gpPerStr + empStr] = [];
            }

            angular.forEach(data, function (obj) {
                var monAndYr = halfMonthArr[obj.month - 1] + '-' + obj.year;
                angular.forEach(obj[field], function (fieldObj) {
                    if (field === 'writers') {
                        var calcGpPer = fieldObj.gross_sales_cents == 0 ? 0 : ((fieldObj.gross_profit_cents / fieldObj.gross_sales_cents) * 100).toFixed(2);
                        if (typeof $scope.createEmpPerformanceJSON[gpPerStr + empStr] === 'undefined')
                            $scope.createEmpPerformanceJSON[gpPerStr + empStr] = [];
                        if (typeof $scope.createEmpPerformanceJSON[gpPerStr] === 'undefined')
                            $scope.createEmpPerformanceJSON[gpPerStr] = [];

                        if ($scope.createEmpPerformanceJSON[gpPerStr + empStr].indexOf(fieldObj.name) === -1) {
                            $scope.createEmpPerformanceJSON[gpPerStr + empStr].push(fieldObj.name);
                        }
                        var index = $scope.createEmpPerformanceJSON[gpPerStr].map(function (x) {
                            return x.month;
                        }).indexOf(monAndYr);
                        if (index === -1) {
                            var tempObj = {};
                            tempObj.month = monAndYr;
                            tempObj[fieldObj.name] = calcGpPer;
                            $scope.createEmpPerformanceJSON[gpPerStr].push(tempObj);
                        } else {
                            angular.forEach($scope.createEmpPerformanceJSON[gpPerStr], function (epObj) {
                                if (epObj.month == monAndYr) {
                                    epObj[fieldObj.name] = calcGpPer;
                                }
                            });
                        }
                    }
                    angular.forEach(fieldObj, function (fieldVal, fieldKey) {
                        if (fieldKey != 'name') {
                            if (typeof $scope.createEmpPerformanceJSON[fieldKey + empStr] === 'undefined')
                                $scope.createEmpPerformanceJSON[fieldKey + empStr] = [];
                            if (typeof $scope.createEmpPerformanceJSON[fieldKey] === 'undefined')
                                $scope.createEmpPerformanceJSON[fieldKey] = [];

                            if ($scope.createEmpPerformanceJSON[fieldKey + empStr].indexOf(fieldObj.name) === -1) {
                                $scope.createEmpPerformanceJSON[fieldKey + empStr].push(fieldObj.name);
                            }
                            var pos = $scope.createEmpPerformanceJSON[fieldKey].map(function (x) {
                                return x.month;
                            }).indexOf(monAndYr);
                            if (pos === -1) { // if month is new
                                var tempObj = {};
                                tempObj.month = monAndYr;
                                if (fieldKey.split('_').indexOf('cents') > -1) {
                                    tempObj[fieldObj.name] = $filter('CentToDollar')(fieldVal);
                                } else if (fieldKey.split('_').indexOf('seconds') > -1) {
                                    tempObj[fieldObj.name] = $filter('hour')(fieldVal);
                                } else {
                                    tempObj[fieldObj.name] = fieldObj[fieldKey];
                                }
                                $scope.createEmpPerformanceJSON[fieldKey].push(tempObj);
                            } else {
                                angular.forEach($scope.createEmpPerformanceJSON[fieldKey], function (epObj) {
                                    if (epObj.month == monAndYr) {
                                        if (fieldKey.split('_').indexOf('cents') > -1) {
                                            epObj[fieldObj.name] = $filter('CentToDollar')(fieldVal);
                                        } else if (fieldKey.split('_').indexOf('seconds') > -1) {
                                            epObj[fieldObj.name] = $filter('hour')(fieldVal);
                                        } else {
                                            epObj[fieldObj.name] = fieldVal;
                                        }
                                    }
                                });
                            }
                        }
                    });
                });
            });

            if (Object.keys($scope.createEmpPerformanceJSON).length == 0) {
                $scope.isEmpPerformanceMsg = true;
            }
        };

        $scope.fnGenerateBarEmpPerChart = function (selectedEmpPerformanceOption) {
            if ($scope.isEmpPerformanceMsg) {
                return;
            }
            if (Object.keys($scope.createEmpPerformanceJSON).length != 0) {
                c3.generate({
                    bindto: '#bar-chart-emp-performance',
                    padding: {top: 40, right: 50},
                    data: {
                        json: $scope.createEmpPerformanceJSON[selectedEmpPerformanceOption],
                        keys: {
                            x: 'month',
                            value: $scope.createEmpPerformanceJSON[selectedEmpPerformanceOption + '_emp']
                        },
                        type: 'bar'
                    },
                    grid: {y: {show: true}},
                    transition: {
                        duration: 1000
                    },
                    bar: {
                        width: {
                            ratio: 0.50
                        }
                    },
                    zoom: {enabled: false},
                    axis: {
                        x: {
                            label: {text: 'Month', position: 'outer-center'},
                            type: 'category', height: 100,
                            tick: {
                                rotate: -75,
                                multiline: false
                            }
                        }
                    },
                    tooltip: {
                        format: {
                            value: function (value, ratio, id) {
                                var format = (selectedEmpPerformanceOption.split('_').indexOf('cents') > -1 ? d3.format('$') : d3.format(','));
                                return selectedEmpPerformanceOption.split('_').indexOf('per') > -1 ? value + '%' : format(value);
                            }
                        }
                    }
                });
            }
        };

        /*---------------- End of Employee Performance --------------*/

        /*------------- 5th Row ----------------*/
        /*------- Customers Report bar-chart and pie-chart ------------*/

        /*--------------------Pie Chart----------------*/
        $scope.fnGeneratePieChart = function (custData) {
            $scope.pieChartTitle = halfMonthArr[custData.month - 1] + ' ' + custData.year;
            if ($scope.isPieChartCustData) {
                var pieChart = c3.generate({
                    bindto: '#pie-chart',
                    data: {
                        json: $scope.createPieChartJson,
                        type: 'pie',
                        onclick: function (d, i) {
                        },
                        onmouseover: function (d, i) {
                        },
                        onmouseout: function (d, i) {
                        }
                    },
                    tooltip: {
                        grouped: false,
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            var name = d[0].name;
                            var value = d[0].value;

                            if (name === 'Newly Active') {
                                color = '#1F77B4';
                            } else if (name === 'Other Active') {
                                color = '#FF7F0E';
                            } else if (name === 'Lost') {
                                color = '#2CA02C';
                            }

                            var tooltip = '<table class="c3-tooltip">' +
                                '<tbody>' +
                                '<tr>' +
                                '<th colspan="2">' + $scope.pieChartTitle + ', Customers</th>' +
                                '</tr>' +
                                '<tr class="c3-tooltip-name-' + name + '">' +
                                '<td class="name"><span style="background-color:' + color + '"></span>' + name + '</td>' +
                                '<td class="value">' + value + '</td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>';

                            return tooltip;
                        }
                    }
                });
            } else {
                $scope.isPieChartDataMsg = true;
            }
        };

        /*-------------------------- Customer Report Bar-chart ----------------------------*/
        $scope.custRepoOptions = [
            {name: 'New Customers', value: 'new_customers'},
            {name: 'Active Customers', value: 'active_customers'},
            {name: 'Lost Customers', value: 'lost_customers'}
        ];
        $scope.fnCreatecustRepoDD = function () {
            $scope.custRepoOptions = [
                {name: 'New Customers', value: 'new_customers'},
                {name: 'Active Customers', value: 'active_customers'},
                {name: 'Lost Customers', value: 'lost_customers'}
            ];
        };

        $scope.custRepoBarChartName = $scope.custRepoOptions[0].name;
        $scope.selectedCustRepoOptions = $scope.custRepoOptions[0].value;
        $scope.createCustRepoJSON = {};
        $scope.sendCustRepoJsonToBar = [];

        $scope.fnFetchCustomerReport = function (locationId) {
            $scope.isCustomerReportData = $scope.isPieChartCustData = false;
            $scope.createCustRepoJSON = {};

            shopLocationsDashboardServices.fetchCustomerReport(partnerId, locationId)
                .then(function (res) {
                    $scope.fnCreatecustRepoDD();
                    $scope.customerReportData = res;
                    $scope.isCustomerReportData = $scope.isPieChartCustData = true;
                    $scope.fnCreateCustRepoJson(res);
                });

            $scope.fnRefreshDom();
        };

        function fnCreatePieChartJSON(custData) {
            var newly_active_cust = custData.new_customers;
            newly_active_cust = newly_active_cust < 0 ? 0 : newly_active_cust;

            var active_cust = custData.active_customers;
            var other_active_cust = active_cust - newly_active_cust;
            other_active_cust = other_active_cust < 0 ? 0 : other_active_cust;

            var lost_cust = custData.lost_customers;
            lost_cust = lost_cust < 0 ? 0 : lost_cust;

            if (newly_active_cust === 0 && other_active_cust === 0 && lost_cust === 0) {
                $scope.isPieChartDataMsg = true;
                return;
            }

            $scope.createPieChartJson = {
                'Newly Active': newly_active_cust,
                'Other Active': other_active_cust,
                'Lost': lost_cust
            };

            $scope.isPieChartCustData = true;
            $scope.isPieChartDataMsg = false;
            $scope.fnGeneratePieChart(custData);
        }

        $scope.fnCreateCustRepoJson = function (data) {
            var firstObj = data[0];
            var strLegend = '';
            var arrLegend = [];
            var intMonth = [];

            for (var property in firstObj) {
                if (firstObj.hasOwnProperty(property)) {
                    $scope.createCustRepoJSON[property] = [];
                }
            }

            angular.forEach(data, function (obj, intIndex) {
                var mmm = halfMonthArr[obj.month - 1];
                if (intIndex < 12) {
                    strLegend = 'Previous 12 months';
                    if (arrLegend.indexOf(strLegend) === -1) {
                        arrLegend.push(strLegend);
                    }
                } else {
                    strLegend = 'Most recent 12 months';
                    if (arrLegend.indexOf(strLegend) === -1) {
                        arrLegend.push(strLegend);
                    }
                }

                if (intMonth.indexOf(obj.month) !== -1) {
                    for (var prop in firstObj) {
                        if (firstObj.hasOwnProperty(prop)) {
                            $scope.fnCheckMonthInObj(mmm, strLegend, $scope.createCustRepoJSON[prop], obj[prop]);
                        }
                    }
                } else {
                    intMonth.push(obj.month);
                    for (var pro in firstObj) {
                        if (firstObj.hasOwnProperty(pro)) {
                            $scope.fnPushObj(mmm, strLegend, $scope.createCustRepoJSON[pro], obj[pro]);
                        }
                    }
                }

            });

            $scope.setColumnValue = arrLegend;
            fnCreatePieChartJSON(data[data.length - 1]);
            $scope.fnGenerateCustomerReportBarChart($scope.selectedCustRepoOptions);
        };

        $scope.fnGenerateCustomerReportBarChart = function (selectedCustRepoOptions) {
            angular.forEach($scope.custRepoOptions, function (key) {
                if (key.value === selectedCustRepoOptions) {
                    $scope.custRepoBarChartName = key.name;
                }
            });

            $scope.sendCustRepoJsonToBar = $scope.createCustRepoJSON[selectedCustRepoOptions];

            var count = 0;
            $scope.isCustRepoBarMsg = false;
            if ($scope.isCustomerReportData) {
                var barChart = c3.generate({
                    bindto: '#customer-report-bar-chart',
                    padding: {top: 40, right: 50},
                    data: {
                        json: $scope.sendCustRepoJsonToBar,
                        keys: {
                            x: 'month', // it's possible to specify 'x' when category axis
                            value: $scope.setColumnValue
                        },
                        type: 'bar',
                        colors: {
                            'Previous 12 months': '#1F77B4',
                            'Most recent 12 months': '#FF7F0E'
                        },
                        color: function (color, d) {
                            // d will be 'id' when called for legends
                            if (d.value === 0) {
                                count++;
                            }
                            return color;
                        },
                        onclick: function (d) {
                            if (d.id === 'Most recent 12 months') {
                                fnCreatePieChartJSON($scope.customerReportData[d.index + 12]);
                            }
                            else {
                                fnCreatePieChartJSON($scope.customerReportData[d.index]);
                            }
                        }
                    },
                    grid: {y: {show: true}},
                    onrendered: function () {
                        $scope.isCustRepoBarMsg = $scope.sendCustRepoJsonToBar.length + 12 === count ? true : false;
                        $scope.fnRefreshDom();
                        count = 0;
                    },
                    transition: {
                        duration: 1000
                    },
                    bar: {
                        width: {
                            ratio: 0.50
                        }
                    },
                    zoom: {enabled: false},
                    axis: {
                        x: {
                            label: {text: 'Month', position: 'outer-center'},
                            type: 'category', height: 50,
                            tick: {
                                rotate: 75,
                                multiline: false
                            }
                        },
                        y: {
                            label: {text: $scope.custRepoBarChartName, position: 'outer-middle'}
                        }
                    },
                    tooltip: {
                        grouped: false,
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            var name = d[0].name;
                            var value = d[0].value;
                            if (name === 'Previous 12 months') {
                                color = '#1F77B4';
                            } else if (name === 'Most recent 12 months') {
                                color = '#FF7F0E';
                            }
                            var tooltip = '<table class="c3-tooltip">' +
                                '<tbody>' +
                                '<tr>' +
                                '<th colspan="2">' + $scope.custRepoBarChartName + '</th>' +
                                '</tr>' +
                                '<tr class="c3-tooltip-name-' + name + '">' +
                                '<td class="name"><span style="background-color:' + color + '"></span>' + name + '</td>' +
                                '<td class="value">' + value + '</td>' +
                                '</tr>' +
                                '<tr>' +
                                '<td colspan="2">Click a month to see <br/> Active/New/Lost Customers </td>' +
                                '</tr>' +
                                '</tbody>' +
                                '</table>';

                            return tooltip;
                        }
                    }
                });
            }
        };

        /*------------- 6th Row ----------------*/
        /*---------------- Marketing Source --------------*/
        $scope.fnFetchMarketingSourceByMonth = function (selectLocationOption) {
            $scope.isMarketingSourcesDataLoaded = $scope.isMarketingSourcesMsg = false;

            shopLocationsDashboardServices.fetchMarketingSourceByMonth(partnerId, selectLocationOption)
                .then(function (data) {
                    $scope.isMarketingSourcesDataLoaded = true;
                    if (data.length > 0) {
                        $scope.fnCreateMarketingSourceChartArr(data);
                    } else {
                        $scope.isMarketingSourcesMsg = true;
                    }
                });

            $scope.fnRefreshDom();
        };

        $scope.fnCreateMarketingSourceChartArr = function (data) {
            $scope.createMarketingSourceArr = [];
            $scope.marketingSourceYAxisArr = [];
            $scope.isMarketingSourcesMsg = false;

            angular.forEach(data, function (obj) {
                var tempObj = {};
                tempObj.month = halfMonthArr[obj.month - 1] + '-' + obj.year;
                angular.forEach(obj.sources, function (value, key) {
                    tempObj[key.trim()] = value;
                    if ($scope.marketingSourceYAxisArr.indexOf(key.trim()) === -1) {
                        $scope.marketingSourceYAxisArr.push(key.trim());
                    }
                });
                $scope.createMarketingSourceArr.push(tempObj);
            });

            if ($scope.marketingSourceYAxisArr.length === 0) {
                $scope.isMarketingSourcesMsg = true;
            }

            $scope.fnGenerateBarMSChart($scope.createMarketingSourceArr, $scope.marketingSourceYAxisArr);
        };

        $scope.fnGenerateBarMSChart = function (data, yAxisArr) {
            c3.generate({
                bindto: '#bar-chart-marketing-sources',
                padding: {top: 40, right: 50},
                data: {
                    json: data,
                    keys: {
                        x: 'month',
                        value: yAxisArr
                    },
                    type: 'bar'
                },
                grid: {y: {show: ($scope.isMarketingSourcesMsg ? false : true)}},
                transition: {
                    duration: 1000
                },
                bar: {
                    width: {
                        ratio: 0.50
                    }
                },
                zoom: {enabled: false},
                axis: {
                    x: {
                        label: {text: 'Month', position: 'outer-center'},
                        type: 'category', height: 100,
                        tick: {
                            rotate: -75,
                            multiline: false
                        }
                    }
                }
            });
        };

        /*---------------- End of Marketing Source --------------*/

        /*---------- Init ----------*/
        $scope.fnInitDashboard = function () {
            $scope.fnGetLocationDetails();
            $scope.fnCreatechartGroupsDD();
        };

        $scope.fnRefreshDom = function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        /*---------- Dashboard Request made only when the section is visible in the view-port ----------*/
        var dashboardSection = {};

        function initializeDashboardSection() {
            dashboardSection = {
                isDailyBarVisited: false,
                isEmployeeBarVisited: false,
                isCustomerBarVisited: false,
                isMarketingBarVisited: false
            };
        }

        withinviewport.defaults.left = 0;
        withinviewport.defaults.right = -100;
        withinviewport.defaults.bottom = -200;
        function dashboardRequest() {
            if (!dashboardSection.isDailyBarVisited) {
                if (withinviewport($('#dashboard-tab section#daily-barchart-section div.roContainer'))) {
                    console.log('Daily-Barchart-Section: Call for /repair-order API');
                    dashboardSection.isDailyBarVisited = true;
                    $scope.fnRepairOrders($scope.selectedLocationOption, event_start_date, event_end_date);
                }
            }

            if (!dashboardSection.isEmployeeBarVisited) {
                if (withinviewport($('#dashboard-tab section#employee-barchart-section'))) {
                    console.log('Employee-Barchart-Section: Call for /reports/writer_stats_by_month ' +
                        'and /reports/tech_stats_by_month API');
                    dashboardSection.isEmployeeBarVisited = true;
                    $scope.fnFetchWriterStatsByMonth($scope.selectedLocationOption);
                }
            }

            if (!dashboardSection.isCustomerBarVisited) {
                if (withinviewport($('#dashboard-tab section#customer-barchart-section div.custBarContainer'))) {
                    console.log('Customer-Barchart-Section: Call for /reports/customers_by_month API');
                    dashboardSection.isCustomerBarVisited = true;
                    $scope.fnFetchCustomerReport($scope.selectedLocationOption);
                }
            }

            if (!dashboardSection.isMarketingBarVisited) {
                if (withinviewport($('#dashboard-tab section#marketing-barchart-section'))) {
                    console.log('Marketing-Barchart-Section: Call for /reports/marketing_sources_by_month API');
                    dashboardSection.isMarketingBarVisited = true;
                    $scope.fnFetchMarketingSourceByMonth($scope.selectedLocationOption);
                }
            }

        }

        /*---------- Bind scroll and window resize event for viewport changes ----------*/
        $timeout(function () {
            $('#manage-shoploc-sidenav').on('scroll', function () {
                var elem = $('#manage-shoploc-sidenav md-tabs md-tab[id=dashboard]');
                if (elem && elem.length != 0) {
                    if ($scope.selectedIndex === 0) dashboardRequest();
                }
            });

            $(window).resize(function () {
                var elem = $('#manage-shoploc-sidenav md-tabs md-tab[id=dashboard]');
                if (elem && elem.length != 0) {
                    if ($scope.selectedIndex === 0) dashboardRequest();
                }
            });

        }, 1000);

    });