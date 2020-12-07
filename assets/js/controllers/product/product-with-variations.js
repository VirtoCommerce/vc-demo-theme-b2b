var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productWithVariationsController', ['$rootScope', '$scope', '$window', 'dialogService', 'catalogService', 'cartService', 'availabilityService', 'validationHelper',
    function ($rootScope, $scope, $window, dialogService, catalogService, cartService, availabilityService, validationHelper) {
        //TODO: prevent add to cart not selected variation
        // display validator please select property
        // display price range
        $scope.allVariations = [];
        $scope.allVariationsMap = {}
        $scope.allVariationPropsMap = {};
        $scope.allVariationPropsMapCount = null;
        $scope.filterableVariationPropsMap = { };
        $scope.selectedVariation = {};
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
                //Auto select initial product as default variation  (its possible because all our products is variations)
                //var propertyMap = getVariationPropertyMap(product);
                //_.each(_.keys(propertyMap), function (x) {
                //    $scope.checkProperty(propertyMap[x][0])
                //});
                $scope.selectedVariation = product;

                return availabilityService.getProductsAvailability([product.id]).then(function(res) {
                    $scope.availability = _.object(_.pluck(res.data, 'productId'), res.data);
                });
            });
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

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
            dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'recentlyAddedCartItemDialogController', 'storefront.send-product-to-email.tpl');
        };

        $scope.$watch('filters', initialize);
    }]);
