//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', /*'credit-cards', */'pascalprecht.translate', 'ngSanitize', 'storefrontApp', 'storefrontApp.consts'])

    .config(['$translateProvider', 'baseUrl', '$stateProvider', '$urlRouterProvider', function ($translateProvider, baseUrl, $stateProvider, $urlRouterProvider) {
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
        $translateProvider.useUrlLoader(baseUrl + 'themes/localization.json');
        $translateProvider.preferredLanguage('en');

        $urlRouterProvider.otherwise("/");

        var dashboardSate = {
            name: 'dashboard',
            url: '/',
            component: 'vcAccountDashboard'
        }

        var ordersSate = {
            abstract: true,
            name: 'orders',
            url: '/orders/',
            component: 'vcAccountOrders'
        }

        var ordersListSate = {
            name: 'orders.list',
            url: '',
            component: 'vcAccountOrdersList',
        }

        var ordersDetailSate = {
            name: 'orders.detail',
            url: '/{number}',
            component: 'vcAccountOrdersDetail'
        }

        var subscriptionsSate = {
            abstract: true,
            name: 'subscriptions',
            url: '/subscriptions/',
            component: 'vcAccountSubscriptions'
        }


        var subscriptionsListSate = {
            name: 'subscriptions.list',
            url: '',
            component: 'vcAccountSubscriptionsList',
        }

        var subscriptionsDetailSate = {
            name: 'subscriptions.detail',
            url: '/{number}',
            component: 'vcAccountSubscriptionsDetail'
        }

        var companyInfoSate = {
            name: 'companyInfo',
            url: '/companyInfo',
            component: 'vcAccountCompanyInfo'
        }

        var membersSate = {
            abstract: true,
            name: 'members',
            url: '/companyMembers/',
            component: 'vcAccountCompanyMembers'
        }

        var membersListSate = {
            name: 'members.list',
            url: '',
            component: 'vcAccountCompanyMembersList',
        }

        var membersDetailSate = {
            name: 'members.detail',
            url: '/{member}',
            component: 'vcAccountCompanyMemberDetail'
        }

        var profileSate = {
            name: 'profile',
            url: '/profile',
            component: 'vcAccountProfileUpdate'
        }

        var addressesSate = {
            name: 'addresses',
            url: '/addresses',
            component: 'vcAccountAddresses'
        }

        var changePasswordSate = {
            name: 'passwordChange',
            url: '/changePassword',
            component: 'vcAccountPasswordChange'
        }

        var checkoutDefaultsSate = {
            name: 'checkoutDefaults',
            url: '/checkoutDefaults',
            component: 'vcAccountCheckoutDefaults'
        }


        var listsSate = {
            abstract: true,
            name: 'lists',
            url: '/lists/',
            component: 'vcAccountLists'
        }

        var listsMyListsSate = {
            name: 'lists.myLists',
            url: '',
            component: 'vcAccountMyLists',
        }

        var quotesSate = {
            name: 'quotes',
            url: '/quotes',
            component: 'vcAccountQuotes'
        }

        $stateProvider.state(dashboardSate);
        $stateProvider.state(ordersSate);
        $stateProvider.state(ordersDetailSate);
        $stateProvider.state(ordersListSate);
        $stateProvider.state(subscriptionsSate);
        $stateProvider.state(subscriptionsDetailSate);
        $stateProvider.state(subscriptionsListSate);
        $stateProvider.state(companyInfoSate);
        $stateProvider.state(membersSate);
        $stateProvider.state(membersListSate);
        $stateProvider.state(membersDetailSate);
        $stateProvider.state(profileSate);
        $stateProvider.state(addressesSate);
        $stateProvider.state(changePasswordSate);
        $stateProvider.state(checkoutDefaultsSate);
        $stateProvider.state(listsSate);
        $stateProvider.state(listsMyListsSate);
        $stateProvider.state(quotesSate);

    }])

    .run(['$templateCache', function ($templateCache) {
        // cache application level templates
        $templateCache.put('pagerTemplate.html', '<ul uib-pagination boundary-links="true" max-size="$ctrl.pageSettings.numPages" items-per-page="$ctrl.pageSettings.itemsPerPageCount" total-items="$ctrl.pageSettings.totalItems" ng-model="$ctrl.pageSettings.currentPage" ng-change="$ctrl.pageSettings.pageChanged()" class="pagination-sm" style="padding-bottom: 20px;" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></ul uib-pagination>');
    }])

    .service('accountDialogService', ['$uibModal', function ($uibModal) {
        return {
            showDialog: function (dialogData, controller, templateUrl) {
                var modalInstance = $uibModal.open({
                    controller: controller,
                    templateUrl: templateUrl,
                    resolve: {
                        dialogData: function () {
                            return dialogData;
                        }
                    }
                });
            }
        }
    }])

    .component('vcAccountManager', {
        templateUrl: "account-manager.tpl",
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
    })

    .service('confirmService', ['$q', function ($q) {
        this.confirm = function (message) {
            return $q.when(window.confirm(message || 'Is it OK?'));
        };
    }])
