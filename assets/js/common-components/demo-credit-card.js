var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('demoCreditCard', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/demo-credit-card.tpl.html",
    bindings: {
        onCancel: '&',
    },
    controller: ['$scope', function ($scope) {

        var ctrl = this;

        $scope.close = function() {
            ctrl.onCancel();
        }

    }]
});
