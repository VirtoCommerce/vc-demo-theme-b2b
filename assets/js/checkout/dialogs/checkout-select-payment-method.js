angular.module('storefrontApp')
.controller('selectPaymentMethodDialogController', ['$scope', 'authService', '$uibModalInstance', 'dialogData', 'iconUrlService', 'creditCardPaymentMethodCode', 'purchasingAgentRole',
            function ($scope, authService, $uibModalInstance, dialogData, iconUrlService, creditCardPaymentMethodCode, purchasingAgentRole) {
    angular.extend($scope, dialogData);

    $scope.creditCardEditorVisibility = null;

    $scope.isActive = function(paymentMethod) {
        return $scope.checkout.paymentMethod.code === paymentMethod.code
    }

    $scope.activate = function(paymentMethod) {
        $scope.checkout.paymentMethod = paymentMethod;
        if(paymentMethod.code === creditCardPaymentMethodCode && $scope.creditCardEditorVisibility === null) {
            $scope.creditCardEditorVisibility = true;
        } else {
            $scope.creditCardEditorVisibility = false;
        }
    }

    $scope.editEnabled = function(paymentMethod) {
        return paymentMethod.code === creditCardPaymentMethodCode;
    }

    $scope.edit = function(paymentMethod) {
        if(paymentMethod.code === creditCardPaymentMethodCode) {
            $scope.creditCardEditorVisibility = !$scope.creditCardEditorVisibility;
        }
    }

    $scope.isAvailable = function(paymentMethod) {
        var result = true;

        if(paymentMethod.code === creditCardPaymentMethodCode) {
            result = authService.canByRole(purchasingAgentRole);
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

    $scope.getPaymentIconUrl = function(paymentMethod) {
        var iconUrl = iconUrlService.getPaymentMethodIconUrl(paymentMethod.code);
        return iconUrl;
    };


}]);
