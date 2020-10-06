var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        items: '='
    },
    controller: ['$scope', function ($scope) {

        $scope.addProductToCart = function (productId, quantity) {
            $scope.$emit('lineItemAdded', {productId, quantity});
        }

    }]
});
