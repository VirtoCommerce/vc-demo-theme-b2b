angular.module('storefrontApp')
.controller('selectShipmentMethodDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
    angular.extend($scope, dialogData);
    $scope.oldShippingMethod = $scope.checkout.shipmentMethod;

    $scope.isActive = function(shipmentMethod) {
        return $scope.checkout.shipmentMethod.optionName === shipmentMethod.optionName;
    }

    $scope.activate = function(shipmentMethod) {
        $scope.checkout.shipmentMethod = shipmentMethod;
    }

    $scope.getTotal = function (shippingMethod) {
        return shippingMethod.price.amount === 0 ? 'Free' : shippingMethod.price.formattedAmount;
    }

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $scope.activate($scope.oldShippingMethod);
            $uibModalInstance.dismiss('cancel');
        }
    }

}]);
