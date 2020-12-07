var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productWithoutVariationsController', ['$rootScope', '$scope', '$window', 'dialogService', 'catalogService', 'cartService', 'availabilityService', 'validationHelper',
    function ($rootScope, $scope, $window, dialogService, catalogService, cartService, availabilityService, validationHelper) {
        $scope.validateQtyInput = validationHelper.positiveInt;

        $scope.addProductToCart = function (product, quantity) {
            var inventoryError = product.availableQuantity < quantity;
            var dialogData = toDialogDataModel([product], quantity, inventoryError, null);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');
            if (!inventoryError) {
                cartService.addLineItem(product.id, quantity).then(() => {
                    $rootScope.$broadcast('cartItemsChanged');
                });
            }
        }

        $scope.addProductToCartById = function (productId, quantity, event) {
            event.preventDefault();
            catalogService.getProduct([productId]).then(function (response) {
                if (response.data && response.data.length) {
                    var product = response.data[0];
                    $scope.addProductToCart(product, quantity);
                }
            });
        }

        function toDialogDataModel(products, quantity, inventoryError, configuredProductId) {
            let productIds = products.map(function(product) {
                return product.id;
            });
            let items = products.map(function(product) {
                return angular.extend({ }, product, { quantity: +quantity, inventoryError: product.availableQuantity < quantity, configuredProductId: configuredProductId })
            });
            return { productIds, items, inventoryError, configuredProductId, configurationQty: quantity };
        }

        function initialize() {
            var product = $window.product;
            if (!product) {
                return;
            }
            catalogService.getProduct([product.id]).then(function (response) {
                product = response.data[0];
                $scope.selectedVariation = product;

                return availabilityService.getProductsAvailability([product.id]).then(function(res) {
                    $scope.availability = _.object(_.pluck(res.data, 'productId'), res.data);
                });
            });
        }

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
            dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'recentlyAddedCartItemDialogController', 'storefront.send-product-to-email.tpl');
        };

        initialize();
    }]);
