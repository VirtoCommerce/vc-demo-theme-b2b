var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productController', ['$rootScope', '$scope', '$window', 'dialogService', 'catalogService', 'cartService', 'quoteRequestService', 'availabilityService', '$filter', 'roundHelper', 'validationHelper', 'storeCurrency',
    function ($rootScope, $scope, $window, dialogService, catalogService, cartService, quoteRequestService, availabilityService, $filter, roundHelper, validationHelper, storeCurrency) {
        //TODO: prevent add to cart not selected variation
        // display validator please select property
        // display price range
        $scope.allVariations = [];
        $scope.allVariationsMap = {}
        $scope.allVariationPropsMap = {};
        $scope.allVariationPropsMapCount = null;
        $scope.filterableVariationPropsMap = { };
        $scope.selectedVariation = {};
        $scope.productPrice = null;
        $scope.productPriceLoaded = false;
        $scope.configurationQty = 1;
        $scope.validateQtyInput = validationHelper.positiveInt;

        $scope.addSelectedProductsToCart = function() {
            if($window.product.productType != 'Configurable'){
                throw new Error("addSelectedProductsToCart method is allowed only in scope of configurable product");
            }

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

        $scope.addProductToActualQuoteRequest = function (product, quantity) {
            var dialogData = toDialogDataModel([product], quantity);
            dialogService.showDialog(dialogData, 'recentlyAddedActualQuoteRequestItemDialogController', 'storefront.recently-added-actual-quote-request-item-dialog.tpl', 'lg');
            quoteRequestService.addProductToQuoteRequest(product.id, quantity).then(function (response) {
                $rootScope.$broadcast('actualQuoteRequestItemsChanged');
            });
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

        function initialize(filters) {
            var product = $window.product;
            if ($window.products || !product) {
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

                return availabilityService.getProductsAvailability([product.id]).then(function(response) {
                    $scope.availability = _.object(_.pluck(response.data, 'productId'), response.data);
                });
            });

            if (product.productType != 'Configurable') {
                return;
            }

            $scope.initProductConfiguration(product.id);
        };

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
        };

        function getVariationPropertyMap(variation) {
            return _.groupBy(variation.variationProperties, function (x) { return x.displayName });
        }

        function getSelectedPropsMap(variationPropsMap) {
            var retVal = {};
            _.each(_.keys(variationPropsMap), function (x) {
                var property = _.find(variationPropsMap[x], function (y) {
                    return y.selected;
                });
                if (property) {
                    retVal[x] = [property];
                }
            });
            return retVal;
        }

        function comparePropertyMaps(propMap1, propMap2) {
            return _.every(_.keys(propMap1), function (x) {
                var retVal = propMap2.hasOwnProperty(x);
                if (retVal) {
                    retVal = propMap1[x][0].value == propMap2[x][0].value;
                }
                return retVal;
            });
        };

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

        $scope.$watch('filters', initialize);
    }]);
