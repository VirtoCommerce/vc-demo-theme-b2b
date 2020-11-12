var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutConfigurableLineItem', {
    templateUrl: "themes/assets/js/checkout/checkout-configurable-line-item.tpl.html",
    require: {
        checkoutStep: '^vcCheckoutWizardStep'
    },
    bindings: {
        item: '=',
        onChangeQty: '&',
        onRemove: '&'
    },
    controller: ['$scope', 'availablePaymentPlans', 'baseUrl', '$filter', 'storeCurrency', function ($scope, availablePaymentPlans, baseUrl, $filter, storeCurrency) {
        var ctrl = this;
        ctrl.availablePaymentPlans = availablePaymentPlans;
        $scope.baseUrl = baseUrl;
        $scope.regex = new RegExp(/^\/+/);
        $scope.showConfiguration = false;
        $scope.outOfStockError = false;

        this.$onInit = function () {
            ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            ctrl.checkoutStep.removeComponent(this);
        };

        this.changeQty = function () {
            if (ctrl.onChangeQty) {
                ctrl.onChangeQty({ item: ctrl.item });
            }
        };

        this.remove = function () {
            ctrl.onRemove({ item: ctrl.item });
        };

        this.validate = function () {
            return true;
        };

        this.getToggleTitle = function () {
            return $scope.showConfiguration === false ? 'Show configuration' : 'Hide configuration';
        };

        this.toggleConfiguration = function() {
            $scope.showConfiguration = !$scope.showConfiguration;
        };

        this.setOutOfStockPrice = function() {
            return $filter('currency')(0, storeCurrency.symbol);
        };

        $scope.$watch('$ctrl.item', function (value) {
        }, true);

        function getConfiguredLineItems(item) {
            _.each(item.parts, part => {
                part.items = [item.items.find(x => x.id === part.selectedItemId)];
                if (part.items[0].validationErrors && part.items[0].validationErrors.length) {
                    part.quantityError = _.find(part.items[0].validationErrors, error => error.errorCode === "QuantityError");
                    if (part.quantityError && part.quantityError.availableQuantity === 0) {
                        $scope.outOfStockError = true;
                    }
                }
            });
        }

        getConfiguredLineItems(ctrl.item);

    }]
});
