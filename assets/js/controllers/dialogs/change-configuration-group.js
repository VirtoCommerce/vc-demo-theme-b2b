angular.module('storefrontApp')
    .controller('changeConfigurationGroupItemDialogController', ['$scope', '$uibModalInstance', 'dialogData', function ($scope, $uibModalInstance, dialogData) {
      $scope.dialogData = dialogData || {};
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
          $uibModalInstance.close(id);
      }
    }]);
