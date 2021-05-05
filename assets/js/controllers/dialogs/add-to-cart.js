angular.module('storefrontApp')
    .controller('recentlyAddedCartItemDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'dialogData', 'baseUrl', 'cartService', 'roundHelper', '$filter', 'storeCurrency', function ($rootScope, $scope, $window, $uibModalInstance, dialogData, baseUrl, cartService, roundHelper, $filter, storeCurrency) {
      $scope.dialogData = dialogData || {};
      $scope.baseUrl = baseUrl;
      $scope.regex = new RegExp(/^\/+/);

      $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
      }

      const dialogBehaviorType = {oneItem: 0, manyItems: 1, configured: 2}

      let dialogBehavior = 0;

      $scope.addToCart = function() {
          $scope.dialogData.inventoryError = false;
          if (dialogBehavior === dialogBehaviorType.oneItem) {
              const product = $scope.dialogData.items[0];
              cartService.addLineItem(product.id, product.quantity).then(() => {
                  $rootScope.$broadcast('cartItemsChanged');
              });
          } else if (dialogBehavior === dialogBehaviorType.configured) {
              let items = $scope.dialogData.items.map(item => {
                  return { id: item.id, quantity: $scope.configurationQty, configuredProductId: item.configuredProductId };
              });
              cartService.addLineItems(items).then(response => {
                  let result = response.data;
                  if (result.isSuccess) {
                      $rootScope.$broadcast('cartItemsChanged');
                  }
              });
          } else { //many items
              let items = $scope.dialogData.items.map(item => {
                  return { id: item.id, quantity: item.quantity };
              });
              cartService.addLineItems(items).then(response => {
                  let result = response.data;
                  if (result.isSuccess) {
                      $rootScope.$broadcast('cartItemsChanged');
                  }
              });
          }
      }

      $scope.calculateTotal = function(itemPrice, itemQuantity) {
          var total = roundHelper.bankersRound(itemPrice * itemQuantity);
          return $filter('currency')(total, storeCurrency.symbol);
      }

      $scope.setInitItemQuantity = function(item) {
          if (item.inventoryError) {
            item.quantity = item.availableQuantity;
          } else {
            item.quantity = +item.quantity;
          }
      }

      $scope.getConfirmationTitle = function() {
          if (dialogBehavior === dialogBehaviorType.oneItem) {
              return '1 item was added to cart';
          } else {
              return `${$scope.dialogData.items.length} items were added to cart`;
          }
      }

      $scope.quantityChanged = function(qty) {
          $scope.configurationQty = qty;
      }

      $scope.redirect = function (url) {
          $window.location.href = url;
      }

      function getMaxInventory() {
          var inventoryArray = $scope.dialogData.items.map(item => {
              return item.availableQuantity;
          });
          $scope.maxConfigurationQty = Math.min(...inventoryArray);
          return $scope.maxConfigurationQty;
      }

      function initialize() {
        if ( !$scope.dialogData || !$scope.dialogData.items || $scope.dialogData.items.length < 1 ) {
            throw new Error('Initial dialog data is invalid');
        }

        if ($scope.dialogData.configuredProductId) {
            dialogBehavior = dialogBehaviorType.configured;
        } else if ($scope.dialogData.items.length > 1) {
            dialogBehavior = dialogBehaviorType.manyItems;
        } else {
            dialogBehavior = dialogBehaviorType.oneItem;
        }

        if (dialogBehavior === dialogBehaviorType.configured) {
            $scope.configurationQty = $scope.dialogData.inventoryError ? getMaxInventory() : $scope.dialogData.configurationQty;
        }

      }

      initialize();

    }]);
