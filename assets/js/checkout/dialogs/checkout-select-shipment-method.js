angular.module('storefrontApp')
.controller('selectShipmentMethodDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
    angular.extend($scope, dialogData);

    $scope.isActive = function(shipmentMethod) {
        return $scope.checkout.shipmentMethod.optionName === shipmentMethod.optionName;
    }

    $scope.activate = function(shipmentMethod) {
        $scope.checkout.shipmentMethod = shipmentMethod;
    }

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    }

}]);