var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('demoCreditCard', {
    templateUrl: "themes/assets/js/common-components/demo-credit-card.tpl.html",
    bindings: {
        onSelectMethod: '&',
    },
    controller: ['$scope', function ($scope) {

        var ctrl = this;

        $scope.close = function() {
            ctrl.onSelectMethod();
        }

    }]
});
