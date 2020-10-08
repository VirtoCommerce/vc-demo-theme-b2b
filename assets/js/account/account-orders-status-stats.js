angular.module('storefront.account')
.component('vcAccountOrdersStatusStats', {
    templateUrl: "account-orders-status-stats.tpl",
    controller: ['$scope', '$q', 'storefrontApp.mainContext', 'loadingIndicatorService', 'accountApi', function ($scope, $q,  mainContext, loader, accountApi) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.unpaidCount = null;
        $ctrl.paidCount = null;
        $ctrl.completedCount = null;

        $ctrl.statusStats = {
            'Unpaid': null,
            'Paid': null,
            'Completed': null
        }

        $ctrl.statuses = Object.keys($ctrl.statusStats);

        $ctrl.$onInit = function() {
            loadData();
        }

        function loadData() {
            return loader.wrapLoading(function () {
                var statuses = $ctrl.statuses;
                var requests = statuses.map(function(value) {
                    return getRequestPromise(value);
                });

                return $q.all(requests)
                .then(function (results) {
                    results.forEach(function (response, index) {
                        var status = statuses[index];
                        $ctrl.statusStats[status] = response.data.totalCount;
                    });

                });
            });
        }

        function getRequestPromise(status){
            return accountApi.searchUserOrders({
                pageNumber: 1,
                pageSize: 0,
                statuses: [status]
            });
        }

    }]
});
