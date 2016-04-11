'use strict';
app.factory('encodeParamService', function () {

    var encodeParamService = {};

    encodeParamService.getEncodedParams = function (paramsObj) {
        var encodedParams = [];

        for (var param in paramsObj) {
            if (typeof paramsObj[param] === 'undefined' || paramsObj[param] === null || paramsObj[param] === '')
                continue;
            encodedParams.push(encodeURIComponent(param) + "=" + encodeURIComponent(paramsObj[param]));
        }

        if (encodedParams.length == 0) {
            return encodedParams.join('&');
        } else {
            return '?' + encodedParams.join('&');
        }
    };

    return encodeParamService;

});
