angular.module('storefront.account')
.component('vcAccountSubscriptions', {
    templateUrl: "themes/assets/js/account/account-subscriptions.tpl.liquid"
})

.component('vcAccountSubscriptionsList', {
    templateUrl: "account-subscriptions-list.tpl",
    controller: ['accountApi', 'confirmService', 'loadingIndicatorService', '$translate', '$stateParams', function (accountApi, confirmService, loader, $translate, $stateParams) {
        var $ctrl = this;
        $ctrl.loader = loader;
        $ctrl.pageSettings = { currentPage: $stateParams.pageNumber || 1, itemsPerPageCount: 5, numPages: 10 };

        loadData();

        $ctrl.pageSettings.pageChanged = function () {
            loadData();
        };

        function loadData() {
            loader.wrapLoading(function () {
                return accountApi.searchUserSubscriptions({
                    pageNumber: $ctrl.pageSettings.currentPage,
                    pageSize: $ctrl.pageSettings.itemsPerPageCount,
                    sortInfos: $ctrl.sortInfos
                }).then(function (response) {
                    $ctrl.entries = response.data.results;
                    $ctrl.pageSettings.totalItems = response.data.totalCount;
                });
            });
        }
    }]
})

.component('vcAccountSubscriptionDetail', {
    templateUrl: "account-subscription-detail.tpl",
    controller: ['accountApi', 'confirmService', 'loadingIndicatorService', '$translate', '$stateParams', function (accountApi, confirmService, loader, $translate, $stateParams) {
        var $ctrl = this;
        $ctrl.loader = loader;

        $ctrl.pageNumber = $stateParams.pageNumber || 1;
        $ctrl.entryNumber = $stateParams.number;

        refresh();

        function refresh() {
            loader.wrapLoading(function () {
                return accountApi.getUserSubscription({ number: $ctrl.entryNumber }).then(function (response) {
                    $ctrl.subscription = angular.copy(response.data);
                });
            });
        }

        $ctrl.cancel = function () {

            loader.wrapLoading(function () {
                return accountApi.cancelUserSubscription({ number: $ctrl.entryNumber, cancelReason: $ctrl.cancelReason }).then(function (result) {
                    $ctrl.subscription = angular.copy(result.data);
                    $ctrl.isCancelFormVisible = false;
                    refresh();
                });
            });
        };
    }]
})

.filter('toIntervalKey', function () {
    return function (data, data_intervalCount) {
        var retVal = 'customer.subscriptions.intervals.' + data.interval.toLowerCase() + '_' + (data_intervalCount === 1 ? 1 : 'plural');
        //var everyKey = 'customer.subscriptions.intervals.every';

        //$translate([intervalKey, everyKey]).then(function (translations) {
        //var intervalVal = translations[intervalKey];
        //  var everyVal = translations[everyKey];

        //if (data_intervalCount === 1) {
        //    retVal = intervalKey;
        //} else {
        //    retVal = data_intervalCount + intervalVal;
        //}
        //});

        return retVal;
    };
});
