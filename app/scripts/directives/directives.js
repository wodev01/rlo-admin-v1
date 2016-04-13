'use strict';
app.directive('locationIndicator', function () {
    return {
        restrict: 'A',
        scope: {
            obj: '='
        },
        template: '<md-tooltip md-direction="top">{{msg}}</md-tooltip>',
        link: function ($scope, $element) {
            $scope.msg = '';
            $element.addClass("checked_item_");
            $scope.$watch('obj', function (val) {
                val.lastConfig = typeof val.lastConfig === 'string' ? JSON.parse(val.lastConfig) : val.lastConfig;
                if (val.lastConfig !== null) {
                    var settings = val.lastConfig.settings;
                    //sync is enabled, and we've received at least one repair order in the last 3 days
                    if (settings['carglyconnect.syncenabled'] === 'yes') {
                        $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_green');
                        if ($scope.msg !== undefined) {
                            $scope.msg = 'Synchronization is enabled';
                        }
                    }
                    else if (settings['carglyconnect.syncenabled'] === 'no') {
                        //sync is disabled. Prompt them to enable syncing
                        $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_yellow');
                        if ($scope.msg !== undefined) {
                            $scope.msg = 'Synchronization is disabled.';
                        }
                    }
                    if (settings['carglyconnect.lastsync'] !== '') {
                        var lastSyncDate = new Date(settings['carglyconnect.lastsync']);
                        var currentDate = new Date(Date.now());
                        var timeDiff = Math.abs(currentDate.getTime() - lastSyncDate.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        //This is the timestamp of the last time a sync operation sent us any data. If its been more than a few days since we've had anything sync'd something is wrong.
                        if (diffDays > 3) {
                            $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_red');
                            if ($scope.msg !== undefined) {
                                $scope.msg = 'Not sync\'d something is wrong.';
                            }
                        }
                    }
                }
                else if (val.lastConfig === null) {
                    $element[0].className = $element[0].className.replace(/checked_item_(.*)/, 'checked_item_gray');
                    if ($scope.msg !== undefined) {
                        $scope.msg = 'Not sync\'d something is wrong.';
                    }
                }
            });
        }
    };
});

app.directive('multipleEmails', function () {
    var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    var validateEmailArr = [];

    function validateAll(ctrl, validatorName, value) {
        var validity = ctrl.$isEmpty(value) || value.split(',').every(
                function (email) {
                    return EMAIL_REGEXP.test(email.trim());
                }
            );
        if (validity) {
            validateEmailArr = value ? value.split(',') : [];
            ctrl.$setValidity(validatorName, validity);
            return !isEmailDuplicate(validateEmailArr) ? value : undefined;
        }
    }

    function isEmailDuplicate(arr) {
        var sorted_arr = arr.sort();
        for (var i = 0; i < arr.length - 1; i++) {
            if (sorted_arr[i + 1] === sorted_arr[i]) {
                return true;
            }
        }
    }

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function postLink(scope, elem, attrs, modelCtrl) {
            function multipleEmailsValidator(value) {
                return validateAll(modelCtrl, 'multipleEmails', value);
            }

            modelCtrl.$formatters.push(multipleEmailsValidator);
            modelCtrl.$parsers.push(multipleEmailsValidator);
        }
    };
});

app.directive('addDescription', function () {
    return {
        restrict: 'A',
        scope: {
            arr: '='
        },
        link: function (scope, iElement) {
            var html = '';
            angular.forEach(scope.arr, function (objVal) {
                html += '<div style="margin: 10px;">' + objVal.description + '</div>';
            });
            iElement.append(html);
        }
    };
});

app.directive('addTooltip', function ($filter) {
    return {
        restrict: 'A',
        scope: {
            obj: '=',
            rowIndex: '='
        },
        templateUrl: 'views/authenticated/shopLocations/tooltip.html',
        link: function (scope, iElement) {
            scope.recRepairArr =
                scope.obj.entity.recent_repair_orders.length > 0 ? scope.obj.entity.recent_repair_orders : [];
            scope.recent_repair_orders_obj = scope.recRepairArr[0];

            scope.position = scope.obj.entity.recent_repair_orders.indexOf(scope.recent_repair_orders_obj);
            scope.fnMove = function (direction) {
                scope.position += direction;
                scope.recent_repair_orders_obj = scope.recRepairArr[scope.position];
            };

            var ul = '#view_ul' + scope.rowIndex;
            iElement.blur(function () {
                angular.element(ul).removeClass('add-display-block');
            });
            iElement.hover(function () {
                angular.element(ul).addClass('add-display-block');
                angular.element(ul).parent().addClass('top-arrow');
                if (scope.rowIndex > 6) {
                    angular.element(ul).css('margin-top', '-350px');
                    angular.element('.grid-tooltip .has-sub ul').css('bottom', '0px');
                    angular.element(ul).parent().addClass('bottom-arrow');
                    angular.element('#rs-grid').css('padding-bottom', '');
                } else {
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow-x', ''); // For IE
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow-y', ''); // For IE
                    angular.element('#rs-grid .ui-grid-viewport').css('overflow', 'visible');
                    angular.element('.grid-tooltip .has-sub ul').css('bottom', '');
                    angular.element(ul).css('margin-top', '0px');
                    angular.element(ul).parent().addClass('top-arrow');
                    angular.element('#rs-grid').css('padding-bottom', '340px');
                }
            }, function () {
                angular.element(ul).removeClass('add-display-block');
                angular.element(ul).parent().removeClass('top-arrow');
                angular.element(ul).parent().removeClass('bottom-arrow');
                angular.element('#rs-grid').css('padding-bottom', '');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow', '');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow-x', 'auto');
                angular.element('#rs-grid .ui-grid-viewport').css('overflow-y', 'hidden');
            });

            angular.forEach(scope.obj.entity.recent_labor, function (objVal) {
                angular.element('#table' + scope.obj.rowIndex).append('<tr><td>' + objVal.repair_order
                    + '</td><td>' + $filter('date')(objVal.closed, 'M/d/yyyy h:mm a')
                    + '</td><td>' + objVal.description + '</td></tr>');
            });
        }
    };
});

app.directive('jsonText', function () {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function (scope, element, attrs, ngModelCtrl) {

            var lastValid;

            // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(toUser);

            // clear any invalid changes on blur
            element.bind('blur', function () {
                element.val(toUser(scope.$eval(attrs.ngModel)));
                ngModelCtrl.$render();
            });

            // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
            // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                lastValid = lastValid || newValue;

                if (newValue != oldValue) {
                    ngModelCtrl.$setViewValue(toUser(newValue));

                    // TODO avoid this causing the focus of the input to be lost..
                    //ngModelCtrl.$render();
                }
            }, true); // MUST use objectEquality (true) here, for some reason..

            function fromUser(text) {
                // Beware: trim() is not available in old browsers
                if (!text || text.trim() === '') {
                    return {};
                } else {
                    try {
                        lastValid = angular.fromJson(text);
                        ngModelCtrl.$setValidity('invalidJson', true);
                    } catch (e) {
                        ngModelCtrl.$setValidity('invalidJson', false);
                    }
                    return lastValid;
                }
            }

            function toUser(object) {
                // better than JSON.stringify(), because it formats + filters $$hashKey etc.
                return angular.toJson(object, true);
            }
        }
    };
});