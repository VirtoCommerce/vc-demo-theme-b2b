var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLoginForm', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/login-form.tpl.html",
    bindings: {
    },
    controller: ['$scope', 'multiAccountService', 'storefrontApp.mainContext', function($scope, multiAccountService, mainContext) {
        if (!mainContext.customer.isRegisteredUser) {
            $scope.username = multiAccountService.getLastUsedUserName();
        }
    }]
});
