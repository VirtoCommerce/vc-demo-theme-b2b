angular.module("storefrontApp")
    .controller("sendProductToEmailController", [
        "$scope",
        "$uibModalInstance",
        "mailingService",
        "dialogData",
        function ($scope, $uibModalInstance, mailingService, dialogData) {
            $scope.dialogData = dialogData || {};

            $scope.close = function () {
                $uibModalInstance.dismiss("cancel");
            };

            $scope.send = function (email) {
                mailingService.sendProduct(dialogData.productId, {
                    email: email,
                    storeId: dialogData.storeId,
                    productUrl: dialogData.productUrl,
                    language: dialogData.language,
                });
                $uibModalInstance.close();
            };

            function initialize() {
                if (
                    !$scope.dialogData.productId ||
                    !$scope.dialogData.storeId ||
                    !$scope.dialogData.productUrl ||
                    !$scope.dialogData.language
                ) {
                    throw new Error("Initial dialog data is invalid");
                }
            }

            initialize();
        },
]);
