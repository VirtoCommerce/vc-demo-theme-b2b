angular.module('storefront.account')
    .component('vcAccountCheckoutDefaults', {
        templateUrl: "themes/assets/js/account/account-checkout-defaults.tpl.tpl",
        require: {
            accountManager: '^vcAccountManager'
        },
        controller: ['storefrontApp.mainContext', '$scope', 'cartService', 'loadingIndicatorService', 'customerService', '$rootScope', function (mainContext, $scope, cartService, loader, customerService, $rootScope) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.defaults = {};
            $ctrl.deliveryMethods = [{ type: 'shipping' }, { type: 'pickup' }];
            $ctrl.customer = mainContext.customer;

            $ctrl.$onInit = function () {
                loadData();
            }

            function getAvailPaymentMethods() {
                loader.wrapLoading(function() {
                    return cartService.getAvailablePaymentMethods().then(function (response) {
                        $ctrl.paymentMethods = response.data;
                        setActivePaymentMethod();
                    });
                });
            }

            function getAvailShippingMethods() {
                loader.wrapLoading(function() {
                    return cartService.getAvailableShippingMethods().then(function (response) {
                        $ctrl.shippingMethods = response.data;
                        setActiveShippingMethod();
                    });
                });
            }

            function loadData() {
                getCustomerDefaults();
                getAvailShippingMethods();
                getAvailPaymentMethods();
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

             function getCustomerDefaults() {
                var customerDefaults = JSON.parse(localStorage.getItem($ctrl.customer.id));
                if (customerDefaults) {
                    $ctrl.defaults = customerDefaults;
                }
            }

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
