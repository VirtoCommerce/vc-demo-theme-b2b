angular.module('storefrontApp')
    .controller('recentlyAddedCartItemDialogController', ['$rootScope', '$scope', '$window', '$uibModalInstance', 'mailingService', 'dialogData', 'baseUrl', 'cartService', 'roundHelper', '$filter', 'storeCurrency', function ($rootScope, $scope, $window, $uibModalInstance, mailingService, dialogData, baseUrl, cartService, roundHelper, $filter, storeCurrency) {
      $scope.dialogData = dialogData || {};
      $scope.baseUrl = baseUrl;
      $scope.regex = new RegExp(/^\/+/);

      $scope.close = function() {
          $uibModalInstance.dismiss('cancel');
      }

      $scope.addToCart = function() {
          $scope.dialogData.inventoryError = false;
          if ($scope.dialogData && $scope.dialogData.items && $scope.dialogData.items.length === 1) {
              cartService.addLineItem($scope.dialogData.items[0].id, $scope.dialogData.items[0].quantity).then(() => {
                  $rootScope.$broadcast('cartItemsChanged');
              });
          } else if ($scope.dialogData.configuredProductId) {
              let items = $scope.dialogData.items.map(item => {
                  return { id: item.id, quantity: $scope.configurationQty, configuredProductId: item.configuredProductId };
              });
              cartService.addLineItems(items).then(response => {
                  let result = response.data;
                  if (result.isSuccess) {
                      $rootScope.$broadcast('cartItemsChanged');
                  }
              });
          } else {
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

      $scope.setInitQuantity = function(item) {
          if (item.inventoryError) {
              return item.availableQuantity;
          } else {
              return item.quantity;
          }
      }

      $scope.getConfirmationTitle = function() {
          if ($scope.dialogData && $scope.dialogData.items && $scope.dialogData.items.length === 1) {
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

      $scope.send = function(email) {
          mailingService.sendProduct(dialogData.productId, { email: email, storeId: dialogData.storeId, productUrl: dialogData.productUrl, language: dialogData.language });
          $uibModalInstance.close();
      }

      function getMaxInventory() {
          var inventoryArray = $scope.dialogData.items.map(item => {
              return item.availableQuantity;
          });
          $scope.maxConfigurationQty = Math.min(...inventoryArray);
          $scope.configurationQty = $scope.maxConfigurationQty;
      }

      function initialize() {
          if ($scope.dialogData.inventoryError && $scope.dialogData.configuredProductId) {
              getMaxInventory();
          } else if (!$scope.dialogData.inventoryError && $scope.dialogData.configuredProductId) {
              $scope.configurationQty = $scope.dialogData.configurationQty;
          }
      }

      initialize();

    }]);
