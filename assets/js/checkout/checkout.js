//Call this to register our module to main application
var moduleName = "storefront.checkout";

if (storefrontAppDependencies != undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['credit-cards', 'angular.filter'])
    .controller('checkoutController', ['$rootScope', '$scope', '$window', '$log', 'cartService', 'commonService', 'dialogService', 'orderService', 'iconUrlService', 'creditCardPaymentMethodCode',
        function ($rootScope, $scope, $window, $log, cartService, commonService, dialogService, orderService, iconUrlService, creditCardPaymentMethodCode) {
            $scope.checkout = {
                wizard: {},
                cart: {},
                order: {},
                deliveryAddress: {},
                paymentMethod: {},
                shipmentMethod: {},
                deliveryMethod: {},
                shipment: {},
                payment: {},
                coupon: {},
                availCountries: [],
                loading: false,
                isValid: false,
                newAddress: {}
            };

            $scope.isEqualAddress = function (firstAddress, secondAddress) {
                return firstAddress.line1 == secondAddress.line1 &&
                    firstAddress.line2 == secondAddress.line2 &&
                    firstAddress.city == secondAddress.city &&
                    firstAddress.regionId == secondAddress.regionId &&
                    firstAddress.countryCode == secondAddress.countryCode &&
                    firstAddress.postalCode == secondAddress.postalCode;
            };

            $scope.setPurchaseOrderNumber = function () {
                this.purchaseOrderNumberForm.$setPristine();
                angular.element('#purchaseOrderNumberSubmit').blur();
                return wrapLoading(function () {
                    return cartService.updatePurchaseOrderNumber($scope.checkout.cart.purchaseOrderNumber).then(function() {
                        $rootScope.$broadcast('successOperation', {
                            type: 'success',
                            title: ['Purchase order number has successfully changed']
                        });
                    });
                });
            }

            $scope.sendToEmail = function () {
                dialogService.showDialog({}, 'sendCartToEmailDialogController', 'storefront.send-cart-to-email.tpl');
            }

            $scope.getInvoicePdf = function () {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + $scope.checkout.order.number + '/invoice';
                $window.open(url, '_blank');
            }

            $scope.changeShippingMethod = function () {
                $scope.getAvailShippingMethods($scope.checkout.shipment).then(function (response) {
                    var dialogInstance = dialogService.showDialog({ availShippingMethods: response, checkout: $scope.checkout }, 'universalDialogController', 'storefront.select-shipment-method-dialog.tpl');
                    dialogInstance.result.then(function (shipmentMethod) {
                        $scope.selectShippingMethod(shipmentMethod);
                    });
                });
            };

            $scope.changePaymentMethod = function () {
                $scope.getAvailPaymentMethods().then(function (response) {
                    var dialogInstance = dialogService.showDialog({ availPaymentMethods: response, checkout: $scope.checkout }, 'selectPaymentMethodDialogController', 'storefront.select-payment-method-dialog.tpl', 'lg');
                    dialogInstance.result.then(function (paymentMethod) {
                        $scope.selectPaymentMethod(paymentMethod);
                    });
                });
            };

            $scope.getPaymentIconUrl = function(paymentMethod) {
                iconUrl = iconUrlService.getPaymentMethodIconUrl(paymentMethod.code);
                return iconUrl;
            };

            $scope.changePickupAddress = function () {
                var dialogInstance = dialogService.showDialog({}, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
                dialogInstance.result.then(function(fulfillmentCenter) {
                    $scope.checkout.deliveryMethod.fulfillmentCenter = fulfillmentCenter;
                    $scope.checkout.shipment.deliveryAddress = fulfillmentCenter.address;
                    $scope.updateShipment($scope.checkout.shipment);
                });
            };

            $scope.changeShippingAddress = function () {
                var dialogData =
                {
                    customer: $scope.customer,
                    checkout: $scope.checkout,
                    addresses: $scope.checkout.cart.customer.addresses,
                    isEqualAddress: $scope.isEqualAddress
                };

                var dialogInstance = dialogService.showDialog(dialogData, 'universalDialogController', 'storefront.select-address-dialog.tpl', 'lg');
                dialogInstance.result.then(function () {
                    $scope.checkout.shipment.deliveryAddress = $scope.checkout.deliveryAddress;
                    $scope.updateShipment($scope.checkout.shipment);
                });
            };

            $scope.evalAvailability = function (deliveryMethod) {
                _.each($scope.checkout.cart.items, function (x) {
                    x.availability = {
                        deliveryMethod: deliveryMethod,
                        availDate: Date.now()
                    };
                });
            };

            $scope.clearCart = function () {
                return wrapLoading(function () {
                    return cartService.clearCart().then($scope.reloadCart);
                });
            };

            $scope.changeItemAllQty = function () {
                return wrapLoading(function () {
                    return cartService.changeLineItemsQuantityBulk($scope.checkout.cart.items.map((lineItem) => { return { lineItemId: lineItem.id, quantity: lineItem.quantity }; })).then($scope.reloadCart);
                });
            };

            $scope.changeItemQty = function (lineItem) {
                var id;
                if (lineItem.id) {
                    id = lineItem.id;
                } else {
                    id = lineItem.productId;
                }
                return wrapLoading(function () {
                    return cartService.changeLineItemsQuantity({ lineItemId: id, quantity: lineItem.quantity })
                    .then(() => {
                        $scope.reloadCart();
                        $rootScope.$broadcast('cartItemsChanged');
                    });
                });
            };

            $scope.removeItem = function (lineItem) {
                var id;
                if (lineItem.id) {
                    id = lineItem.id;
                } else {
                    id = lineItem.productId;
                }
                return wrapLoading(function () {
                    return cartService.removeLineItem(id)
                    .then(() => {
                        $scope.reloadCart();
                        $rootScope.$broadcast('cartItemsChanged');
                    });
                });
            };
            $scope.validateCheckout = function (checkout) {
                checkout.isValid = checkout.payment && checkout.payment.paymentGatewayCode;
                if (checkout.isValid && !checkout.billingAddressEqualsShipping) {
                    checkout.isValid = angular.isObject(checkout.payment.billingAddress);
                }
                if (checkout.isValid && checkout.cart && checkout.deliveryMethod.type == 'shipping') {
                    checkout.isValid = angular.isObject(checkout.shipment)
                        && checkout.shipment.shipmentMethodCode
                        && angular.isObject(checkout.shipment.deliveryAddress);
                }
            };

            $scope.reloadCart = function () {
                return cartService.getCart().then(function (response) {
                    var cart = response.data;

                    $scope.checkout.cart = cart;

                    if (cart.coupon) {
                        $scope.couponApplied = true;
                        $scope.checkout.coupon = cart.coupon;
                    } else {
                        $scope.couponApplied = false;
                        $scope.checkout.coupon.code = null;
                    }

                    if (cart.configuredItems && cart.configuredItems.length) {
                        $scope.configuredItemsIds = [];
                        _.each($scope.checkout.cart.configuredItems, function (item) {
                            _.each(item.parts, function (part) {
                                $scope.configuredItemsIds.push(part.selectedItemId);
                            });
                        });
                        $scope.configuredItemsIds = _.uniq($scope.configuredItemsIds);
                        $scope.regularLineItems = _.filter($scope.checkout.cart.items, function(item) {
                            return $scope.configuredItemsIds.indexOf(item.id) === -1;
                        });
                    } else {
                        $scope.regularLineItems = $scope.checkout.cart.items;
                    }

                    if (cart.payments.length) {
                        $scope.checkout.payment = cart.payments[0];
                        $scope.checkout.paymentMethod.code = $scope.checkout.payment.paymentGatewayCode;
                        $scope.getAvailPaymentMethods().then(function (response) {
                            _.each(cart.payments, function (x) {
                                var paymentMethod = _.find(response, function (pm) { return pm.code == x.paymentGatewayCode; });
                                if (paymentMethod) {
                                    angular.extend(x, paymentMethod);
                                    $scope.checkout.paymentMethod = paymentMethod;
                                }
                            });
                        });
                    }
                    if (cart.shipments.length) {
                        $scope.checkout.shipment = cart.shipments[0];
                        //Load shipment method for cart shipment
                        $scope.getAvailShippingMethods($scope.checkout.shipment).then(function (response) {
                            var shipmentMethod = _.find(response, function (sm) { return sm.shipmentMethodCode == $scope.checkout.shipment.shipmentMethodCode && sm.optionName == $scope.checkout.shipment.shipmentMethodOption; });
                            if (shipmentMethod) {
                                $scope.checkout.shipment.shipmentMethod = shipmentMethod;
                            }
                        });
                    }
                    if (!cart.shipments.length || !$scope.checkout.shipment.deliveryAddress) {
                        $scope.checkout.shipment.deliveryAddress = $scope.checkout.cart.customer.defaultShippingAddress;
                    }
                    $scope.checkout.deliveryAddress = $scope.checkout.shipment.deliveryAddress;
                    $scope.checkout.billingAddressEqualsShipping = cart.hasPhysicalProducts && !angular.isObject($scope.checkout.payment.billingAddress);

                    $scope.checkout.canCartBeRecurring = $scope.customer.isRegisteredUser && _.all(cart.items, function (x) { return !x.isReccuring });
                    $scope.checkout.paymentPlan = cart.paymentPlan && _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: cart.paymentPlan.intervalCount, interval: cart.paymentPlan.interval }) ||
                        _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: 1, interval: 'months' });

                    $scope.validateCheckout($scope.checkout);
                    return cart;
                });
            };

            $scope.selectPaymentMethod = function (paymentMethod) {
                angular.extend($scope.checkout.payment, paymentMethod);
                $scope.checkout.payment.paymentGatewayCode = paymentMethod.code;
                $scope.checkout.payment.amount = angular.copy($scope.checkout.cart.total);
                $scope.checkout.payment.amount.amount += paymentMethod.totalWithTax.amount;

                updatePayment($scope.checkout.payment);
            };

            function getAvailCountries() {
                //Load avail countries
                return commonService.getCountries().then(function (response) {
                    return response.data;
                });
            };

            $scope.checkout.getCountryRegions = $scope.getCountryRegions = function (country) {
                return commonService.getCountryRegions(country.code3).then(function (response) {
                    return response.data;
                });
            };

            $scope.getAvailShippingMethods = function (shipment) {
                return wrapLoading(function () {
                    return cartService.getAvailableShippingMethods(shipment.id).then(function (response) {
                        return response.data;
                    });
                });
            }

            $scope.getAvailPaymentMethods = function () {
                return wrapLoading(function () {
                    return cartService.getAvailablePaymentMethods().then(function (response) {
                        return response.data;
                    });
                });
            };

            $scope.selectShippingMethod = function (shippingMethod) {
                if (shippingMethod) {
                    $scope.checkout.shipment.shipmentMethodCode = shippingMethod.shipmentMethodCode;
                    $scope.checkout.shipment.shipmentMethodOption = shippingMethod.optionName;
                }
                else {
                    $scope.checkout.shipment.shipmentMethodCode = undefined;
                    $scope.checkout.shipment.shipmentMethodOption = undefined;
                }
                $scope.updateShipment($scope.checkout.shipment);
            };

            $scope.updateShipment = function (shipment) {
                if (shipment.deliveryAddress) {
                    var deliveryAddress = $scope.checkout.shipment.deliveryAddress;
                    //WORKAROUND: For pickup address FirstName and LastName can't set and need use some to avoid required violation
                    deliveryAddress.firstName = deliveryAddress.firstName ? deliveryAddress.firstName : 'Fulfillment';
                    deliveryAddress.lastName = deliveryAddress.lastName ? deliveryAddress.lastName : 'center';
                };
                //Does not pass validation errors to API
                shipment.validationErrors = undefined;
                return wrapLoading(function () {
                    return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart);
                });
            };

            $scope.createOrder = function () {
                wrapLoading(function() {
                    return cartService.createOrder($scope.checkout.paymentMethod.card).then(function(response) {

                        var orderProcessingResult = response.data.orderProcessingResult;
                        var paymentMethod = response.data.paymentMethod;

                        return orderService.getOrder(response.data.order.number).then(function(response) {
                            var order = response.data;
                            $scope.checkout.order = order;
                            handlePostPaymentResult(order, orderProcessingResult, paymentMethod);
                        });
                    });

                });
            };

            $scope.savePaymentPlan = function () {
                wrapLoading(function () {
                    return cartService.addOrUpdatePaymentPlan($scope.checkout.paymentPlan).then(function () {
                        $scope.checkout.cart.paymentPlan = $scope.checkout.paymentPlan;
                    });
                });
            };

            $scope.isRecurringChanged = function (isRecurring) {
                if ($scope.checkout.paymentPlan) {
                    if (isRecurring) {
                        $scope.savePaymentPlan();
                    } else {
                        wrapLoading(function () {
                            return cartService.removePaymentPlan().then(function () {
                                $scope.checkout.cart.paymentPlan = undefined;
                            });
                        });
                    }
                }
            };

            $scope.getCustomerDefaults = function() {
                if ($scope.customer.id) {
                    var customerDefaults = JSON.parse(localStorage.getItem($scope.customer.id));
                    if (customerDefaults) {
                        if (customerDefaults.deliveryMethod) {
                            $scope.checkout.deliveryMethod.type = customerDefaults.deliveryMethod;
                        }
                        if (customerDefaults.paymentMethod) {
                            $scope.selectPaymentMethod(customerDefaults.paymentMethod);
                        }
                        if (customerDefaults.shippingMethod) {
                            $scope.selectShippingMethod(customerDefaults.shippingMethod);
                        }
                    }
                }
            };

            $scope.applyCoupon = function (coupon) {
                wrapLoading(function() {
                    return validateCoupon(coupon).then(function (result) {
                        if (result.appliedSuccessfully) {
                            return cartService.addCoupon(coupon.code).then(function() {
                                $scope.reloadCart().then(function() {
                                    $rootScope.$broadcast('successOperation', {
                                        type: 'success',
                                        message: 'Your promocode was successfully applied',
                                    });
                                });
                            });
                        }
                    });
                });
            };

            $scope.removeCoupon = function (coupon) {
                wrapLoading(function() {
                    return cartService.removeCoupon(coupon.code).then(function() {
                        $scope.reloadCart();
                    });
                });
            };

            $scope.$watch("checkout.coupon", function () {
                if (!$scope.checkout.coupon.code) {
                    $scope.checkout.coupon.appliedSuccessfully = true;
                }
            }, true);

            function validateCoupon(coupon) {
                return cartService.validateCoupon(coupon).then(function (result) {
                    return angular.extend(coupon, result.data);
                });
            }

            function updatePayment(payment) {
                if ($scope.checkout.billingAddressEqualsShipping) {
                    payment.billingAddress = undefined;
                }

                if (payment.billingAddress) {
                    payment.billingAddress.type = 'Billing';
                }
                return wrapLoading(function () {
                    return cartService.addOrUpdatePayment(payment).then($scope.reloadCart);
                });
            }

            function handlePostPaymentResult(order, orderProcessingResult, paymentMethod) {
                if (!orderProcessingResult.isSuccess) {
                    $scope.checkout.loading = false;
                    $rootScope.$broadcast('storefrontError', {
                        type: 'error',
                        title: ['Error in new order processing: ', orderProcessingResult.error, 'New Payment status: ' + orderProcessingResult.newPaymentStatus].join(' '),
                        message: orderProcessingResult.error,
                    });
                    return;
                }

                if(paymentMethod.code === creditCardPaymentMethodCode) {
                    orderService.processOrderPayment(order.number, order.inPayments[0].number, null).then(function(response) {
                        orderProcessingResult = response.data.orderProcessingResult;
                        order.inPayments[0].status = "Paid";
                        orderService.addOrUpdatePayment(order.number, order.inPayments[0]).then(function(response) {
                            $rootScope.$broadcast('successOperation', {
                                type: 'success',
                                message: 'Credit card payment for order ' + order.number + ' has been successfully done',
                            });
                            $scope.checkout.wizard.nextStep();
                        });
                    });
                } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'preparedform' && orderProcessingResult.htmlForm) {
                    $scope.outerRedirect($scope.baseUrl + 'cart/checkout/paymentform?orderNumber=' + order.number);
                } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'redirection' && orderProcessingResult.redirectUrl) {
                    $window.location.href = orderProcessingResult.redirectUrl;
                } else {
                    if (!$scope.customer.isRegisteredUser) {
                        $scope.checkout.wizard.nextStep();
                        // $scope.outerRedirect($scope.baseUrl + 'cart/thanks/' + order.number);
                    } else {
                        $scope.checkout.wizard.nextStep();
                        // $scope.outerRedirect($scope.baseUrl + 'account#/orders/' + order.number);
                    }
                }
            }

            function wrapLoading(func) {
                $scope.checkout.loading = true;
                return func().then(function (result) {
                    $scope.checkout.loading = false;
                    return result;
                },
                    function () {
                        $scope.checkout.loading = false;
                    });
            }

            $scope.initialize = function () {

                $scope.reloadCart().then(function (cart) {
                    $scope.checkout.wizard.goToStep(cart.hasPhysicalProducts ? 'shipping-address' : 'payment-method');
                    $scope.getCustomerDefaults();
                });
            };

            getAvailCountries().then(function (countries) {
                $scope.checkout.availCountries = countries;
            });

        }]);
