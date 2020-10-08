angular.module('storefront.account')
.component('vcAccountQuotes', {
    templateUrl: "themes/assets/js/account/account-quotes.tpl.liquid",
    require: {
        accountManager: '^vcAccountManager'
    },
    controller: ['$stateParams', function ( $stateParams ) {
        var ctrl = this;
        ctrl.pageSettings = { currentPage: $stateParams.pageNumber || 1, itemsPerPageCount: 5, numPages: 10 };

        refresh();

        ctrl.pageSettings.pageChanged = function () {
            refresh();
        };

        function refresh() {
            ctrl.accountManager.getQuotes(ctrl.pageSettings.currentPage, ctrl.pageSettings.itemsPerPageCount, ctrl.sortInfos, function (data) {
                ctrl.entries = data.results;
                ctrl.pageSettings.totalItems = data.totalCount;
            });
        }

    }]
});
