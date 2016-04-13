'use strict';
app.factory('shopLocationsDashboardServices', ['$q', 'ErrorMsg', 'encodeParamService',
    function ($q, ErrorMsg, encodeParamService) {
        var shopLocationsDashboardServices = {};

        //Get DailySummary data
        shopLocationsDashboardServices.fetchDailySummary = function (pId, locationId, year) {
            var defer = $q.defer();

            var filterObj = {};
            filterObj.location_id = locationId;
            filterObj.year = year;

            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/daily_summary' + encodeParamService.getEncodedParams(filterObj),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        //Get Daily summary with specific date
        shopLocationsDashboardServices.fetchDailySummarySpecificDate = function (pId, date) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/daily_summary/' + date,
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //Get Daily summary with date
        shopLocationsDashboardServices.fetchMonthlyData = function (pId, locationId, yyyyMm) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/monthly/' + yyyyMm + '/details' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        //Get MonthlySummary data
        shopLocationsDashboardServices.fetchMonthlySummary = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/monthly_summary' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        shopLocationsDashboardServices.fetchMonthlySummaryWithDateAndLoc = function (pId, locationId, from, to) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/monthly_summary' + (locationId ? '?location_id=' + locationId + '&' : '?') + 'from=' + from + '&to=' + to,
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        //Get MonthlySummary data using from and to date
        shopLocationsDashboardServices.fetchMonthlySummaryWithDate = function (pId, from, to) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/monthly_summary?from=' + from + '&to=' + to,
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        //Get Location Locations
        shopLocationsDashboardServices.fetchLocations = function (partnerId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + partnerId + '/locations',
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.reject(error);
                }
            });
            return defer.promise;
        };

        //To fetch ROs now supports a date range using the "startDate" and "endDate" parameters. The date params use the format: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        shopLocationsDashboardServices.fetchRepairOrderWithDate = function (locationId, startDate, endDate) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/locations/' + locationId + '/repair-orders' + (startDate ? '?startDate=' + startDate + '&' : '') + (endDate ? 'endDate=' + endDate : ''),
                type: 'GET',
                success: function (data) {
                    defer.resolve(data);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });

            return defer.promise;
        };

        //top customer data can be retrieved via:
        shopLocationsDashboardServices.fetchTopCustomers = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/top_customers' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        // Customer report over the prior 24 months:
        shopLocationsDashboardServices.fetchCustomerReport = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/customers_by_month' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        // Marketing source report over the prior 12 months:
        shopLocationsDashboardServices.fetchMarketingSourceByMonth = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/marketing_sources_by_month' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        // tech report over the prior 12 months:
        shopLocationsDashboardServices.fetchTechStatsByMonth = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/tech_stats_by_month' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        // service writer report over the prior 12 months:
        shopLocationsDashboardServices.fetchWriterStatsByMonth = function (pId, locationId) {
            var defer = $q.defer();
            CarglyPartner.ajax({
                url: '/partners/api/' + pId + '/reports/writer_stats_by_month' + (locationId ? '?location_id=' + locationId : ''),
                type: 'GET',
                success: function (res) {
                    defer.resolve(res);
                },
                error: function (error) {
                    ErrorMsg.CheckStatusCode(error.status);
                    defer.resolve(error);
                }
            });
            return defer.promise;
        };

        return shopLocationsDashboardServices;
    }
]);

