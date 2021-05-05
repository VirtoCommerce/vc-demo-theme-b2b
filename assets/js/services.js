var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('dialogService', ['$uibModal', function ($uibModal) {
    return {
        showDialog: function (dialogData, controller, templateUrl, size) {
            var modalInstance = $uibModal.open({
                controller: controller,
                templateUrl: templateUrl,
                size: size,
                resolve: {
                    dialogData: function () {
                        return dialogData;
                    }
                }
            });
            return modalInstance;
        }
    }
}]);

storefrontApp.service('feedbackService', ['$http', function ($http) {
    return {
        postFeedback: function (data) {
            return $http.post('storefrontapi/feedback', { model: data });
        }
    }
}]);

storefrontApp.service('marketingService', ['$http', function ($http) {
    return {
        getDynamicContent: function (placeName) {
            return $http.get('storefrontapi/marketing/dynamiccontent/' + placeName + '?t=' + new Date().getTime());
        },
    }
}]);

storefrontApp.service('pricingService', ['$http', function ($http) {
	return {
		getActualProductPrices: function (products) {
		    return $http.post('storefrontapi/pricing/actualprices', products);
    },
    getProductsTotal: function (items) {
      return $http.post('storefrontapi/pricing/total', items)
    }
	}
}]);

storefrontApp.service('catalogService', ['$http', function ($http) {
    return {
        getProduct: function (productIds) {
            return $http.get('storefrontapi/products?productIds=' + productIds + '&t=' + new Date().getTime());
        },
        getProducts: function(productIds) {
            return $http.get('storefrontapi/products?' + productIds + '&t=' + new Date().getTime());
        },
        search: function (criteria) {
            return $http.post('storefrontapi/catalog/search', criteria);
        },
        searchCategories: function (criteria) {
            return $http.post('storefrontapi/categories/search', criteria);
        },
        getProductConfiguration: function (productId) {
            return $http.get('storefrontapi/demo/catalog/' + productId + '/configuration?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('cartService', ['$http', function ($http) {
    return {
        getCart: function () {
            return $http.get('storefrontapi/cart?t=' + new Date().getTime());
        },
        getCartItemsCount: function () {
            return $http.get('storefrontapi/cart/itemscount?t=' + new Date().getTime());
        },
        addLineItem: function (productId, quantity) {
            return $http.post('storefrontapi/cart/items', { id: productId, quantity: quantity });
        },
        addLineItems: function (items) {
            return $http.post('storefrontapi/cartdemo/items/bulk', items);
        },
        changeLineItemQuantity: function (lineItemId, quantity) {
            return $http.put('storefrontapi/cart/items', { lineItemId: lineItemId, quantity: quantity });
        },
        changeLineItemsQuantity: function(item) {
            return $http.put('storefrontapi/cart/items', item);
        },
        changeLineItemsQuantityBulk: function (items) {
            return $http.put('storefrontapi/cart/items/bulk', items);
        },
        removeLineItem: function (lineItemId) {
            return $http.delete('storefrontapi/cart/items?lineItemId=' + lineItemId);
        },
        changeLineItemPrice: function (lineItemId, newPrice) {
        	return $http.put('storefrontapi/cart/items/price', { lineItemId: lineItemId, newPrice: newPrice});
        },
        clearCart: function () {
            return $http.post('storefrontapi/cart/clear');
        },
        addCoupon: function (couponCode) {
            return $http.post('storefrontapi/cart/coupons/' + couponCode);
        },
        validateCoupon: function (coupon) {
            return $http.post('storefrontapi/cart/coupons/validate', coupon);
        },
        removeCoupon: function (couponCode) {
            return $http.delete('storefrontapi/cart/coupons?couponCode=' + couponCode);
        },
        addOrUpdateShipment: function (shipment) {
            return $http.post('storefrontapi/cart/shipments', shipment);
        },
        addOrUpdatePayment: function (payment) {
            return $http.post('storefrontapi/cart/payments', payment );
        },
        getAvailableShippingMethods: function (shipmentId) {
            return $http.get('storefrontapi/cart/shipments/' + shipmentId + '/shippingmethods?t=' + new Date().getTime());
        },
        getAvailablePaymentMethods: function () {
            return $http.get('storefrontapi/cart/paymentmethods?t=' + new Date().getTime());
        },
        addOrUpdatePaymentPlan: function (plan) {
            return $http.post('storefrontapi/cart/paymentPlan', plan);
        },
        removePaymentPlan: function () {
            return $http.delete('storefrontapi/cart/paymentPlan');
        },
        updatePurchaseOrderNumber: function (purchaseOrderNumber) {
            return $http.put('storefrontapi/cart/purchaseOrderNumber', { purchaseOrderNumber: purchaseOrderNumber });
        },
        createOrder: function (bankCardInfo) {
            return $http.post('storefrontapi/cart/createorder', { bankCardInfo: bankCardInfo });
        },
        updateCartComment: function (cartComment) {
            return $http.put('storefrontapi/cart/comment', { comment: cartComment });
        }
    }
}]);



storefrontApp.service('quoteRequestService', ['$http', function ($http) {
    return {
        getCurrentQuoteRequest: function () {
            return $http.get('storefrontapi/quoterequest/current?t=' + new Date().getTime());
        },
        getQuoteRequest: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '?t=' + new Date().getTime());
        },
        getQuoteRequestItemsCount: function (number) {
            return $http.get('storefrontapi/quoterequests/' + number + '/itemscount?t=' + new Date().getTime());
        },
        addProductToQuoteRequest: function (productId, quantity) {
            return $http.post('storefrontapi/quoterequests/current/items', { productId: productId, quantity: quantity });
        },
        removeProductFromQuoteRequest: function (quoteRequestNumber, quoteItemId) {
            return $http.delete('storefrontapi/quoterequests/' + quoteRequestNumber + '/items/' + quoteItemId);
        },
        submitQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/submit', { quoteForm: quoteRequest });
        },
        rejectQuoteRequest: function (quoteRequestNumber) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/reject');
        },
        updateQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.put('storefrontapi/quoterequests/' + quoteRequestNumber + '/update', { quoteRequest: quoteRequest });
        },
        getTotals: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/totals', { quoteRequest: quoteRequest });
        },
        confirmQuoteRequest: function (quoteRequestNumber, quoteRequest) {
            return $http.post('storefrontapi/quoterequests/' + quoteRequestNumber + '/confirm', { quoteRequest: quoteRequest });
        }
    }
}]);

