var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('commonProductCardController', ['$rootScope', '$scope', 'dialogService', 'catalogService', 'cartService',
    function ($rootScope, $scope, dialogService, catalogService, cartService) {

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

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
          dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'sendProductToEmailController', 'storefront.send-product-to-email.tpl');
        };

        function toDialogDataModel(products, quantity, inventoryError, configuredProductId) {
            let productIds = products.map(function(product) {
                return product.id;
            });
            let items = products.map(function(product) {
                return angular.extend({ }, product, { quantity: +quantity, inventoryError: product.availableQuantity < quantity, configuredProductId: configuredProductId })
            });
            return { productIds, items, inventoryError, configuredProductId, configurationQty: quantity };
        }

    }]);
