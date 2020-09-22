angular.module('storefrontApp')
    .component('productCompareListBar', {
        templateUrl: "themes/assets/js/product-compare/product-compare-list-bar.tpl.html",
        controller: ['compareProductService', 'catalogService', '$scope', '$rootScope', '$location', 'baseUrl',
            function(compareProductService, catalogService, $scope, $rootScope, $location, baseUrl) {
                var $ctrl = this;
                $ctrl.showedBody = true;
                $ctrl.products = [];
                $ctrl.showBodyText = "Hide";
                $ctrl.showBodyIcon = "fa fa-angle-down";
                $scope.baseUrl = baseUrl;
                $scope.regex = new RegExp(/^\/+/);
                function canShowBar() {
                    var path = $location.absUrl();
                    if (path.indexOf("/compare") !== -1) {
                        return false;
                    }
                    return true;
                }

                $ctrl.showBar = canShowBar();

                function initialize() {
                    if (!$ctrl.showBar) return;
                    var productsIds = compareProductService.getProductsIds();
                    if (!_.isEmpty(productsIds)) {
                        catalogService.getProducts(productsIds).then(function(response) {
                            $ctrl.products = response.data;
                        });
                    };
                }

                $ctrl.$onInit = function() {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                }

                $scope.$on('productCompareListChanged', function(event, data) {
                    $ctrl.itemsCount = compareProductService.getProductsCount();
                    initialize();
                });

                $ctrl.clearCompareList = function () {
                    compareProductService.clearCompareList();
                    $ctrl.products = [];
                    $rootScope.$broadcast('productCompareListChanged');
                    $rootScope.$broadcast('productCompareListCleared');
                }

                $ctrl.showBody = function () {
                    $ctrl.showedBody = !$ctrl.showedBody;
                    if ($ctrl.showedBody) {
                        $ctrl.showBodyText = "Hide";
                        $ctrl.showBodyIcon = "fa fa-angle-down";
                    }
                    else {
                        $ctrl.showBodyText = "Show";
                        $ctrl.showBodyIcon = "fa fa-angle-up";
                    }
                }

                $ctrl.removeProduct = function (product) {
                    compareProductService.removeProduct(product.id)
                    $ctrl.products = _.without($ctrl.products, product);
                    $rootScope.$broadcast('productCompareListChanged');
                    $rootScope.$broadcast('productRemovedFromCompareList', product.id);
                }
            }]
    });
