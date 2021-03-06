var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('configurableProductCardController', ['$scope', 'catalogService', '$filter', 'storeCurrency', 'pricingService',
    function ($scope, catalogService, $filter, storeCurrency, pricingService) {
        $scope.isProductUnavailable = false;

        $scope.getDefaultPrice = function() {
            return $filter('currency')($scope.defaultPrice, storeCurrency.symbol);
        }

        $scope.initProductConfiguration = function(productId) {
            catalogService.getProduct([productId]).then(response => {
              let defaultPartsTotalsObject = [];
              $scope.productParts = response.data[0].parts;

              if ($scope.productParts.length) {
                _.each($scope.productParts, part => {
                  if (!part.items || !part.items.length) {
                    $scope.isProductUnavailable = true;
                    return;
                  }
                  defaultPartsTotalsObject.push({id: part.items.find(x => x.id === part.selectedItemId).id, quantity: 1});
                });

                if (!$scope.isProductUnavailable) {
                  pricingService.getProductsTotal(defaultPartsTotalsObject).then(result => {
                    $scope.defaultPrice = $scope.showPricesWithTaxes ? result.data.totalWithTax.amount : result.data.total.amount;
                  });
                } else {
                  $scope.defaultPrice = 0;
                }

              } else {
                $scope.defaultPrice = 0;
              }

          });
        }

    }]);
