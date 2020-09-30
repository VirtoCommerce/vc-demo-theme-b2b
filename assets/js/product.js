var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productController', ['$rootScope', '$scope', '$window', '$timeout', 'dialogService', 'catalogService', 'cartService', 'quoteRequestService', 'availabilityService', '$filter', 'roundHelper', 'validationHelper',
    function ($rootScope, $scope, $window, $timeout, dialogService, catalogService, cartService, quoteRequestService, availabilityService, $filter, roundHelper, validationHelper) {
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

        $scope.addProductToCart = function (product, quantity) {
            var dialogData = toDialogDataModel(product, quantity);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
            cartService.addLineItem(product.id, quantity).then(function (response) {
                $rootScope.$broadcast('cartItemsChanged');
            });
        }

        // TODO: Replace mock with real function
        $scope.addProductsToCartMock = function () {
            var rejection = {
                data: {
                    message: "The 1 product(s) below was not added to cart:",
                    modelState: {
                        "Test": "Test"
                    }
                }
            };
            var items = [
                {
                    id: "9cbd8f316e254a679ba34a900fccb076",
                    name: "3DR Solo Quadcopter (No Gimbal)",
                    imageUrl: "//localhost/admin/assets/catalog/1428965138000_1133723.jpg",
                    price: {
                        actualPrice: {
                            formattedAmount: "$896.39"
                        },
                        actualPriceWithTax: {
                            formattedAmount: "$1,075.67"
                        },
                        listPrice: {
                            formattedAmount: "$995.99"
                        },
                        listPriceWithTax: {
                            formattedAmount: "$1,195.19"
                        },
                        extendedPrice: {
                            formattedAmount: "$1,792.78"
                        },
                        extendedPriceWithTax: {
                            formattedAmount: "$2,151.34"
                        }
                    },
                    quantity: 2,
                    url: "~/camcorders/aerial-imaging-drones/3dr-solo-quadcopter-no-gimbal"
                },
                {
                    id: "ad4ae79ffdbc4c97959139a0c387c72e",
                    name: "Samsung Galaxy Note 4 SM-N910C 32GB",
                    imageUrl: "//localhost/admin/assets/catalog/1416164841000_1097106.jpg",
                    price: {
                        actualPrice: {
                            formattedAmount: "$530.99"
                        },
                        actualPriceWithTax: {
                            formattedAmount: "$637.19"
                        },
                        listPrice: {
                            formattedAmount: "$589.99"
                        },
                        listPriceWithTax: {
                            formattedAmount: "$707.99"
                        },
                        extendedPrice: {
                            formattedAmount: "$1,592.97"
                        },
                        extendedPriceWithTax: {
                            formattedAmount: "$1,911.57"
                        }
                    },
                    quantity: 5,
                    url: "~/cell-phones/samsung-galaxy-note-4-sm-n910c-32gb"
                }
            ];
            var dialogData = toDialogDataModelMock(items, rejection);
            dialogService.showDialog(dialogData, 'recentlyAddedCartItemDialogController', 'storefront.recently-added-cart-item-dialog.tpl');
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
            var dialogData = toDialogDataModel(product, quantity);
            dialogService.showDialog(dialogData, 'recentlyAddedActualQuoteRequestItemDialogController', 'storefront.recently-added-actual-quote-request-item-dialog.tpl');
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

            return $filter('currency')(total ,'$');
        }

        $scope.getDefaultPrice = function() {
            return $filter('currency')($scope.defaultPrice, '$');
        }

        $scope.getCustomChangesTotal = function() {
            return $scope.differenceSign + $filter('currency')($scope.totalDifference, '$') || $filter('currency')(0, '$');
        }

        $scope.quantityChanged = function(qty) {
            const intValue = parseInt(qty, 10);

            if (isNaN(intValue) || intValue === 0) {
                $scope.configurationQty = 1
            } else {
                $scope.configurationQty = intValue;
            }
        }

        function toDialogDataModel(product, quantity) {
            return { items: [angular.extend({ }, product, { quantity: quantity })] };
            //     return {
            //         id: product.id,
            //         name: product.name,
            //         imageUrl: product.primaryImage ? product.primaryImage.url : null,
            //         listPrice: product.price.listPrice,
            //listPriceWithTax: product.price.listPriceWithTax,
            //         placedPrice: product.price.actualPrice,
            //         placedPriceWithTax: product.price.actualPriceWithTax,
            //         quantity: quantity,
            //         updated: false
            //     }
        }

        function toDialogDataModelMock(items, rejection) {
            var dialogDataModel = {};
            if (rejection) {
                dialogDataModel.errorMessage = rejection.data.message;
                dialogDataModel.errors = rejection.data.modelState;
            }
            dialogDataModel.items = items;
            return dialogDataModel;
        }

        function initialize(filters) {
            var product = $window.product;
            if (!product || !product.id) {
                return;
            }
            catalogService.getProduct([product.id]).then(function (response) {
				var product = response.data[0];
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

            catalogService.getProductConfiguration(product.id).then(function(response) {
                $scope.productParts = response.data;
                $scope.defaultProductParts = [];
                _.each($scope.productParts, function (part) {
                    $scope.defaultProductParts.push(part.items.find(x => x.id === part.selectedItemId));
                });
                $scope.defaultPrice = roundHelper.bankersRound($scope.defaultProductParts.reduce((prev, cur) => prev + cur.price.actualPrice.amount, 0));
            });
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

        //function findVariationBySelectedProps(variations, selectedPropMap) {
        //    return _.find(variations, function (x) {
        //        return comparePropertyMaps(getVariationPropertyMap(x), selectedPropMap);
        //    });
        //}

        ////Method called from View when user clicks one property value
        //$scope.checkProperty = function (property) {
        //    //Select appropriate property and unselect previous selection
        //    _.each($scope.allVariationPropsMap[property.displayName], function (x) {
        //        x.selected = x != property ? false : !x.selected;
        //    });

        //    //try to find the best variation match for selected properties
        //    $scope.selectedVariation = findVariationBySelectedProps(allVariations, getSelectedPropsMap($scope.allVariationPropsMap));
        //};

        $scope.sendToEmail = function (storeId, productId, productUrl, language) {
            dialogService.showDialog({ storeId: storeId, productId: productId, productUrl: productUrl, language: language }, 'recentlyAddedCartItemDialogController', 'storefront.send-product-to-email.tpl');
        };

        $scope.$watch('filters', initialize);
    }]);

storefrontApp.controller('recentlyAddedCartItemDialogController', ['$scope', '$window', '$uibModalInstance', 'mailingService', 'dialogData', 'baseUrl', function ($scope, $window, $uibModalInstance, mailingService, dialogData, baseUrl) {
    $scope.dialogData = dialogData;
    $scope.baseUrl = baseUrl;
    $scope.regex = new RegExp(/^\/+/);

    $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.redirect = function (url) {
        $window.location.href = url;
    }
    $scope.send = function(email) {
        mailingService.sendProduct(dialogData.productId, { email: email, storeId: dialogData.storeId, productUrl: dialogData.productUrl, language: dialogData.language });
        $uibModalInstance.close();
    }
}]);

storefrontApp.controller('changeConfigurationGroupItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', function ($scope, $window, $uibModalInstance, dialogData) {
    $scope.dialogData = dialogData;
    $scope.selectedId = dialogData.selectedItemId;

    $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.getModalTitel = function() {
        return `Choose ${$scope.dialogData.name}`
    }

    $scope.handleRadioClick = function(id) {
        $scope.selectedId = id;
    }

    $scope.save = function(id) {
        $uibModalInstance.close(id);
    }
}]);
