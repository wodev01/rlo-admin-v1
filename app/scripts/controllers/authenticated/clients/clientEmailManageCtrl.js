'use strict';
app.controller('clientEmailManageCtrl',
    function ($scope, clientEmailService) {

        $scope.clientEmailData = clientEmailService.getClientEmailObj();

        var iframe = angular.element('#clientHtmlEmailTemplate')[0];
        if (iframe && iframe !== '') {
            iframe.src = 'about:blank';
            iframe.contentWindow.document.open('text/htmlreplace');
            iframe.contentWindow.document.write($scope.clientEmailData.html);
            iframe.contentWindow.document.close();
            iframe.contentWindow.document.onmousedown = function () {
                return false;
            };
        }

    });