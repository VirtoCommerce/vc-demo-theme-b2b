var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLoginForm', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/login-form.tpl.html",
    bindings: {
        loginUrl: '<'
    },
    controller: ['multiAccountService', 'storefrontApp.mainContext', function(multiAccountService, mainContext) {
        var $ctrl = this;
        if (!mainContext.customer.isRegisteredUser) {
            $ctrl.username = multiAccountService.getLastUsedUserName();
        }
    }]
});
