let storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('configurableProductController', ['$rootScope', '$scope', '$window', 'dialogService', 'catalogService', 'cartService', '$filter', 'roundHelper', 'availabilityService', 'storeCurrency', 'pricingService',
    function ($rootScope, $scope, $window, dialogService, catalogService, cartService, $filter, roundHelper, availabilityService, storeCurrency, pricingService) {
        $scope.configurationQty = 1;

        $scope.addSelectedProductsToCart = function() {
            const configuredProductId = $window.product.id;
            const products = $scope.productParts.map(part => {
                return part.items.find(item => item.id === part.selectedItemId);
            });
            const inventoryError = products.some(product => product.availableQuantity < $scope.configurationQty);
            const dialogData = toDialogDataModel(products, $scope.configurationQty, inventoryError, configuredProductId);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');

            if (!inventoryError) {
                const items = $scope.productParts.map(value => {
                    return { id: value.selectedItemId, quantity: $scope.configurationQty, configuredProductId: configuredProductId };
                });

                cartService.addLineItems(items).then(response => {
                    const result = response.data;
                    if (result.isSuccess) {
                        $rootScope.$broadcast('cartItemsChanged');
                    }
                });
            }
        }

        $scope.changeGroupItem = function (productPart) {
            const dialogInstance = dialogService.showDialog(productPart, 'changeConfigurationGroupItemDialogController', 'storefront.select-configuration-item-dialog.tpl');
            dialogInstance.result.then(id => {
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
            let total;

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
            const productIds = products.map(product => {
                return product.id;
            });
            const items = products.map(product => {
                return angular.extend({ }, product, { quantity: +quantity, inventoryError: product.availableQuantity < quantity, configuredProductId: configuredProductId })
            });
            return { productIds, items, inventoryError, configuredProductId, configurationQty: quantity };
        }

        function initialize() {
          let product = $window.product;
          if (!product) {
              return;
          }
          catalogService.getProduct([product.id]).then(response => {
              let defaultPartsTotalsObject = [];
              product = response.data[0];
              $scope.selectedVariation = product;
              $scope.productParts = response.data[0].parts;
              $scope.defaultProductParts = [];
              _.each($scope.productParts, part => {
                  $scope.defaultProductParts.push(part.items.find(x => x.id === part.selectedItemId));
                  defaultPartsTotalsObject.push({id: part.items.find(x => x.id === part.selectedItemId).id, quantity: 1});
              });
              pricingService.getProductsTotal(defaultPartsTotalsObject).then(result => {
                $scope.defaultPrice = $scope.showPricesWithTaxes ? result.data.totalWithTax.amount : result.data.total.amount;
              });

              return availabilityService.getProductsAvailability([product.id]).then(res => {
                  $scope.availability = _.object(_.pluck(res.data, 'productId'), res.data);
              });
          });
        }

        function recalculateTotals() {
            let selectedProductParts = [];
            _.each($scope.productParts, part => {
              selectedProductParts.push({id: part.items.find(x => x.id === part.selectedItemId).id, quantity: 1});
            });
            pricingService.getProductsTotal(selectedProductParts).then(result => {
              $scope.updatedTotal = $scope.showPricesWithTaxes ? result.data.totalWithTax.amount : result.data.total.amount;
              $scope.totalDifference = Math.abs($scope.updatedTotal - $scope.defaultPrice);
              $scope.differenceSign = ($scope.updatedTotal === $scope.defaultPrice) ? '' :
                                      ($scope.updatedTotal > $scope.defaultPrice) ? '+' : '-';
            });
        }

        initialize();
    }]);
