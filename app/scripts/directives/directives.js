'use strict';
app.directive('locationIndicator', function() {
    return {
        restrict: 'A',
        scope: {
            obj: '=',
            msg: '='
        },
        link : function($scope, $element){
            $scope.$watch('obj',function(val){
                val.lastConfig = typeof val.lastConfig === 'string' ? JSON.parse(val.lastConfig) : val.lastConfig;
                if(val.lastConfig !== null)
                {
                    var settings = val.lastConfig.settings;
                    //sync is enabled, and we've received at least one repair order in the last 3 days
                    if(settings['carglyconnect.syncenabled'] === 'yes'){
                        $element.addClass('checked_item_green');
                        if($scope.msg !== undefined){$scope.msg = 'Synchronization is enabled';}
                    }
                    else if(settings['carglyconnect.syncenabled'] === 'no'){
                        //sync is disabled. Prompt them to enable syncing
                        $element.addClass('checked_item_yellow');
                        if($scope.msg !== undefined){$scope.msg ='Synchronization is disabled.';}
                    }
                    if(settings['carglyconnect.lastsync'] !== ''){
                        var lastSyncDate = new Date(settings['carglyconnect.lastsync']);
                        var currentDate = new Date(Date.now());
                        var timeDiff = Math.abs(currentDate.getTime() - lastSyncDate.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        //This is the timestamp of the last time a sync operation sent us any data. If its been more than a few days since we've had anything sync'd something is wrong.
                        if( diffDays > 3){
                            $element.addClass('checked_item_red');
                            if($scope.msg !== undefined){$scope.msg = 'Not sync\'d something is wrong.';}
                        }
                    }
                }
                else if(val.lastConfig === null){
                    $element.addClass('checked_item_gray');
                    if($scope.msg !== undefined){$scope.msg = 'Not sync\'d something is wrong.';}
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
        if(validity)
        {
            validateEmailArr = value ? value.split(',') : [];
            ctrl.$setValidity(validatorName, validity);
            return !isEmailDuplicate(validateEmailArr) ? value : undefined;
        }
    }

    function isEmailDuplicate(arr){
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

app.directive('dropdown', ['$rootScope', function($rootScope) {
    return {
        restrict: 'E',
        templateUrl: 'views/authenticated/dropdown.tmpl.html',
        scope: {
            placeholder: '@',
            list: '=',
            ddSelected: '=',
            selectedLabel: '=',
            optionValue: '@',
            optionText: '@',
            isSearchFilter: '=',
            isSort: '=',
            ddChange: '&'
        },
        link: function(scope, element) {
            scope.isPlaceholder = true;

            scope.select = function(item,intIndex) {
                var itemsArr = element.find('div.list-item');
                angular.element(itemsArr).each(function(index){
                    if(index!==intIndex){
                        $(this).removeClass('selected');
                    }
                });
                scope.isPlaceholder = false;
                scope.ddSelected = item[scope.optionValue];

                if (scope.selectedLabel !== undefined) {
                    scope.selectedLabel = item[scope.optionText];
                }
            };

            scope.fnInitDDOption = function($last){
                if($last){
                    var longest = scope.list.reduce(function (a, b) { return a[scope.optionText].length > b[scope.optionText].length ? a : b; });
                    if (longest[scope.optionText].length > 30) {
                        element.css('width',longest[scope.optionText].length * 10+'px');
                    }
                }
            };

            scope.show = function() {
                scope.listVisible = !scope.listVisible;
            };

            scope.$watch('selectedLabel', function(current) {
                scope.isPlaceholder = current === undefined;
                scope.display = current;
            });

            scope.$watch('ddSelected', function(current,old) {
                if(current!==old){
                    scope.ddChange();
                    if (scope.selectedLabel !== undefined) {
                        angular.forEach(scope.list, function (obj) {
                            if (obj.value === current) {
                                scope.selectedLabel = obj.name;
                                return false;
                            }
                        });
                    } else {
                        scope.isPlaceholder = true;
                    }
                }
            });

            $rootScope.$on('EventListener', function (event, target) {
                event.preventDefault();
                scope.searchText = '';
                if($(target[0]).is('input')){return;}
                if (!$(target[0]).is('.dropdown-display') && !$(target[0]).parents('.dropdown-display').length > 0){
                    scope.$apply(function () {
                        scope.listVisible = false;
                    });
                }
            });

            element.on('keyup',function (e) {
                var selected = element.find('div.selected'), item = element.find('div.list-item');
                if (scope.listVisible) {
                    if (e.keyCode === 40) { // key-down
                        e.preventDefault();
                        e.stopPropagation();
                        selected.removeClass('selected').next().addClass('selected').find('a').focus();
                        if (selected.next().length === 0) {
                            item.eq(0).addClass('selected');
                        }
                    } else if (e.keyCode === 38) { // key-up
                        e.preventDefault();
                        e.stopPropagation();
                        selected.removeClass('selected').prev().addClass('selected').find('a').focus();
                        if (selected.prev().length === 0) {
                            item.eq(-1).addClass('selected');
                        }
                    }
                }
                if (e.keyCode === 13) { // Enter
                    element.find('a.display-anchor').focus();
                }
            });
        }
    };
}]);

app.directive('autocompleteSearch', function(groupService) {
    return {
        restrict: 'A',
        scope: {
            placeholder: '@placeholder',
            selectedOption: '=',
            isAddBtnDisabled: '=',
            partnerId: '='
        },
        link: function(scope, elem) {
            elem.bind('keyup', function () {
                if ($(elem).val() === '') {
                    scope.isAddBtnDisabled = true;
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }
            });

            elem.autocomplete({
                source: function (request, response) {
                    var filterKey = request.term;
                    elem.addClass('ui-autocomplete-loading');
                    groupService.fetchClientsUsingFilter(filterKey)
                        .then(function(res){
                            var clientsArr = [];
                            angular.forEach(res,function(key){
                                clientsArr.push({label:key.partner,val:key.id});
                            });
                            response(clientsArr);
                        });
                },
                focus: function() {
                    /!*$('#client').val(ui.item.label);*!/
                    return false;
                },
                select: function( event, ui ) {
                    elem.val(ui.item.label);
                    scope.selectedOption = ui.item.label;
                    scope.partnerId = ui.item.val;
                    if(scope.partnerId){
                        scope.isAddBtnDisabled = false;
                    }
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                }
            });
        }
    }
});

app.directive('jsonText', function() {
    return {
        restrict: 'A', // only activate on element attribute
        require: 'ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModelCtrl) {

            var lastValid;

            // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
            ngModelCtrl.$parsers.push(fromUser);
            ngModelCtrl.$formatters.push(toUser);

            // clear any invalid changes on blur
            element.bind('blur', function() {
                element.val(toUser(scope.$eval(attrs.ngModel)));
                ngModelCtrl.$render();
            });

            // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
            // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
            scope.$watch(attrs.ngModel, function(newValue, oldValue) {
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