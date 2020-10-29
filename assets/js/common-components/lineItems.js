var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLineItems', {
    templateUrl: "themes/assets/js/common-components/lineItems.tpl.liquid",
    bindings: {
        order: '='
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
            return `product/${productId}`.replace($scope.regex, $scope.baseUrl);
        };

        function getConfiguredLineItems(groups) {
            _.each(groups, group => {
                angular.extend(group, { showConfiguration: false });
                _.each(group.parts, part => {
                    part.items = [group.items.find(x => x.id === part.selectedItemId)];
                });
            });
        }

        getConfiguredLineItems($ctrl.order.configuredGroups);

    }]
});
