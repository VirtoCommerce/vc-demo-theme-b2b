angular.module('storefrontApp')
.controller('selectPaymentMethodDialogController', ['$scope', 'authService', '$uibModalInstance', 'dialogData', function ($scope, authService, $uibModalInstance, dialogData) {
    angular.extend($scope, dialogData);
    const CREDIT_CARD_METHOD_CODE = "DemoCreditCardPaymentMethod";
    const PURCHASING_AGENT_ROLE = "purchasing-agent";

    $scope.creditCardEditorVisibility = null;

    $scope.isActive = function(paymentMethod) {
        return $scope.checkout.paymentMethod.code == paymentMethod.code
    }

    $scope.activate = function(paymentMethod) {
        $scope.checkout.paymentMethod = paymentMethod;
        if(paymentMethod.code === CREDIT_CARD_METHOD_CODE && $scope.creditCardEditorVisibility === null) {
            $scope.creditCardEditorVisibility = true;
        } else {
            $scope.creditCardEditorVisibility = false;
        }
    }

    $scope.editEnabled = function(paymentMethod) {
        return paymentMethod.code === CREDIT_CARD_METHOD_CODE;
    }

    $scope.edit = function(paymentMethod) {
        if(paymentMethod.code === CREDIT_CARD_METHOD_CODE) {
            $scope.creditCardEditorVisibility = !$scope.creditCardEditorVisibility;
        }
    }

    $scope.isAvailable = function(paymentMethod) {
        var result = true;

        if(paymentMethod.code === CREDIT_CARD_METHOD_CODE) {
            result = authService.canByRole(PURCHASING_AGENT_ROLE);
        }

        return result;
    }

    $scope.hideCreditCardEditor = function() {
        $scope.creditCardEditorVisibility = false;
    }

    $scope.close = function (result) {
        if (result) {
            $uibModalInstance.close(result);
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    }

}]);
