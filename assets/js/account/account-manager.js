angular.module('storefront.account')
    .component('vcAccountManager', {
        templateUrl: "themes/assets/js/account/account-manager.tpl",
        bindings: {
            baseUrl: '<',
            customer: '<'
        },
        controller: ['$scope', '$timeout', 'storefrontApp.mainContext', 'loadingIndicatorService', 'commonService', function ($scope, $timeout, mainContext, loader, commonService) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.availCountries = [];
            loader.wrapLoading(function () {
                return commonService.getCountries().then(function (response) {
                    $ctrl.availCountries = response.data;
                });
            });

            $ctrl.getCountryRegions = function (country) {
                return loader.wrapLoading(function () {
                    return commonService.getCountryRegions(country.code3).then(function (response) { return response.data; });
                });
            };
        }]
    });
