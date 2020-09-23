﻿angular.module('storefront.account')
    .component('vcAccountLists',
        {
            templateUrl: "lists-manager.tpl",
            controller: [
                'listsApi', '$rootScope', 'cartService', '$translate', 'loadingIndicatorService', '$timeout',
                function (listsApi, $rootScope, cartService, $translate, loader, $timeout) {
                    var $ctrl = this;

                    $ctrl.loader = loader;
                    $ctrl.selectedList = {};
                    $ctrl.errors = null;

                    $ctrl.selectTab = function (tabName) {
                        $ctrl.selectedList = {};
                        $ctrl.selectedTab = tabName;
                    };

                    $ctrl.selectList = function (list) {
                        $ctrl.errors = null;
                        $ctrl.selectedList = list;
                        loader.wrapLoading(function () {
                            return listsApi.getWishlist(list.name, list.type).then(function (response) {
                                $ctrl.selectedList.items = response.data.items;
                            });
                        });
                    };

                    $ctrl.removeLineItem = function (lineItem, list) {
                        loader.wrapLoading(function () {
                            return listsApi.removeLineItem(lineItem.id, list.name, list.type).then(function (response) {
                                $ctrl.selectList(list);
                            });
                        });
                    };

                    $ctrl.addToCart = function (lineItem) {
                        loader.wrapLoading(function () {
                            return cartService.addLineItem(lineItem.productId, 1).then(function (response) {
                                lineItem.productAdded = true;
                                $timeout(function () { lineItem.productAdded = false; }, 10000);
                                $rootScope.$broadcast('cartItemsChanged');
                            });
                        });
                    }


                }]
        })
    .component('vcAccountMyLists',
        {
            templateUrl: 'themes/assets/js/account/account-lists.tpl.liquid',
            require: {
                accountLists: '^^vcAccountLists'
            },
            controller: [
                '$rootScope', 'listsApi', 'customerService', 'loadingIndicatorService', '$q', 'dialogService', function ($rootScope, listsApi, customerService, loader, $q, dialogService) {

                    var $ctrl = this;

                    $ctrl.type = null;
                    $ctrl.predefinedLists = [];

                    $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5, numPages: 4 };

                    $ctrl.pageSettings.pageChanged = function () {
                        $ctrl._searchLists();
                    };

                    $ctrl._searchLists = function () {
                        $ctrl.accountLists.errors = null;
                        loader.wrapLoading(function () {
                            return listsApi.searchLists({
                                pageNumber: $ctrl.pageSettings.currentPage,
                                pageSize: $ctrl.pageSettings.itemsPerPageCount,
                                type: $ctrl.type
                            }).then(function (response) {
                                $ctrl.accountLists.lists = response.data.results;
                                $ctrl.pageSettings.totalItems = response.data.totalCount;

                                $ctrl.accountLists.selectedList = _.first(response.data.results);
                            });
                        });
                    };

                    $ctrl.initialize = function (lists) {
                        $ctrl.predefinedLists = lists.default_lists;
                        $ctrl.type = lists.default_list_type;

                        var promises = [];
                        _.each($ctrl.predefinedLists, function (list) {
                            promises.push(createList(list.name, list.type));
                        });

                        $q.all(promises).then(function () {
                            $ctrl._searchLists();
                        });
                    };

                    $ctrl.$onInit = function () {
                        $ctrl.accountLists.selectTab('myLists');
                    }

                    $ctrl.createList = function () {
                        var dialogData = {
                            lists: $ctrl.lists,
                            type: $ctrl.type
                        }
                        var dialogInstance = dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.lists-create-new-list-dialog.tpl');

                        dialogInstance.result.then(function (result) {
                            if (!result)
                                return;

                            if (result.error) {
                                $ctrl.accountLists.errors = [result.error];
                            } else {
                                $ctrl.pageSettings.currentPage = 1;
                                $ctrl._searchLists();
                            }
                        });
                    };

                    $ctrl.canBeAddedToCart = function (lineItem) {
                         return lineItem.product.isBuyable && lineItem.product.isInStock;
                    }

                    $ctrl.addToCartAllProductsEnabled = function () {
                        var result = $ctrl.accountLists.selectedList.items.some(function (item) {
                            return  $ctrl.canBeAddedToCart(item);
                        });

                        return result;
                    }


                    $ctrl.addToCartAllProducts = function (listName) {
                        loader.wrapLoading(function () {
                            return listsApi.mergeWithCurrentCart(listName, $ctrl.type).then(function (response) {
                                $rootScope.$broadcast('cartItemsChanged');
                            });
                        });
                    }

                    $ctrl.listSettings = function () {
                        loader.wrapLoading(function () {
                            return listsApi.searchLists({
                                pageSize: 10000,
                                type: $ctrl.type
                            }).then(function (response) {
                                var dialogData = {
                                    lists: response.data.results,
                                    predefinedLists: $ctrl.predefinedLists,
                                    type: $ctrl.type
                                }
                                var dialogInstance = dialogService.showDialog(dialogData, 'recentlyCreateNewListDialogController', 'storefront.lists-settings-dialog.tpl');

                                dialogInstance.result.then(function (result) {
                                    $ctrl.pageSettings.currentPage = 1;
                                    $ctrl._searchLists();
                                });
                            });
                        });


                    };

                    function createList(listName, type) {
                        return listsApi.createList(listName, type);
                    }
                }
            ]
        });
