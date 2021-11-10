var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        order: '<',
        hideReorder: '<'
    },
    controller: ['$scope', 'baseUrl', function ($scope, baseUrl) {
        var $ctrl = this;
        $scope.baseUrl = baseUrl;
        $scope.regex = new RegExp(/^\/+/);

        $ctrl.addProductToCart = function (productId, quantity) {
            $scope.$emit('lineItemAdded', {productId, quantity});
        }

        $ctrl.addConfigurationToCart = function (configuration) {
            $scope.$emit('configurationAdded', {configuration});
        }

        $ctrl.getToggleTitle = function (group) {
            return group.showConfiguration === false ? 'Show configuration' : 'Hide configuration';
        };

        $ctrl.toggleConfiguration = function(group) {
            group.showConfiguration = !group.showConfiguration;
        };

        $ctrl.getProductLink = function(productId) {
            return `${$scope.baseUrl}product/${productId}`;
        };

        $ctrl.$onChanges = function (params) {
            getConfiguredLineItems($ctrl.order.configuredGroups);
        };

        function getConfiguredLineItems(groups) {
            _.each(groups, group => {
                angular.extend(group, { showConfiguration: false });
            });
        }

        getConfiguredLineItems($ctrl.order.configuredGroups);

    }]
});
