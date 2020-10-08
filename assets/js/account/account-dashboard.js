angular.module('storefront.account')
.component('vcAccountDashboard', {
    templateUrl: "themes/assets/account-dashboard.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$scope', 'storefrontApp.mainContext', 'loadingIndicatorService', 'b2bRoles', function ($scope, mainContext, loader, b2bRoles) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.availableRoles = b2bRoles;
        $ctrl.member = mainContext.customer;

    }]
});
