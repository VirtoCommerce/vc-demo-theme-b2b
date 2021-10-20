angular.module('storefront.account')
    .component('vcDashboardUserRolesList', {
        templateUrl: "themes/assets/js/account/dashboard-user-roles-list.tpl",
        controller: ['accountApi', 'loadingIndicatorService', function (accountApi, loader) {
            var $ctrl = this;
            $ctrl.loader = loader;

            function refresh() {
                loader.wrapLoading(function () {
                    return accountApi.searchOrganizationUsers({
                        skip: 0,
                        take: 100
                    }).then(function (response) {
                        $ctrl.userEntries = response.data.results;
                        const roleRecords = $ctrl.userEntries
                            .filter(entry => entry.role)
                            .map(entryWithRole => ({
                                id: entryWithRole.role.id || "",
                                description: entryWithRole.role.description || "",
                                name: entryWithRole.role.name || "",
                            }));
                        $ctrl.distinctRoles = unique(roleRecords, 'id');
                    });
                });
            }

            function unique(array, propertyName) {
                return array.filter((e, i) => array.findIndex(a => a[propertyName] === e[propertyName]) === i);
             }

            refresh();

        }]
    });
