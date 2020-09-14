var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutLineItem', {
    templateUrl: "themes/assets/js/checkout/checkout-line-item.tpl.html",
    require: {
        checkoutStep: '^vcCheckoutWizardStep'
    },
    bindings: {
        lineItem: '=',
        onChangeQty: '&',
        onRemove: '&',
        readOnly: '<'
    },
    controller: ['$scope', 'availablePaymentPlans', 'baseUrl', function ($scope, availablePaymentPlans, baseUrl) {
        var ctrl = this;
        ctrl.availablePaymentPlans = availablePaymentPlans;
        $scope.baseUrl = baseUrl;
        $scope.regex = new RegExp(/^\/+/);
        this.$onInit = function () {
            ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            ctrl.checkoutStep.removeComponent(this);
        };

        this.changeQty = function () {
            if (ctrl.onChangeQty) {
                ctrl.onChangeQty({ lineItem: ctrl.lineItem });
            }
        };
        this.remove = function () {
            ctrl.onRemove({ lineItem: ctrl.lineItem });
        }

        this.validate = function () {
            return true;
        };

        $scope.$watch('$ctrl.lineItem', function (value) {
        }, true);

    }]
});
