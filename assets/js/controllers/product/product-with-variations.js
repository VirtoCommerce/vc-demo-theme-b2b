var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productWithVariationsController', [ '$rootScope', '$scope', '$window', '$filter', 'catalogService', 'availabilityService', 'pricingService', 'dialogService', 'cartService', 'storeCurrency', 'storefrontApp.mainContext',
    function ($rootScope, $scope, $window, $filter, catalogService, availabilityService, pricingService, dialogService, cartService, storeCurrency, mainContext) {
        //TODO: prevent add to cart not selected variation
        // display validator please select property
        // display price range
        $scope.allVariations = [];
        $scope.allVariationsMap = {}
        $scope.allVariationPropsMap = {};
        $scope.allVariationPropsMapCount = null;
        $scope.filterableVariationPropsMap = { };
        $scope.selectedVariation = {};
        $scope.customer = mainContext.customer;

        $scope.totalPrice = getDefaultTotalPrice();

        function initialize(filters) {
            var product = $window.product;
            if (!product) {
                return;
            }
            catalogService.getProduct([product.id]).then(function (response) {
                product = response.data[0];
                //Current product is also a variation (titular)
                var allVariations = [product].concat(product.variations || []);
                var filteredVariations = allVariations;
                $scope.allVariations.length = 0;
                if (filters) {
                    var variationPropsKeys = Object.keys(filters.terms || {});
                    filteredVariations = _.filter(allVariations, function(variation) {
                        return _.all(variation.variationProperties, function(property) {
                            return !variationPropsKeys.includes(property.displayName) || filters.terms[property.displayName].includes(property.value);
                        });
                    });
                }
                Array.prototype.push.apply($scope.allVariations, filteredVariations);
                angular.copy(_.object(filteredVariations.map(function (variation) { return [variation.id, variation]; })), $scope.allVariationsMap);
                angular.copy(getFlatternDistinctPropertiesMap(allVariations), $scope.allVariationPropsMap);
                angular.copy(_.pick($scope.allVariationPropsMap, function (value, key, object) { return value.length > 1; }), $scope.filterableVariationPropsMap);
                $scope.allVariationPropsMapCount = _.keys($scope.allVariationPropsMap).length;

                $scope.selectedVariation = product;

                return availabilityService.getProductsAvailability([product.id]).then(function(res) {
                    $scope.availability = _.object(_.pluck(res.data, 'productId'), res.data);
                });
            });
        }


        function getDefaultTotalPrice() {
          return $filter('currency')(0, storeCurrency.symbol);
        }

        function getFlatternDistinctPropertiesMap(variations) {
            var retVal = {};
            _.each(variations, function (variation) {
                var propertyMap = getVariationPropertyMap(variation);
                //merge
                _.each(_.keys(propertyMap), function (x) {
                    retVal[x] = _.uniq(_.union(retVal[x], propertyMap[x]), "value");
                });
            });
            return retVal;
        }

        function getVariationPropertyMap(variation) {
            return _.groupBy(variation.variationProperties, function (x) { return x.displayName });
        }

        function getVariationsWithQuantity() {
          return _.pairs($scope.allVariationsMap).map(x => x[1]).filter(x => !!(+x.quantity));
        }

        function convertVariationsToAddItems(variations) {
          return variations.map( x => { return { productId: x.id, quantity: +x.quantity}; });
        }

        $scope.recalculateTotalPrice = () => {
          const variationsWithQuantity = getVariationsWithQuantity();

          if (variationsWithQuantity.length === 0) {
            $scope.totalPrice = getDefaultTotalPrice();
            return;
          }

          const items = convertVariationsToAddItems(variationsWithQuantity);

          pricingService.getProductsTotal(items).then( (result) => {
            $scope.totalPrice = $scope.showPricesWithTaxes ? result.data.totalWithTax.formattedAmount : result.data.total.formattedAmount;
          });

        }

        $scope.hasVariationsWithQuantity = () => {
          const variationsWithQuantity = getVariationsWithQuantity();
          return variationsWithQuantity.length > 0;
        }

        function toDialogDataModel(products, inventoryError) {
            let productIds = products.map(function(product) {
                return product.id;
            });
            let items = products.map(function(product) {
                return angular.extend({ }, product, { inventoryError: product.availableQuantity < +product.quantity, quantity: +product.quantity })
            });
            return { productIds, items, inventoryError };
        }

        $scope.addVariationsToCart = function() {
           const variations = getVariationsWithQuantity();

           var inventoryError = variations.some(product => product.availableQuantity < product.quantity);
           var dialogData = toDialogDataModel(variations, inventoryError);
           dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl', 'lg');

           if (!inventoryError) {
               var items = convertVariationsToAddItems(variations);

               cartService.addLineItems(items).then(function (response) {
                   var result = response.data;
                   if (result.isSuccess) {
                       $rootScope.$broadcast('cartItemsChanged');
                   }
               });
           }
        }

        initialize();
    }]);
