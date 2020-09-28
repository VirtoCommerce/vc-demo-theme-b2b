var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('productConfigurationController', ['$scope', '$window', 'loadingIndicatorService', 'dialogService', 'catalogService', function ($scope, $window, loader, dialogService, catalogService) {
    $scope.loader = loader;

    $scope.changeGroupItem = function (productPart) {
        var dialogInstance = dialogService.showDialog(productPart, 'changeConfigurationGroupItemDialogController', 'storefront.select-configuration-item-dialog.tpl');
        dialogInstance.result.then(function (id) {
            const foundIndex = $scope.productParts.findIndex(x => x.name == productPart.name);
            $scope.productParts[foundIndex].selectedItemId = id;
        });
    };

    $scope.getSelectedItem = function(configPart) {
        const item = configPart.items.find(x => x.id == configPart.selectedItemId);
        return item.name;
    }

    function initialize() {
        var product = $window.product;
            if (!product || !product.id) {
                return;
            }
            catalogService.getProductConfiguration(product.id).then(function(response) {
                $scope.productParts = response.data;
            });
    }

    initialize();

}]);

storefrontApp.controller('changeConfigurationGroupItemDialogController', ['$scope', '$window', '$uibModalInstance', 'dialogData', function ($scope, $window, $uibModalInstance, dialogData) {
    $scope.dialogData = dialogData;
    $scope.selectedId = dialogData.selectedItemId;

    $scope.close = function() {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.getModalTitel = function() {
        return `Choose ${$scope.dialogData.name}`
    }

    $scope.handleRadioClick = function(id) {
        $scope.selectedId = id;
    }

    $scope.save = function(id) {
        console.log($scope.selectedId);
        $uibModalInstance.close(id);
    }
}]);
