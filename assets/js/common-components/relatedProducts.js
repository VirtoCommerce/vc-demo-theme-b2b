vcRelatedProductsController.$inject = ['baseUrl', '$timeout', '$element', 'loadingIndicatorService', 'recommendationService'];
function vcRelatedProductsController(baseUrl, $timeout, $element, loader, recommendationService) {
    var $ctrl = this;
        $ctrl.ready = false;
        $ctrl.loader = loader;
        $ctrl.baseUrl = baseUrl;
        $ctrl.products = [];
        $ctrl.imageSize = $ctrl.imageSize || 'lg';

        $ctrl.initCarousel = function () {
            var responsive = Object.assign($ctrl.responsive);
            Object.keys(responsive).map((key) => responsive[key].loop = responsive[key].items < $ctrl.products.length);
            $timeout(function () {
                $ctrl.$carousel = $element.find(".owl-carousel");
                $ctrl.$carousel.on('initialized.owl.carousel refreshed.owl.carousel', function (event) {
                    $ctrl.data = event;
                    $ctrl.onUpdate({ $event: event });
                });
                $ctrl.$carousel.on('refreshed.owl.carousel', function () {
                    $ctrl.ready = true;
                });
                $ctrl.$carousel.owlCarousel({
                    nav: false,
                    dots: false,
                    lazyLoad: true,
                    lazyLoadEager: $ctrl.products.length,
                    responsive: responsive
                });
                // Temporary workaround for fallback-src:
                // Owl carousel will copy first and last item for infinity loop.
                // It will copy ready html code and angular will not work on it.
                // For some reason, fallback-src works AFTER timeout, while it should before.
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
            $ctrl.$carousel.trigger('next.owl.carousel');
        }

        $ctrl.prev = function () {
            $ctrl.$carousel.trigger('prev.owl.carousel');
        }

        $ctrl.getUrl = function(relative) {
            return new URL(relative.replace(/^\/+/, ''), baseUrl).href;
        }
}

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcRelatedProducts', {
  templateUrl: "themes/assets/js/common-components/relatedProducts.tpl.html",
  bindings: {
    productIds: '<',
    responsive: '<',
    imageSize: '@',
    onUpdate: '&'
  },
  controller: vcRelatedProductsController
});

storefrontApp.component('vcRelatedProductsMigration', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/relatedProducts.tpl.html",
    bindings: {
      productIds: '<',
      responsive: '<',
      imageSize: '@',
      onUpdate: '&'
    },
    controller: vcRelatedProductsController
  });
