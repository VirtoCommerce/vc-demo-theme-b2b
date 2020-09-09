angular.module('storefront.account')
    .component('vcAccountLastOrdersList', {
        templateUrl: "account-last-orders-list.tpl",
        controller: ['accountApi', 'loadingIndicatorService', '$window', 'sortDescending', function (accountApi, loader, $window, sortDescending ) {
            var $ctrl = this;
            $ctrl.loader = loader;
            $ctrl.pageSettings = { currentPage: 1, itemsPerPageCount: 5 };

            $ctrl.getInvoicePdf = function (orderNumber) {
                var url = $window.BASE_URL + 'storefrontapi/orders/' + orderNumber + '/invoice';
                $window.open(url, '_blank');
            }

            $ctrl.sortInfos = {
                sortBy: 'createdDate',
                sortDirection: sortDescending
            }

            function loadData() {
                return loader.wrapLoading(function () {
                    return accountApi.searchUserOrders({
                        pageNumber: $ctrl.pageSettings.currentPage,
                        pageSize: $ctrl.pageSettings.itemsPerPageCount,
                        sort: `${$ctrl.sortInfos.sortBy}:${$ctrl.sortInfos.sortDirection}`,
                        statuses: []
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;
                        $ctrl.pageSettings.totalItems = response.data.totalCount;
                    });
                });
            }

            loadData();

        }]
    })
    .filter('orderToSummarizedStatusLabel', [function () {
        return function (order) {
            if (!order)
                return false;

            var retVal = order.status || 'New';

            return retVal;
        };
    }]);