storefrontApp.service('recommendationService', ['$http', function ($http) {
    return {
        getRecommendedProducts: function (requestData) {
            return $http.post('storefrontapi/recommendations', requestData );
        }
    }
}]);

storefrontApp.service('orderService', ['$http', function ($http) {
    return {
        getOrder: function (orderNumber) {
            return $http.get('storefrontapi/orders/' + orderNumber + '?t=' + new Date().getTime());
        },
        processOrderPayment: function (orderNumber, paymentNumber, bankCardInfo) {
            return $http.post('storefrontapi/orders/' + orderNumber + '/payments/' + paymentNumber + '/process', { bankCardInfo: bankCardInfo });
        },
        addOrUpdatePayment: function (orderNumber, payment) {
            return $http.post('storefrontapi/orders/' + orderNumber + '/payments', payment);
        }
    }
}]);

storefrontApp.service('compareProductService', ['$http', '$localStorage', function($http, $localStorage) {
    return {
        isInProductCompareList: function(productId) {
            var containProduct;
            if (!_.some($localStorage['b2bproductCompareListIds'], function(id) { return id === productId })) {
                containProduct = false;
            }
            else
                containProduct = true
            return containProduct;
        },
        addProduct: function(productId) {
            if (!$localStorage['b2bproductCompareListIds']) {
                $localStorage['b2bproductCompareListIds'] = [];
            }
            $localStorage['b2bproductCompareListIds'].push(productId);
            _.uniq($localStorage['b2bproductCompareListIds']);
        },
        getProductsIds: function() {
            if (!$localStorage['b2bproductCompareListIds']) {
                $localStorage['b2bproductCompareListIds'] = [];
                return;
            }
            var ids = [];
            for (i = 0; i < $localStorage['b2bproductCompareListIds'].length; i++) {
                ids.push('productIds=' + $localStorage['b2bproductCompareListIds'][i]);
            }
            return ids.join("&");
        },
        getProductsCount: function() {
            var count = $localStorage['b2bproductCompareListIds'] ? $localStorage['b2bproductCompareListIds'].length : 0;
            return count;
        },
        clearCompareList: function() {
            $localStorage['b2bproductCompareListIds'] = [];
        },
        removeProduct: function(productId) {
            $localStorage['b2bproductCompareListIds'] = _.without($localStorage['b2bproductCompareListIds'], productId);
        }
    }
}]);


storefrontApp.service('commonService', ['$http', function ($http) {
    return {
        getCountries: function () {
            return $http.get('storefrontapi/countries?t=' + new Date().getTime());
        },
        getCountryRegions: function (countryCode) {
            return $http.get('storefrontapi/countries/' + countryCode + '/regions?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('customerService', ['$http', function ($http) {
    return {
        getCurrentCustomer: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        }
    }
}]);
