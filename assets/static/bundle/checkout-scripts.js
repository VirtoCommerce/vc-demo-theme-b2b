var storefrontApp = angular.module('storefrontApp');

storefrontApp.service('dialogService', ['$uibModal', function ($uibModal) {
    return {
        showDialog: function (dialogData, controller, templateUrl) {
            var modalInstance = $uibModal.open({
                controller: controller,
                templateUrl: templateUrl,
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

storefrontApp.service('mailingService', ['$http', 'apiBaseUrl', function ($http, apiBaseUrl) {
    return {
        sendProduct: function(id, data) {
            return $http.post(apiBaseUrl + 'api/b2b/send/product/' + id, data);
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

storefrontApp.service('customerService', ['$http', function ($http) {
    return {
        getCurrentCustomer: function () {
            return $http.get('storefrontapi/account?t=' + new Date().getTime());
        }
    }
}]);

storefrontApp.service('fulfillmentCenterService', ['$http', 'apiBaseUrl', function($http, apiBaseUrl) {
    return {
        searchFulfillmentCenters: function (criteria) {
            return $http.post(apiBaseUrl + 'api/fulfillment/search/centers', criteria);
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
		    return $http.post('storefrontapi/pricing/actualprices', { products: products });
		}
	}
}]);

storefrontApp.service('catalogService', ['$http', function ($http) {
    return {
        getProduct: function (productIds) {
            return $http.get('storefrontapi/products?productIds=' + productIds + '&t=' + new Date().getTime());
        },
        search: function (criteria) {
            return $http.post('storefrontapi/catalog/search', { searchCriteria: criteria });
        },
        searchCategories: function (criteria) {
            return $http.post('storefrontapi/categories/search', { searchCriteria: criteria });
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
        changeLineItemQuantity: function (lineItemId, quantity) {
            return $http.put('storefrontapi/cart/items', { lineItemId: lineItemId, quantity: quantity });
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
        getCountries: function () {
            return $http.get('storefrontapi/countries?t=' + new Date().getTime());
        },
        getCountryRegions: function (countryCode) {
        	return $http.get('storefrontapi/countries/' + countryCode + '/regions?t=' + new Date().getTime());
        },
        addCoupon: function (couponCode) {
            return $http.post('storefrontapi/cart/coupons/' + couponCode);
        },
        removeCoupon: function () {
            return $http.delete('storefrontapi/cart/coupons');
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
        createOrder: function (bankCardInfo) {
            return $http.post('storefrontapi/cart/createorder', { bankCardInfo: bankCardInfo });
        }
    }
}]);

storefrontApp.service('listService', ['$q', '$http', '$localStorage', 'customerService', function ($q, $http, $localStorage, customerService) {
    return {
        getOrCreateMyLists: function (userName, lists) {
            if (!$localStorage['lists']) {
                $localStorage['lists'] = {};
                $localStorage['lists'][userName] = [];
                $localStorage['sharedListsIds'] = {};
                $localStorage['sharedListsIds'][userName] = [];
                _.each(lists, function (list) {
                    list.author = userName;
                    list.id = Math.floor(Math.random() * 230910443210623294 + 1).toString();
                });
                _.extend($localStorage['lists'][userName], lists);
            }
            return $q(function (resolve, reject) { resolve($localStorage['lists'][userName]) });
        },

        getSharedLists: function (userName) {
            var lists = $localStorage['lists'];
            var sharedLists = [];
            if ($localStorage['sharedListsIds']) {
                _.each($localStorage['sharedListsIds'][userName], function(cartId) {
                    _.each(lists, function(list) {
                        if (angular.isDefined(_.find(list, { id: cartId.toString() }))) {
                            sharedLists.push(_.find(list, { id: cartId }));
                        }

                    });
                });
            }
            return $q(function (resolve, reject) { resolve(sharedLists) });
        },
        getWishlist: function (listName, permission, id, userName) {
            if (_.contains($localStorage['lists'][userName], _.find($localStorage['lists'][userName], { name: listName })) && angular.isDefined(userName)) {
                $localStorage['lists'][userName].push({ name: listName + 1, permission: permission, id: id, items: [], author: userName });
            }
            else $localStorage['lists'][userName].push({ name: listName, permission: permission, id: id, items: [], author: userName })

            return _.find($localStorage['lists'][userName], { name: listName });
        },

        addItemToList: function (listId, product) {
            _.each($localStorage['lists'], function(list) {
                if (angular.isDefined(_.find(list, { id: listId }))) {
                    var searchedList = _.find(list, { id: listId });
                    searchedList.items.push(product);
                }

            });
        },

        containsInList: function (productId, cartId) {
            var lists = angular.copy($localStorage['lists']);
            var contains;
            _.each(lists, function(list) {
                if (angular.isDefined(_.find(list, { id: cartId }))) {
                    var currentList = _.find(list, { id: cartId });
                    if (angular.isDefined(_.find(currentList.items, { productId: productId })))
                        contains = true;
                    else
                        contains = false;
                }
            });
            return $q(function (resolve, reject) { resolve({ contains: contains }) });
        },

        addSharedList: function (userName, myLists, sharedCartId) {
            if (!_.some($localStorage['sharedListsIds'][userName], function (x) { return x === sharedCartId }) && (!_.find(myLists, { id: sharedCartId }))) {
                $localStorage['sharedListsIds'][userName].push(sharedCartId);
                return $q(function (resolve, reject) {
                    resolve();
                });
            }
            else return $q(function (resolve, reject) {
                resolve();
            });
        },

        contains: function (productId, listName) {
            return $http.get('storefrontapi/lists/' + listName + '/items/' + productId + '/contains?t=' + new Date().getTime());
        },
        addLineItem: function (productId, listName) {
            return $http.post('storefrontapi/lists/' + listName + '/items', { productId: productId });
        },

        removeLineItem: function (lineItemId, listId, userName) {
            var searchedList = _.find($localStorage['lists'][userName], { id: listId });
            searchedList.items = _.filter(searchedList.items, function (item) { return item.id != lineItemId });
            return $q(function (resolve, reject) {
                resolve(searchedList)
            });
            //return $http.delete('storefrontapi/lists/' + listName + '/items/' + lineItemId);
        },
        clearList: function (cartId, userName) {
            $localStorage['lists'][userName] = _.filter($localStorage['lists'][userName], function (x) { return x.id != cartId });
            //return $http.post('storefrontapi/lists/clear', { listName: listName });
        },
        removeFromFriendsLists: function (currentId, userName) {
            $localStorage['sharedListsIds'][userName] = _.filter($localStorage['sharedListsIds'][userName], function(cartId) {
                return $q(function(resolve, reject) {
                    resolve(cartId !== currentId)
                });
            });
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
        }
    }
}]);

storefrontApp.service('searchQueryService', ['$location', '$httpParamSerializer', function ($location, $httpParamSerializer) {
    return {
        // Converts search query strings like '?key=value1[,value2]' or '?key=key1:value1[,value2[;key2:value3[,value4]]]' to search query state object
        getState: function(obj) {
            var result = {};
            // ?key=valueString&key=valueString
            _.each(Object.keys(obj), function(key) {
                var valueString = $location.search()[key];
                // ?key=value or ?key=key1:value1
                if (valueString) {
                    if (!valueString.match(/[:]/g)) {
                        result[key] = valueString.split(',');
                    } else {
                        var pairs = { };
                        // ?key=key1:value1;key2:value2
                        var pairsString = valueString.split(';');
                        _.each(pairsString, function(pairString) {
                            var pair = pairString.split(':');
                            var key = pair[0];
                            var values = pair[1].split(',');
                            pairs[key] = values;
                        });
                        result[key] = pairs;
                    }
                    result[key] = !angular.isArray(obj[key]) && result[key].length === 1 ? result[key][0] : result[key];
                }
            });
            result = angular.extend({ }, obj, result);
            return result;
        },

        // Gets link like http://localhost/collection?key=key1:value1,value2;key2:value3,value4 from search query state object
        getLink: function(obj, type) {
            var query = $location.search();
            var state = this.getState(query);
            // add or replace value when defined, remove when null and leave old when undefined
            var process = function (src, dest, fn, isArray) {
                var chain = _.chain(_.union(Object.keys(dest), Object.keys(src)))
                    .filter(function(key) {
                        return dest[key] || !(key in dest);
                    })
                    .map(function(key) {
                        return fn(key, src[key], dest[key]);
                    })
                    .compact();
                if (!isArray) {
                    chain = chain.object();
                }
                return chain.value();
            }
            var selectValue = function(srcVal, destVal) {
                if (angular.isArray(destVal)) {
                    destVal = _.compact(destVal);
                    srcVal = _.chain([srcVal]).flatten().compact().value();
                    return (type === 'checkable' ? _.difference(destVal.concat(srcVal), _.intersection(destVal, srcVal)) : destVal).join(',');
                } else {
                    return destVal || srcVal;
                }
            }
            var result = process(state, obj, function (key, srcVal, destVal) {
                var value;
                // replace value when ?key=value and merge objects when ?key=key1:value1
                if (angular.isObject(destVal) && !angular.isArray(destVal)) {
                    if (srcVal) {
                        if (!angular.isObject(srcVal) || angular.isArray(srcVal))
                            throw 'Type of ' + key + ' in search query and object is different';
                    } else {
                        srcVal = angular.isArray(destVal) ? [] : {};
                    }
                    value = process(srcVal, destVal, function (subKey, subSrcVal, subDestVal) {
                        var subVal = selectValue(subSrcVal, subDestVal);
                        return subVal ? subKey + ':' + (angular.isArray(subVal) ? subVal.join(',') : subVal) : null;
                    }, true);
                    value = value.join(';');
                } else {
                    value = selectValue(srcVal, destVal);
                }
                return value ? [key, value] : [];
            }, false);
            var url = new URL($location.absUrl());
            url.search = $httpParamSerializer(result);
            return url.href;
        }
    }
}]);

var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('vcContentPlace', ['$compile', 'marketingService', function ($compile, marketingService) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            marketingService.getDynamicContent(attrs.id).then(function (response) {
                element.html($compile(response.data)(scope));
            });
        },
        replace: true
    }
}]);

storefrontApp.directive('vcEnterSource', ['$timeout', function ($timeout) {
    return {
        restrict: "A",
        controller: function() { },
        link: function (scope, element, attrs, ctrl) {
            var onKeyPress = function (event) {
                if (event.keyCode === 13) { // Enter
                    ctrl.element[0].click();
                }
            };
            element.on('keypress', onKeyPress);
            scope.$on('$destroy', function () {
                element.off('keypress', onKeyPress);
            });
        }
    };
}]);

storefrontApp.directive('vcEnterTarget', [function () {
    return {
        restrict: "A",
        require: "^vcEnterSource",
        link: function (scope, element, attrs, ctrl) {
            ctrl.element = element;
        }
    };
}]);

storefrontApp.directive('vcQuerySource', ['$parse', 'searchQueryService', function ($parse, searchQueryService) {
    return {
        restrict: "A",
        compile: function (tElem, tAttr) {
            if (!tAttr.href) {
                return function(scope, element, attrs) {
                    // If the linked element is not an anchor tag anymore, do nothing
                    if (element[0].nodeName.toLowerCase() !== 'a') return;

                    // get query from current url, replace query parts with specified parts and set href
                    scope.$watch(function() {
                         return [attrs.vcQuerySource, attrs.queryType];
                    }, function (obj) {
                        var querySource = $parse(obj[0])(scope);
                        var queryType = $parse(obj[1])(scope);
                        var href = searchQueryService.getLink(querySource, queryType);
                        element.attr("href", href);
                    }, true);
                }
            }
        }
    }
}]);

storefrontApp.directive('vcQueryTarget', ['$parse', 'searchQueryService', function ($parse, searchQueryService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var vcQueryTarget = $parse(attrs.vcQueryTarget);
            // get requested keys and set ng-model value to value of ?key1=value1&key2=value2
            var t = vcQueryTarget(scope);
            var state = searchQueryService.getState(t);
            vcQueryTarget.assign(scope, state);
        }
    }
}]);

storefrontApp.directive('fallbackSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('error', errorHandler);

            scope.$on('$destroy', function() {
                element.off('error', errorHandler);
            });

            function errorHandler(event) {
                if (element.attr('src') !== attrs.fallbackSrc) {
                    element.attr('src', attrs.fallbackSrc);
                }
                else {
                    element.off(event);
                }
            };
        }
    }
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('mainController', ['$rootScope', '$scope', '$location', '$window', 'customerService', 'storefrontApp.mainContext',
    function ($rootScope, $scope, $location, $window, customerService, mainContext) {

        //Base store url populated in layout and can be used for construction url inside controller
        $scope.baseUrl = {};

        $scope.$watch(function () {
            $scope.currentPath = $location.$$path.replace('/', '');
        });

        $rootScope.$on('storefrontError', function (event, data) {
            $rootScope.storefrontNotification = data;
            $rootScope.storefrontNotification.detailsVisible = false;
        });

        $rootScope.toggleNotificationDetails = function () {
            $rootScope.storefrontNotification.detailsVisible = !$rootScope.storefrontNotification.detailsVisible;
        }

        $rootScope.closeNotification = function () {
            $rootScope.storefrontNotification = null;
        }

        //For outside app redirect (To reload the page after changing the URL, use the lower-level API)
        $scope.outerRedirect = function (absUrl) {
            $window.location.href = absUrl;
        };

        //change in the current URL or change the current URL in the browser (for app route)
        $scope.innerRedirect = function (path) {
            $location.path(path);
            $scope.currentPath = $location.$$path.replace('/', '');
        };

        $scope.stringifyAddress = function (address) {
            var stringifiedAddress = address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.getObjectSize = function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        }

        mainContext.getCustomer = $scope.getCustomer = function () {
            customerService.getCurrentCustomer().then(function (response) {
                var addressId = 1;
                _.each(response.data.addresses, function (address) {
                    address.id = addressId;
                    addressId++;
                });
                response.data.isContact = response.data.memberType === 'Contact';
                mainContext.customer = $scope.customer = response.data;
            });
        };

        $scope.getCustomer();
    }])

.factory('storefrontApp.mainContext', function () {
    return {};
});
var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcAddress', {
    templateUrl: "themes/assets/address.tpl.html",
    bindings: {
        address: '=',
        addresses: '<',
        countries: '=',
        validationContainer: '=',
        getCountryRegions: '&',
        editMode: '<',
        onUpdate: '&'
    },
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;
        ctrl.types = [{ id: 'Billing', name: 'Billing' }, { id: 'Shipping', name: 'Shipping' }, { id: 'BillingAndShipping', name: 'Billing and Shipping' }];
        
        this.$onInit = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        function populateRegionalDataForAddress(address) {
            if (address) {
                //Set country object for address
                address.country = _.findWhere(ctrl.countries, { code3: address.countryCode });
                if (address.country != null) {
                    ctrl.address.countryName = ctrl.address.country.name;
                    ctrl.address.countryCode = ctrl.address.country.code3;
                }

                if (address.country) {
                    if (address.country.regions) {
                        setAddressRegion(address, address.country.regions);
                    }
                    else {
                        ctrl.getCountryRegions({ country: address.country }).then(function (regions) {
                            address.country.regions = regions;
                            setAddressRegion(address, regions);
                        });
                    }
                }
            }
        }

        function setAddressRegion(address, regions) {
            address.region = _.findWhere(regions, { code: address.regionId });
            if (address.region) {
                ctrl.address.regionId = ctrl.address.region.code;
                ctrl.address.regionName = ctrl.address.region.name;
            }
            else {
                ctrl.address.regionId = undefined;
                ctrl.address.regionName = undefined;
            }
        }

        ctrl.setForm = function (frm) { ctrl.form = frm; };

        ctrl.validate = function () {
            if (ctrl.form) {
                ctrl.form.$setSubmitted();
                return ctrl.form.$valid;
            }
            return true;
        };

        function stringifyAddress(address) {
            var addressType = '';

            var type = _.find(ctrl.types, function (i) { return i.id == ctrl.address.addressType });
            if (type)
                addressType = '[' + type.name + '] ';

            var stringifiedAddress = addressType;
            stringifiedAddress += address.firstName + ' ' + address.lastName + ', ';
            stringifiedAddress += address.organization ? address.organization + ', ' : '';
            stringifiedAddress += address.countryName + ', ';
            stringifiedAddress += address.regionName ? address.regionName + ', ' : '';
            stringifiedAddress += address.city + ' ';
            stringifiedAddress += address.line1 + ', ';
            stringifiedAddress += address.line2 ? address.line2 : '';
            stringifiedAddress += address.postalCode;
            return stringifiedAddress;
        }

        $scope.$watch('$ctrl.address', function () {
            if (ctrl.address) {
                populateRegionalDataForAddress(ctrl.address);
                ctrl.address.name = stringifyAddress(ctrl.address);
            }
            ctrl.onUpdate({ address: ctrl.address });
        }, true);

    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCreditCard', {
    templateUrl: "themes/assets/js/common-components/creditCard.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        card: '=',
        validationContainer: '='
    },
    controller: ['$scope', '$filter', function ($scope, $filter) {
        var ctrl = this;

        this.$onInit = function () {
            if(ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        $scope.$watch('$ctrl.card.bankCardHolderName', function (val) {
            if (ctrl.card) {
                ctrl.card.bankCardHolderName = $filter('uppercase')(val);
            }
        }, true);

        ctrl.validate = function () {
            ctrl.form.$setSubmitted();
            return !ctrl.form.$invalid;
        }

    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.config(['$provide', function ($provide) {
    $provide.decorator('uibDropdownDirective', ['$delegate', function ($delegate) {
        var directive = $delegate[0];
        var compile = directive.compile;
        directive.compile = function () {
            var link = compile.apply(this, arguments);
            return function (scope, element, attrs, dropdownCtrl) {
                if (attrs.autoClose === 'mouseleave') {
                    dropdownCtrl.toggle(false);
                }

                var closeDropdown = function() {
                    scope.$apply(function () {
                        if (attrs.autoClose === 'mouseleave') {
                            dropdownCtrl.toggle(false);
                        }
                    });
                };

                element.on('mouseleave', closeDropdown);

                link.apply(this, arguments);

                scope.$on('$destroy', function() {
                    element.off('mouseleave', closeDropdown);
                });
            };
        };
        return $delegate;
    }]);

    $provide.decorator('uibDropdownToggleDirective', ['$delegate', function($delegate) {
        var directive = $delegate[0];
        directive.controller = function () { };
        $delegate[0] = directive;
        return $delegate;
    }]);
}]);

storefrontApp.directive('toggleOnMouseEnter', function() {
    return {
        require: ['?^uibDropdown', '?uibDropdownToggle'],
        link: function (scope, element, attrs, ctrls) {
            var dropdownCtrl = ctrls[0];
            var dropdownToggleCtrl = ctrls[1];
            if (!(dropdownCtrl && dropdownToggleCtrl)) {
                return;
            }

            element.addClass('toggle-on-mouse-enter');

            var openDropdown = function () {
                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        dropdownCtrl.toggle(true);
                    });
                }
            };

            element.on('mouseenter', openDropdown);

            scope.$on('$destroy', function () {
                element.off('mouseenter', openDropdown);
            });
        }
    };
});

storefrontApp.directive('dropdownClose', function () {
    return {
        require: ['?^uibDropdown'],
        link: function (scope, element, attrs, ctrls) {
            var dropdownCtrl = ctrls[0];
            if (!dropdownCtrl) {
                return;
            }

            var closeDropdown = function () {
                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        dropdownCtrl.toggle(false);
                    });
                }
            };

            element.on('click', closeDropdown);

            scope.$on('$destroy', function () {
                element.off('click', closeDropdown);
            });
        }
    };
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcErrors', {
    templateUrl: "themes/assets/errors.tpl.html",
    bindings: {
        level: '<',
        message: '<',
        errors: '<'
    },
    controller: [function () {
        var $ctrl = this;
        $ctrl.level = $ctrl.level || 'danger';
    }]
});

angular.module('storefrontApp')

.component('vcLabeledInput', {
    templateUrl: "themes/assets/labeled-input.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        placeholder: '@',
        type: '@?',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        disabled: '<'
    },
    controller: [function () {
        var $ctrl = this;
        
        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});

angular.module('storefrontApp')

.component('vcLabeledSelect', {
    templateUrl: "themes/assets/labeled-select.tpl.html",
    require: {
        ngModel: "?ngModel"
    },
    bindings: {
        options: '<',
        select: '&',
        form: '=',
        name: '@',
        placeholder: '<',
        required: '<',
        requiredError: '@?',
        autofocus: '<',
        disabled: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.$onInit = function() {
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$render = function() {
                $ctrl.value = $ctrl.ngModel.$viewValue;
            };
        };

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

        var select = $ctrl.select;
        $ctrl.select = function(option) {
            select(option);
            $ctrl.value = option;
            if ($ctrl.required)
                $ctrl.ngModel.$setValidity('required', false);
            $ctrl.ngModel.$setViewValue($ctrl.value);
        };        
    }]
});
angular.module('storefrontApp')

.component('vcLabeledTextArea', {
    templateUrl: "themes/assets/labeled-textarea.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        label: '@',
        required: '<',
        requiredError: '@?',
        pattern: '<?',
        autofocus: '<'
    },
    controller: [function () {
        var $ctrl = this;

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});
var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        items: '='
    }
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMember', {
    templateUrl: "themes/assets/member.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '='
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) { $ctrl.form = frm; };


        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcMemberDetail', {
    templateUrl: "themes/assets/memberDetail.tpl.html",
    bindings: {
        member: '=',
        memberComponent: '=',
        fieldsConfig: '<'
    },
    controller: ['$scope', function ($scope) {
        var $ctrl = this;
        
        $ctrl.config = [
            {
                field: 'CompanyName',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'Email',
                disabled: false,
                visible: true,
                required: true
            },
            {
                field: 'UserName',
                disabled: false,
                visible: true
            },
            {
                field: 'Password',
                disabled: false,
                visible: true
            },
            {
                field: 'Roles',
                disabled: false,
                visible:  false
            }
        ];

        if ($ctrl.fieldsConfig)
            angular.extend($ctrl.config, $ctrl.fieldsConfig);

        $ctrl.rolesComponent = null;

        this.$onInit = function () {
            $ctrl.memberComponent = this;
        };

        this.$onDestroy = function () {
            $ctrl.memberComponent = null;
        };

        $ctrl.setForm = function (frm) {
            $ctrl.form = frm;
        };

        $ctrl.validate = function () {
            if ($ctrl.form) {
                $ctrl.form.$setSubmitted();
                return $ctrl.form.$valid;
            }
            return true;
        };

        $ctrl.showField = function (field) {
            return getFieldConfig(field).visible == true;
        }

        $ctrl.disableField = function (field) {
            return getFieldConfig(field).disabled == true;
        }

        $ctrl.requiredField = function (field) {
            return getFieldConfig(field).required == true;
        }

        function getFieldConfig(field) {
            var configItem = _.first(_.filter($ctrl.config, function (configItem) { return configItem.field === field; }));
            return configItem;
        }
    }]
});

storefrontApp.directive('confirmPasswordValidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {
            ngModel.$parsers.unshift(function (value, scope) {
                var isValid = true;
                var password = ngModel.$$parentForm.Password.$viewValue;

                if (password) {
                    isValid = password === value;
                }

                ngModel.$setValidity('confirmPasswordValidation', isValid);
                return value;
            });
        }
    };
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentMethods', {
    templateUrl: "themes/assets/js/common-components/paymentMethods.tpl.html",
    require: {
        checkoutStep: '?^vcCheckoutWizardStep'
    },
    bindings: {
        getAvailPaymentMethods: '&',
        onSelectMethod: '&',
        paymentMethod: '=',
        validationContainer: '='
    },
    controller: ['$scope', function ($scope) {
        var ctrl = this;

        this.$onInit = function () {
            ctrl.getAvailPaymentMethods().then(function (methods) {
                ctrl.availPaymentMethods = _.sortBy(methods, function (x) { return x.priority; });
                if (ctrl.paymentMethod) {
                    ctrl.paymentMethod = _.findWhere(ctrl.availPaymentMethods, { code: ctrl.paymentMethod.code });
                }
                if (!ctrl.paymentMethod && ctrl.availPaymentMethods.length > 0) {
                    ctrl.selectMethod(ctrl.availPaymentMethods[0]);
                }
            })
            if (ctrl.validationContainer)
                ctrl.validationContainer.addComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.addComponent(this);
        };

        this.$onDestroy = function () {
            if (ctrl.validationContainer)
                ctrl.validationContainer.removeComponent(this);
            if (ctrl.checkoutStep)
                ctrl.checkoutStep.removeComponent(this);
        };

        ctrl.validate = function () {
            return ctrl.paymentMethod;
        }

        ctrl.selectMethod = function (method) {
            ctrl.paymentMethod = method;
            ctrl.onSelectMethod({ paymentMethod: method });
        };
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcPaymentPlan', {
    templateUrl: "themes/assets/js/common-components/paymentPlan.tpl.html",
    bindings: {
    },
    controller: ['$scope', '$localStorage', function($scope, $localStorage) {
        var $ctrl = this;

        $scope.$watch(function() {
            return $ctrl.availablePaymentPlans;
        }, function (availablePaymentPlans) {
            if (availablePaymentPlans) {
                $ctrl.paymentPlan = $localStorage['paymentPlan'];
                $ctrl.type = $ctrl.paymentPlan ? 'auto-reorder' : 'one-time';
                $ctrl.paymentPlan = ($ctrl.paymentPlan ? _.findWhere($ctrl.availablePaymentPlans, { intervalCount: $ctrl.paymentPlan.intervalCount, interval: $ctrl.paymentPlan.interval }) : undefined) ||
                    _.findWhere($ctrl.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
            }
        });

        $ctrl.save = function() {
            if ($ctrl.type === 'auto-reorder') {
                $localStorage['paymentPlan'] = $ctrl.paymentPlan;
            } else {
                $localStorage['paymentPlan'] = undefined;
            }
        }
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcShippingType', {
    templateUrl: "themes/assets/js/common-components/shippingType.tpl.html",
    bindings: {
        isDropdown: '<',
        title: "@",
        subtitle: "@",
        pickupMethodCode: "@"
    },
    controller: ['$scope', '$localStorage', 'storefrontApp.mainContext', 'dialogService', function($scope, $localStorage, mainContext, dialogService) {
        var $ctrl = this;
        $ctrl.shipmentType = $localStorage['shipmentType'];
        if (!$ctrl.shipmentType) {
            $ctrl.shipmentType = 'shipping';
            $ctrl.isChanging = true;
        }
        $ctrl.shipmentAddress = $localStorage['shipmentAddress'];
        $ctrl.shipmentFulfillmentCenter = $localStorage['shipmentFulfillmentCenter'];
        $scope.$watch(
            function() { return mainContext.customer; },
            function (customer) {
                if (customer) {
                    $ctrl.customer = customer;
                    if (!$ctrl.shipmentAddress && $ctrl.customer.defaultShippingAddress) {
                        $ctrl.shipmentAddress = { postalCode: $ctrl.customer.defaultShippingAddress.postalCode };
                    }
                }
            }
        );
        $ctrl.selectFulfillmentCenter = function () {
            var modalInstance = dialogService.showDialog(null, 'universalDialogController', 'storefront.select-fulfillment-center-dialog.tpl');
            modalInstance.result.then(function(fulfillmentCenter) {
                $ctrl.shipmentFulfillmentCenter = fulfillmentCenter;
                if (!$ctrl.isDropdown) {
                    $ctrl.save();
                }
            });
        };
        $ctrl.save = function (isDefined) {
            if (isDefined !== false) {
                $localStorage['shipmentType'] = $ctrl.shipmentType;
                if ($ctrl.shipmentType === 'shipping') {
                    $localStorage['shipmentAddress'] = $ctrl.shipmentAddress;
                } else {
                    $localStorage['shipmentFulfillmentCenter'] = $ctrl.shipmentFulfillmentCenter;
                }
            }
        }
    }]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcTotals', {
    templateUrl: "themes/assets/js/common-components/totals.tpl.liquid",
	bindings: {
		order: '<'
	}
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutCoupon', {
	templateUrl: "themes/assets/js/checkout/checkout-coupon.tpl.liquid",
	bindings: {
		coupon: '=',
		onApplyCoupon: '&',
		onRemoveCoupon: '&'
	},
	controller: [function () {
		var ctrl = this;	
	}]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutEmail', {
	templateUrl: "themes/assets/js/checkout/checkout-email.tpl.html",
	require: {
		checkoutStep: '^vcCheckoutWizardStep'
	},
	bindings: {
		email: '='
	},
	controller: [function () {
		var ctrl = this;

		this.$onInit = function () {
			ctrl.checkoutStep.addComponent(this);
		};

		this.$onDestroy = function () {
			ctrl.checkoutStep.removeComponent(this);
		};
	
		ctrl.validate = function () {
			ctrl.form.$setSubmitted();
			return !ctrl.form.$invalid;
		}

	}]
});

var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcCheckoutShippingMethods', {
	templateUrl: "themes/assets/js/checkout/checkout-shippingMethods.tpl.liquid",
	require: {
		checkoutStep: '^vcCheckoutWizardStep'
	},
	bindings: {
		shipment: '=',
		getAvailShippingMethods: '&',
		onSelectShippingMethod: '&'
	},
	controller: [function () {

		var ctrl = this;
		
		ctrl.availShippingMethods = [];
		ctrl.selectedMethod = {};
		this.$onInit = function () {
			ctrl.checkoutStep.addComponent(this);
			ctrl.loading = true;
			ctrl.getAvailShippingMethods(ctrl.shipment).then(function (availMethods) {
				ctrl.availShippingMethods = availMethods;
				_.each(ctrl.availShippingMethods, function (x) {
					x.id = getMethodId(x);
				});
				ctrl.selectedMethod = _.find(ctrl.availShippingMethods, function (x) { return ctrl.shipment.shipmentMethodCode == x.shipmentMethodCode && ctrl.shipment.shipmentMethodOption == x.optionName });
				ctrl.loading = false;
			});
		};		
		
		this.$onDestroy = function () {
			ctrl.checkoutStep.removeComponent(this);
		};
			
		function getMethodId(method) {
			var retVal = method.shipmentMethodCode;
			if (method.optionName) {
				retVal += ':' + method.optionName;
			}
			return retVal;
		}

		ctrl.selectMethod = function (method) {
			ctrl.selectedMethod = method;
			ctrl.onSelectShippingMethod({ shippingMethod: method });
		};
	
		ctrl.validate = function () {
			ctrl.form.$setSubmitted();
			return !ctrl.form.$invalid;
		}
	}]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutWizardStep', {
    templateUrl: "themes/assets/js/checkout/checkout-wizard-step.tpl.html",
    transclude: true,
    require: {
        wizard: '^vcCheckoutWizard'
    },
    bindings: {
        name: '@',
        title: '@',
        stepDisabled: '=?',
        onNextStep: '&?',
        canEnter: '=?',
        final: '<?'
    },
    controller: [function () {
        var ctrl = this;
        ctrl.components = [];
        ctrl.canEnter = true;

        this.$onInit = function () {
            ctrl.wizard.addStep(this);
        };

        ctrl.addComponent = function (component) {
            ctrl.components.push(component);
        };
        ctrl.removeComponent = function (component) {
            ctrl.components = _.without(ctrl.components, component);
        };
        ctrl.validate = function () {
            return _.every(ctrl.components, function (x) { return typeof x.validate !== "function" || x.validate(); });
        }
    }]
});

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcCheckoutWizard', {
	transclude: true,
	templateUrl: 'themes/assets/js/checkout/checkout-wizard.tpl.html',
	bindings: {
		wizard: '=',
		loading: '=',
		onFinish: '&?',
		onInitialized: '&?'
	},
	controller: ['$scope', function ($scope) {
		var ctrl = this;
		ctrl.wizard = ctrl;
		ctrl.steps = [];	
		ctrl.goToStep = function (step) {
			if (angular.isString(step))
			{
				step = _.find(ctrl.steps, function (x) { return x.name == step; });
			}
			if (step && ctrl.currentStep != step && step.canEnter) {
				if (!step.final) {
					step.isActive = true;
					if (ctrl.currentStep) {
						ctrl.currentStep.isActive = false;
					}
					ctrl.currentStep = step;
				}
				else if (ctrl.onFinish)
				{
					ctrl.onFinish();
				}
			}
		};

		ctrl.nextStep = function () {
			if (!ctrl.currentStep.validate || ctrl.currentStep.validate()) {
				if (ctrl.currentStep.nextStep) {
					if (ctrl.currentStep.onNextStep) {
						//evaluate onNextStep function
						var promise = ctrl.currentStep.onNextStep();
						//For promise function need to delay going to next step
						if (promise && angular.isFunction(promise.then)) {
							promise.then(function () {
								ctrl.goToStep(ctrl.currentStep.nextStep);
							});
						}
						else
						{
							ctrl.goToStep(ctrl.currentStep.nextStep);
						}
					}
					else {
						ctrl.goToStep(ctrl.currentStep.nextStep);
					}
				}			
			}
		};

		ctrl.prevStep = function () {
			ctrl.goToStep(ctrl.currentStep.prevStep);
		};

		function rebuildStepsLinkedList(steps) {
			var nextStep = undefined;
			for (var i = steps.length; i-- > 0;) {
				steps[i].prevStep = undefined;
				steps[i].nextStep = undefined;
				if (nextStep && !steps[i].disabled) {
					nextStep.prevStep = steps[i]
				};				
				if (!steps[i].disabled) {
					steps[i].nextStep = nextStep;
					nextStep = steps[i];
				}
			}		
		};
		
		ctrl.addStep = function (step) {
			ctrl.steps.push(step);
			$scope.$watch(function () { return step.disabled; }, function () {
				rebuildStepsLinkedList(ctrl.steps);			
			});
			rebuildStepsLinkedList(ctrl.steps);
			if(!ctrl.currentStep)
			{
				ctrl.goToStep(step);
			}
			if (step.final && ctrl.onInitialized)
			{
				ctrl.onInitialized();
			}
		};

	}]
});

//Call this to register our module to main application
var moduleName = "storefront.checkout";

if (storefrontAppDependencies != undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['credit-cards', 'angular.filter'])
.controller('checkoutController', ['$rootScope', '$scope', '$window', 'cartService',
    function ($rootScope, $scope, $window, cartService) {
        $scope.checkout = {
            wizard: {},
            paymentMethod: {},
            shipment: {},
            payment: {},
            coupon: {},
            availCountries: [],
            loading: false,
            isValid: false
        };

        $scope.validateCheckout = function (checkout) {
            checkout.isValid = checkout.payment && checkout.payment.paymentGatewayCode;
            if (checkout.isValid && !checkout.billingAddressEqualsShipping) {
                checkout.isValid = angular.isObject(checkout.payment.billingAddress);
            }
            if (checkout.isValid && checkout.cart && checkout.cart.hasPhysicalProducts) {
                checkout.isValid = angular.isObject(checkout.shipment)
                                && checkout.shipment.shipmentMethodCode
                                && angular.isObject(checkout.shipment.deliveryAddress);
            }
        };

        $scope.reloadCart = function () {
            return cartService.getCart().then(function (response) {
                var cart = response.data;
                if (!cart || !cart.id) {
                    $scope.outerRedirect($scope.baseUrl + 'cart');
                }
                else {
                    $scope.checkout.cart = cart;
                    $scope.checkout.coupon = cart.coupon || $scope.checkout.coupon;
                    if ($scope.checkout.coupon.code && !$scope.checkout.coupon.appliedSuccessfully) {
                        $scope.checkout.coupon.errorCode = 'InvalidCouponCode';
                    }
                    if (cart.payments.length) {
                        $scope.checkout.payment = cart.payments[0];
                        $scope.checkout.paymentMethod.code = $scope.checkout.payment.paymentGatewayCode;
                    }
                    if (cart.shipments.length) {
                        $scope.checkout.shipment = cart.shipments[0];
                    }
                    $scope.checkout.billingAddressEqualsShipping = cart.hasPhysicalProducts && !angular.isObject($scope.checkout.payment.billingAddress);

                    $scope.checkout.canCartBeRecurring = $scope.customer.isRegisteredUser && _.all(cart.items, function (x) { return !x.isReccuring });
                    $scope.checkout.paymentPlan = cart.paymentPlan && _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: cart.paymentPlan.intervalCount, interval: cart.paymentPlan.interval }) ||
                                                                      _.findWhere($scope.checkout.availablePaymentPlans, { intervalCount: 1, interval: 'months' });
                }
                $scope.validateCheckout($scope.checkout);
                return cart;
            });
        };

        $scope.applyCoupon = function (coupon) {
            coupon.processing = true;
            cartService.addCoupon(coupon.code).then(function () {
                coupon.processing = false;
                $scope.reloadCart();
            }, function (response) {
                coupon.processing = false;
            });
        }

        $scope.removeCoupon = function (coupon) {
            coupon.processing = true;
            cartService.removeCoupon().then(function (response) {
                coupon.processing = false;
                $scope.checkout.coupon = {};
                $scope.reloadCart();
            }, function (response) {
                coupon.processing = false;
            });
        }

        $scope.selectPaymentMethod = function (paymentMethod) {
            angular.extend($scope.checkout.payment, paymentMethod);
            $scope.checkout.payment.paymentGatewayCode = paymentMethod.code;
            $scope.checkout.payment.amount = angular.copy($scope.checkout.cart.total);
            $scope.checkout.payment.amount.amount += paymentMethod.totalWithTax.amount;

            updatePayment($scope.checkout.payment);
        };

        function getAvailCountries() {
            //Load avail countries
            return cartService.getCountries().then(function (response) {
                return response.data;
            });
        };

        $scope.getCountryRegions = function (country) {
            return cartService.getCountryRegions(country.code3).then(function (response) {
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
                $scope.checkout.shipment.deliveryAddress.type = 'Shipping';
            };
            //Does not pass validation errors to API
            shipment.validationErrors = undefined;
            return wrapLoading(function () {
                return cartService.addOrUpdateShipment(shipment).then($scope.reloadCart);
            });
        };

        $scope.createOrder = function () {
            updatePayment($scope.checkout.payment).then(function () {
                $scope.checkout.loading = true;
                cartService.createOrder($scope.checkout.paymentMethod.card).then(function (response) {
                    var order = response.data.order;
                    var orderProcessingResult = response.data.orderProcessingResult;
                    var paymentMethod = response.data.paymentMethod;
                    handlePostPaymentResult(order, orderProcessingResult, paymentMethod);
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

            if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'preparedform' && orderProcessingResult.htmlForm) {
                $scope.outerRedirect($scope.baseUrl + 'cart/checkout/paymentform?orderNumber=' + order.number);
            } else if (paymentMethod.paymentMethodType && paymentMethod.paymentMethodType.toLowerCase() == 'redirection' && orderProcessingResult.redirectUrl) {
                $window.location.href = orderProcessingResult.redirectUrl;
            } else {
                if (!$scope.customer.isRegisteredUser) {
                    $scope.outerRedirect($scope.baseUrl + 'cart/thanks/' + order.number);
                } else {
                    $scope.outerRedirect($scope.baseUrl + 'account#/orders/' + order.number);
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
            });
        };

        getAvailCountries().then(function (countries) {
            $scope.checkout.availCountries = countries;
        });

    }]);

angular.module('storefrontApp')
.directive('vaPermission', ['authService', function (authService) {
    return {
        link: function (scope, element, attrs) {
            if (attrs.vaPermission) {
                var permissionValue = attrs.vaPermission.trim();

                //modelObject is a scope property of the parent/current scope
                scope.$watch(attrs.securityScopes, function (value) {
                    if (value) {
                        toggleVisibilityBasedOnPermission(value);
                    }
                });

                function toggleVisibilityBasedOnPermission(securityScopes) {
                    var hasPermission = authService.checkPermission(permissionValue, securityScopes);
                    if (hasPermission)
                        angular.element(element).show();
                    else
                        angular.element(element).hide();
                }

                toggleVisibilityBasedOnPermission();
                scope.$on('loginStatusChanged', toggleVisibilityBasedOnPermission);
            }
        }
    };
}]);
//# sourceMappingURL=checkout-scripts.js.map