angular.module('storefront.account')
    .component('vcDashboardUserList', {
        templateUrl: "themes/assets/js/account/dashboard-user-list.tpl",
        controller: ['storefrontApp.mainContext', '$scope', 'accountApi', 'loadingIndicatorService', 'sortDescending', function (mainContext, $scope, accountApi, loader, sortDescending) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5 };
            $ctrl.sortInfos = {
                sortBy: 'createdDate',
                sortDirection: sortDescending
            }

            $ctrl.userTableHided = function () {
                const element = document.getElementById('user-list-table');
                return window.getComputedStyle(element, null).display == 'none';
            }

            function refresh() {
                $ctrl.errors = undefined;
                loader.wrapLoading(function () {
                    return accountApi.searchOrganizationUsers({
                        pageNumber: $ctrl.pageSettings.currentPage,
                        pageSize: $ctrl.pageSettings.itemsPerPageCount,
                        sort: `${$ctrl.sortInfos.sortBy}:${$ctrl.sortInfos.sortDirection}`
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;
                    });
                });
            }

            refresh();

        }]
    });
