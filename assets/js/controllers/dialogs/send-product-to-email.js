angular.module("storefrontApp").controller("sendProductToEmailController", [
    "$scope",
    "$uibModalInstance",
    "dialogData",
    function ($scope, $uibModalInstance, dialogData) {
        $scope.dialogData = dialogData || {};

        $scope.close = function () {
            $uibModalInstance.dismiss("cancel");
        };

        $scope.send = function () {
            $uibModalInstance.close();
        };

        function initialize() {
            if (!$scope.dialogData) {
                throw new Error("Initial dialog data is invalid");
            }
        }

        initialize();
    }
]);
