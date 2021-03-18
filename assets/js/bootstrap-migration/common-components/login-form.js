var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('loginFormController', ['$scope', 'multiAccountService', 'storefrontApp.mainContext', function($scope, multiAccountService, mainContext) {
    if (!mainContext.customer.isRegisteredUser) {
        $scope.username = multiAccountService.getLastUsedUserName();
    }
}]);
