var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('configurableProductCardController', ['$scope', 'catalogService', '$filter', 'roundHelper', 'storeCurrency',
    function ($scope, catalogService, $filter, roundHelper, storeCurrency) {

        $scope.getDefaultPrice = function() {
            return $filter('currency')($scope.defaultPrice, storeCurrency.symbol);
        }

        $scope.initProductConfiguration = function(productId) {
            catalogService.getProductConfiguration(productId).then(function(response) {
                $scope.productParts = response.data;
                $scope.defaultProductParts = [];
                _.each($scope.productParts, function (part) {
                    $scope.defaultProductParts.push(part.items.find(x => x.id === part.selectedItemId));
                });

                $scope.defaultPrice = roundHelper.bankersRound($scope.defaultProductParts.reduce((prev, cur) => prev + cur.price.actualPrice.amount, 0));
            });
        }

    }]);
