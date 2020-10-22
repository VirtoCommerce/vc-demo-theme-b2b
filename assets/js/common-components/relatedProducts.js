var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcRelatedProducts', {
    templateUrl: "themes/assets/js/common-components/relatedProducts.tpl.html",
    bindings: {
        productIds: '<',
        responsive: '<',
        onUpdate: '&'
    },
    controller: ['$timeout', '$scope', '$element', 'loadingIndicatorService', 'recommendationService', function ($timeout, $scope, $element, loader, recommendationService) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.products = [];

        $ctrl.initCarousel = function () {
            var responsive = Object.assign($ctrl.responsive);
            Object.keys(responsive).map((key) => responsive[key].loop = responsive[key].items < $ctrl.products.length);
            $timeout(function () {
                $scope.$carousel = $element.find(".owl-carousel");
                $scope.$carousel.on('initialized.owl.carousel refreshed.owl.carousel', function (event) {
                    $scope.data = event;
                    $ctrl.onUpdate({ $event: event });
                });
                $scope.$carousel.owlCarousel({
                    nav: false,
                    dots: false,
                    responsive: responsive
                });
                // Temporary workaround for fallback-src:
                // Owl carousel will copy first and last item for infinity loop.
                // It will copy ready html code and angular will not work on it.
                // For some reason, fallback-src works AFTER timout, while it should before.
            }, 1000);
        }

        $ctrl.$onChanges = function() {
            loader.wrapLoading(function() {
                return recommendationService.getRecommendedProducts({ provider: 'DynamicAssociations', productIds: $ctrl.productIds }).then(
                    function(response) {
                        var products = response.data;
                        if (products.length) {
                            $ctrl.products = products;
                            $ctrl.initCarousel();
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
