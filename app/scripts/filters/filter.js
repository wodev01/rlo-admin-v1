'use strict';
app.filter('CentToDollar', function () {
    return function (amount) {
        return (amount / 100).toFixed(2);
    };
});

app.filter('joinArray', function () {
    return function(array) {
        if (array) {
            return array.join(', ');
        }
        return '';
    };
});

app.filter('joinArrayOfObj', function () {
    return function(array) {
        var arr = [];
        angular.forEach(array,function(obj){
            arr.push(obj.name);
        });
        return arr.join(', ');
    };
})

app.filter('inspection', function () {
    return function(inspection) {
        if (typeof inspection === 'undefined' || inspection === null || inspection === ''){
            return 'NO';
        }else{
            return 'YES';
        }
    };
});

app.filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }
        var value = tel.toString().trim().replace(/^\+/, '');
        if (value.match(/[^0-9]/)) {
            return tel;
        }
        var country, city, number;
        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }
        if (country === 1) {
            country = '';
        }
        number = number.slice(0, 3) + '-' + number.slice(3);
        return (country + ' (' + city + ') ' + number).trim();
    };
});

app.filter('joinTelArray', function ($filter) {
    return function(array) {
        if (typeof array === 'string') {
            return array;
        }

        angular.forEach(array,function(val,index){
            array[index] = $filter('tel')(val);
        });

        return array.join(', ');
    };
});

app.filter('sumOfValue', function () {
    return function (data, key) {
        if (typeof (data) === 'undefined' && typeof (key) === 'undefined') {
            return 0;
        }
        var sum = 0;
        for (var i = 0; i < data.length; i++) {
            sum = sum + data[i][key];
        }
        return sum;
    };
});

app.filter('toHHMMSS', function () {
    return function (secondsValue) {
        var sec_num = parseInt(secondsValue, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = '0'+hours;}
        if (minutes < 10) {minutes = '0'+minutes;}
        if (seconds < 10) {seconds = '0'+seconds;}
        return hours+':'+minutes+':'+seconds;
    };
});

app.filter('hour', function () {
    return function (secondsValue) {
        return (secondsValue / 3600).toFixed(2);
    };
});

app.filter('multiplyBy100',
        function () {
            return function (rate) {
                return (rate * 100).toFixed(2);
            };
        }
);

app.filter('calEffectiveRate',
        function () {
            return function (centsPerSec) {
                return ((centsPerSec * 3600)/100).toFixed(2);
            };
        }
);

app.filter('toFloor', function () {
    return function (value) {
        return Math.floor(value);
    };
});