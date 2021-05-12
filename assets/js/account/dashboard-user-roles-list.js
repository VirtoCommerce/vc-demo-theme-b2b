angular.module('storefront.account')
    .component('vcDashboardUserRolesList', {
        templateUrl: "dashboard-user-roles-list.tpl",
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
                        const roleRecords = $ctrl.userEntries.map(x => ({
                            id: x.role.id,
                            name: x.role.name,
                            description: x.role.description
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
