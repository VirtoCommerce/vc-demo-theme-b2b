var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcRelatedProducts', {
    templateUrl: "themes/assets/js/common-components/relatedProducts.tpl.html",
    bindings: {
        productIds: '<'
    },
    controller: ['$timeout', '$scope', 'loadingIndicatorService', 'recommendationService', function ($timeout, $scope, loader, recommendationService) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.initCarousel = function (itemsLength) {
            $timeout(function () {
                $scope.$carousel = $(".owl-carousel");
                $scope.$carousel.owlCarousel({
                    nav: false,
                    dots: false,
                    responsive:{
                        0:{
                            items: 2,
                            loop: itemsLength > 2
                        },
                        768:{
                            items: 3,
                            loop: itemsLength > 3
                        },
                        992:{
                            items: 4,
                            loop: itemsLength > 4
                        }
                    }
                });
            });
        }

        $ctrl.$onChanges = function() {
            loader.wrapLoading(function() {
                return recommendationService.getRecommendedProducts({ provider: 'DynamicAssociations', productIds: $ctrl.productIds }).then(
                    function(response) {
                        var products = response.data;
                        if (products.length) {
                            $ctrl.products = products;
                            $ctrl.initCarousel(products.length);
                        }
                    });
            });
        }

        $ctrl.next = function () {
            $scope.$carousel.trigger('next.owl.carousel');
        }

        $ctrl.prev = function () {
            $scope.$carousel.trigger('prev.owl.carousel');
        }
    }]
});
