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
    controller: ['$scope', 'availablePaymentPlans', 'baseUrl', '$filter', 'storeCurrency', function ($scope, availablePaymentPlans, baseUrl, $filter, storeCurrency) {
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
        };

        this.validate = function () {
            return true;
        };

        this.setOutOfStockPrice = function() {
            return $filter('currency')(0, storeCurrency.symbol);
        };

        $scope.$watch('$ctrl.lineItem', function (value) {
        }, true);

        function setLineItemErrors(item) {
            if (item.validationErrors && item.validationErrors.length) {
                item.quantityError = _.find(item.validationErrors, error => error.errorCode === "QuantityError");
                if (item.quantityError && item.quantityError.availableQuantity === 0) {
                    $scope.outOfStockError = true;
                }
            }
        }

        setLineItemErrors(ctrl.lineItem);

    }]
});
