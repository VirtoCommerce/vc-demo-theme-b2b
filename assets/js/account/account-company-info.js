﻿angular.module('storefront.account')
.component('vcAccountCompanyInfo', {
    templateUrl: "themes/assets/account-company-info.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['storefrontApp.mainContext', '$scope', '$translate', 'accountApi', 'loadingIndicatorService', 'confirmService', function (mainContext, $scope, $translate, accountApi, loader, confirmService) {
        var $ctrl = this;
        $ctrl.loader = loader;

        function refresh() {
            loader.wrapLoading(function () {
                return accountApi.getUserOrganization().then(function (response) {
                    $ctrl.company = response.data;
                });
            });
        }

        $ctrl.updateCompanyInfo = function (company) {
            return loader.wrapLoading(function () {
                return accountApi.updateUserOrganization(company).then(function () { refresh(); });
            });
        };

        $ctrl.addNewAddress = function () {
            if (_.last(components).validate()) {
                $ctrl.company.addresses.push($ctrl.newAddress);
                $ctrl.newAddress = null;
                $ctrl.updateCompanyInfo($ctrl.company);
            }
        };

        $ctrl.submitCompanyAddress = function () {
            if (components[$ctrl.editIdx].validate()) {
                angular.copy($ctrl.editItem, $ctrl.company.addresses[$ctrl.editIdx]);
                $ctrl.updateCompanyInfo($ctrl.company).then($ctrl.cancel);
            }
        };

        $ctrl.cancel = function () {
            $ctrl.editIdx = -1;
            $ctrl.editItem = null;
        };

        $ctrl.edit = function ($index) {
            $ctrl.editIdx = $index;
            $ctrl.editItem = angular.copy($ctrl.company.addresses[$ctrl.editIdx]);
        };

        $ctrl.delete = function ($index) {
            var showDialog = function (text) {
                confirmService.confirm(text).then(function (confirmed) {
                    if (confirmed) {
                        $ctrl.company.addresses.splice($index, 1);
                        $ctrl.updateCompanyInfo($ctrl.company);
                    }
                });
            };

            $translate('customer.addresses.delete_confirm').then(showDialog, showDialog);
        };

        var components = [];
        $ctrl.addComponent = function (component) {
            components.push(component);
        };
        $ctrl.removeComponent = function (component) {
            components = _.without(components, component);
        };

        refresh();
    }]
});
