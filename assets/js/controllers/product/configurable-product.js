var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('configurableProductController', ['$rootScope', '$scope', '$window', 'dialogService', 'catalogService', 'cartService', '$filter', 'roundHelper', 'availabilityService', 'validationHelper', 'storeCurrency',
    function ($rootScope, $scope, $window, dialogService, catalogService, cartService, $filter, roundHelper, availabilityService, validationHelper, storeCurrency) {
        $scope.configurationQty = 1;
        $scope.validateQtyInput = validationHelper.positiveInt;

        $scope.addSelectedProductsToCart = function() {
            var configuredProductId = $window.product.id;
            var products = $scope.productParts.map(function(part) {
                return part.items.find(function(item) {
                    return item.id === part.selectedItemId;
                });
            });
            var inventoryError = products.some(product => {
                return product.availableQuantity < $scope.configurationQty;
            });
            var dialogData = toDialogDataModel(products, $scope.configurationQty, inventoryError, configuredProductId);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');

            if (!inventoryError) {
                var items = $scope.productParts.map(function(value) {
                    return { id: value.selectedItemId, quantity: $scope.configurationQty, configuredProductId: configuredProductId };
                });

                cartService.addLineItems(items).then(function (response) {
                    var result = response.data;
                    if (result.isSuccess) {
                        $rootScope.$broadcast('cartItemsChanged');
                    }
                });
            }
        }

        $scope.changeGroupItem = function (productPart) {
            var dialogInstance = dialogService.showDialog(productPart, 'changeConfigurationGroupItemDialogController', 'storefront.select-configuration-item-dialog.tpl');
            dialogInstance.result.then(function (id) {
                const foundIndex = $scope.productParts.findIndex(x => x.name === productPart.name);
                $scope.productParts[foundIndex].selectedItemId = id;
                recalculateTotals();
            });
        };

        $scope.getSelectedItem = function(configPart) {
            const item = configPart.items.find(x => x.id === configPart.selectedItemId);
            return item.name;
        }

        $scope.getCurrentTotal = function() {
            var total;

            if ($scope.updatedTotal) {
                total = roundHelper.bankersRound($scope.updatedTotal * $scope.configurationQty);
            } else {
                total = roundHelper.bankersRound($scope.defaultPrice * $scope.configurationQty);
            }

            return $filter('currency')(total, storeCurrency.symbol);
        }

        $scope.getDefaultPrice = function() {
            return $filter('currency')($scope.defaultPrice, storeCurrency.symbol);
        }

        $scope.getCustomChangesTotal = function() {
            return $scope.differenceSign + $filter('currency')($scope.totalDifference, storeCurrency.symbol) || $filter('currency')(0, storeCurrency.symbol);
        }

        $scope.quantityChanged = function(qty) {
            const intValue = parseInt(qty, 10);

            if (isNaN(intValue) || intValue === 0) {
                $scope.configurationQty = 1
            } else {
                $scope.configurationQty = intValue;
            }
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

        function recalculateTotals() {
            $scope.selectedProductParts = [];
            _.each($scope.productParts, function (part) {
                $scope.selectedProductParts.push(part.items.find(x => x.id === part.selectedItemId));
            });
            $scope.updatedTotal = roundHelper.bankersRound($scope.selectedProductParts.reduce((prev, cur) => prev + cur.price.actualPrice.amount, 0));
            $scope.totalDifference = roundHelper.bankersRound(Math.abs($scope.updatedTotal - $scope.defaultPrice));
            $scope.differenceSign = ($scope.updatedTotal === $scope.defaultPrice) ? '' :
                                    ($scope.updatedTotal > $scope.defaultPrice) ? '+' : '-';
        }

        $scope.initProductConfiguration = function(productId) {
            catalogService.getProductConfiguration(productId).then(function(response) {
                $scope.productParts = response.data;
                $scope.defaultProductParts = [];
                _.each($scope.productParts, function (part) {
                    $scope.defaultProductParts.push(part.items.find(x => x.id === part.selectedItemId));
                });

                $scope.defaultPrice = roundHelper.bankersRound($scope.defaultProductParts.reduce((prev, cur) => prev + cur.price.actualPrice.amount, 0));
            });
        }

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
            dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'recentlyAddedCartItemDialogController', 'storefront.send-product-to-email.tpl');
        };

        initialize();
    }]);
