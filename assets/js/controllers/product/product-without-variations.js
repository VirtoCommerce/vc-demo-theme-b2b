var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productWithoutVariationsController', ['$scope', '$window', 'catalogService', 'availabilityService',
    function ($scope, $window, catalogService, availabilityService) {

        function initialize() {
            var product = $window.product;
            if (!product) {
                return;
            }
            catalogService.getProduct([product.id]).then(function (response) {
                product = response.data[0];
                $scope.selectedVariation = product;

                return availabilityService.getProductsAvailability([product.id]).then(function(res) {
                    $scope.availability = _.object(_.pluck(res.data, 'productId'), res.data);
                });
            });
        }

        initialize();
    }]);
