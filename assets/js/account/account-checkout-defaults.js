angular.module('storefront.account')
    .component('vcAccountCheckoutDefaults', {
        templateUrl: "themes/assets/account-checkout-defaults.tpl.liquid",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['storefrontApp.mainContext', '$scope', 'cartService', 'loadingIndicatorService', 'customerService', '$rootScope', function (mainContext, $scope, cartService, loader, customerService, $rootScope) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.defaults = {};
            $ctrl.deliveryMethods = [{ type: 'shipping' }, { type: 'pickup' }];

            $ctrl.getAvailPaymentMethods = function () {
                loader.wrapLoading(function() {
                    return cartService.getAvailablePaymentMethods().then(function (response) {
                        $ctrl.paymentMethods = response.data;
                        setActivePaymentMethod();
                    });
                });
            };

            $ctrl.getAvailShippingMethods = function () {
                loader.wrapLoading(function() {
                    return cartService.getAvailableShippingMethods().then(function (response) {
                        $ctrl.shippingMethods = response.data;
                        setActiveShippingMethod();
                    });
                });
            }

            $ctrl.changeShippingMethod = function (method) {
                $ctrl.defaults.shippingMethod = method;
            }

            $ctrl.updateCustomerDefaults = function() {
                $ctrl.defaults.shippingMethod = $ctrl.activeShippingMethod;
                $ctrl.defaults.paymentMethod = $ctrl.activePaymentMethod;
                localStorage.setItem($ctrl.customer.id, JSON.stringify($ctrl.defaults));
                $rootScope.$broadcast('successOperation', {
                    type: 'success',
                    message: 'User preferences were updated!',
                });
            }

            $ctrl.getCustomerDefaults = function() {
                var customerDefaults = JSON.parse(localStorage.getItem($ctrl.customer.id));
                if (customerDefaults) {
                    $ctrl.defaults = customerDefaults;
                }
            }

            this.$routerOnActivate = function () {
                $ctrl.customer = mainContext.customer;
                $ctrl.getCustomerDefaults();
                $ctrl.getAvailShippingMethods();
                $ctrl.getAvailPaymentMethods();
            };

            function setActiveShippingMethod() {
                if ($ctrl.defaults.shippingMethod) {
                    $ctrl.activeShippingMethod = $ctrl.shippingMethods.find(x => x.shipmentMethodCode == $ctrl.defaults.shippingMethod.shipmentMethodCode);
                }
            }

            function setActivePaymentMethod() {
                if ($ctrl.defaults.paymentMethod) {
                    $ctrl.activePaymentMethod = $ctrl.paymentMethods.find(x => x.code == $ctrl.defaults.paymentMethod.code);
                }
            }

        }]
    }).filter('toShippingMethodLabel', [function () {
        return function (method) {
            if (!method)
                return false;

            var retVal = method.name + method.optionName;

            return retVal;
        };
    }]);
