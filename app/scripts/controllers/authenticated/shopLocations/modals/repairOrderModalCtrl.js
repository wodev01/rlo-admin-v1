'use strict';
app.controller('repairOrderModalCtrl',
    function ($scope, $mdDialog, repairOrder, repairOrders) {
        $scope.repairOrder = repairOrder;
        $scope.repairOrders = repairOrders;
        $scope.item = {};

        $scope.position = $scope.repairOrders.indexOf($scope.repairOrder);
        $scope.fnMove = function (direction) {
            $scope.position += direction;
            $scope.repairOrder = $scope.repairOrders[$scope.position];
            delete $scope.selectedRow;
        };

        $scope.$watch('repairOrder', function () {
            $scope.repairOrder.total_sold_price_cents =
                $scope.repairOrder.total_sold_price_cents ? parseFloat($scope.repairOrder.total_sold_price_cents) : 0;
            $scope.totalPartsSoldPrice =
                $scope.repairOrder.parts_sold_price_cents ? parseFloat($scope.repairOrder.parts_sold_price_cents) : 0;

            var totalPartsActualCost =
                $scope.repairOrder.parts_actual_cost_cents ? parseFloat($scope.repairOrder.parts_actual_cost_cents) : 0;

            $scope.totalLaborSoldPrice =
                $scope.repairOrder.labor_sold_price_cents ? parseFloat($scope.repairOrder.labor_sold_price_cents) : 0;

            var totalLaborActualCost =
                $scope.repairOrder.labor_actual_cost_cents ? parseFloat($scope.repairOrder.labor_actual_cost_cents) : 0;

            var totalPartsDiscounted =
                $scope.repairOrder.parts_discounted_cents ? parseFloat($scope.repairOrder.parts_discounted_cents) : 0;
            var totalLaborDiscounted =
                $scope.repairOrder.labor_discounted_cents ? parseFloat($scope.repairOrder.labor_discounted_cents) : 0;
            var totalOtherDiscounted =
                $scope.repairOrder.other_discounted_cents ? parseFloat($scope.repairOrder.other_discounted_cents) : 0;

            $scope.totalSubletSoldPrice =
                $scope.repairOrder.sublet_sold_price_cents ? parseFloat($scope.repairOrder.sublet_sold_price_cents) : 0;

            var totalSubletActualCost =
                $scope.repairOrder.sublet_actual_cost_cents ?
                    parseFloat($scope.repairOrder.sublet_actual_cost_cents) : 0;
            var totalSubletDiscounted =
                $scope.repairOrder.sublet_discounted_cents ? parseFloat($scope.repairOrder.sublet_discounted_cents) : 0;

            $scope.partsProfitDlr = $scope.totalPartsSoldPrice - totalPartsActualCost;
            $scope.laborProfitDlr = $scope.totalLaborSoldPrice - totalLaborActualCost;
            $scope.subletProfitDlr = $scope.totalSubletSoldPrice - totalSubletActualCost;

            $scope.totalSoldPrice =
                $scope.totalPartsSoldPrice + $scope.totalLaborSoldPrice + $scope.totalSubletSoldPrice;
            var totalActualCost = totalPartsActualCost + totalLaborActualCost + totalSubletActualCost;
            var totalDiscounts =
                totalPartsDiscounted + totalLaborDiscounted + totalSubletDiscounted + totalOtherDiscounted;
            $scope.grossProfit = ($scope.totalSoldPrice - totalActualCost) - totalDiscounts;

            $scope.discounts = totalPartsDiscounted + totalLaborDiscounted + totalOtherDiscounted;

            // For effective labor rate
            var totalSeconds, totalPrice;
            totalSeconds = totalPrice = $scope.effectiveLaborRate = 0;
            angular.forEach($scope.repairOrder.labor, function (laborArr) {
                totalSeconds += laborArr.sold_seconds;
                totalPrice += typeof laborArr.sold_price_cents === 'undefined' ?
                                                                    0 : parseFloat(laborArr.sold_price_cents);
            });

            totalPrice /= 100;
            $scope.effectiveLaborRate = totalSeconds !== 0 ? (totalPrice / totalSeconds) * 3600 : 0;
        });

        $scope.hide = function () {
            $mdDialog.hide();
        };

    });