var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutConfigurableLineItem', {
    templateUrl: "themes/assets/js/checkout/checkout-configurable-line-item.tpl.html",
    require: {
        checkoutStep: '^vcCheckoutWizardStep'
    },
    bindings: {
        item: '=',
        onChangeQty: '&',
        onRemove: '&',
        cartItems: '<'
    },
    controller: ['$scope', 'availablePaymentPlans', 'baseUrl', function ($scope, availablePaymentPlans, baseUrl) {
        var ctrl = this;
        ctrl.availablePaymentPlans = availablePaymentPlans;
        $scope.baseUrl = baseUrl;
        $scope.regex = new RegExp(/^\/+/);
        $scope.showConfiguration = false;

        this.$onInit = function () {
            ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            ctrl.checkoutStep.removeComponent(this);
        };

        this.changeQty = function () {
            if (ctrl.onChangeQty) {
                ctrl.onChangeQty({ item: ctrl.item.configuredLineItem });
            }
        };

        this.remove = function () {
            ctrl.onRemove({ item: ctrl.item.configuredLineItem });
        }

        this.validate = function () {
            return true;
        };

        this.getToggleTitle = function () {
            return $scope.showConfiguration === false ? 'Show configuration' : 'Hide configuration';
        };

        this.toggleConfiguration = function() {
            $scope.showConfiguration = !$scope.showConfiguration;
        };

        $scope.$watch('$ctrl.item', function (value) {
        }, true);

        function getConfiguredLineItems(item) {
            _.each(item.parts, function (part) {
                part.items = [ctrl.cartItems.find(x => x.id === part.selectedItemId)];
            });
        }

        getConfiguredLineItems(ctrl.item);

    }]
});
