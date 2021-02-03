var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('configurableProductCardController', ['$scope', 'catalogService', '$filter', 'storeCurrency', 'pricingService',
    function ($scope, catalogService, $filter, storeCurrency, pricingService) {

        $scope.getDefaultPrice = function() {
            return $filter('currency')($scope.defaultPrice, storeCurrency.symbol);
        }

        $scope.initProductConfiguration = function(productId) {
            catalogService.getProduct([productId]).then(response => {
              let defaultPartsTotalsObject = [];
              $scope.productParts = response.data[0].parts;
              _.each($scope.productParts, part => {
                  defaultPartsTotalsObject.push({id: part.items.find(x => x.id === part.selectedItemId).id, quantity: 1});
              });
              pricingService.getProductsTotal(defaultPartsTotalsObject).then(result => {
                $scope.defaultPrice = $scope.showPricesWithTaxes ? result.data.totalWithTax.amount : result.data.total.amount;
              });
          });
        }

    }]);
