//Call this to register our module to main application
var moduleName = "storefront.account";

if (storefrontAppDependencies !== undefined) {
    storefrontAppDependencies.push(moduleName);
}
angular.module(moduleName, ['ngResource', /*'credit-cards', */'pascalprecht.translate', 'ngSanitize', 'storefrontApp', 'storefrontApp.consts'])

    .config(['$translateProvider', 'locale', 'localization', '$stateProvider', '$urlRouterProvider', function ($translateProvider, locale, localization, $stateProvider, $urlRouterProvider) {
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
        $translateProvider.translations(locale, localization);
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
            url: '/orders',
            component: 'vcAccountOrders'
        }

        var ordersListSate = {
            name: 'orders.list',
            url: '/?{pageNumber: int}',
            component: 'vcAccountOrdersList',
            params: {
                pageNumber: {value: null}
            }
        }

        var ordersDetailSate = {
            name: 'orders.detail',
            url: '/{number}?pageNumber',
            component: 'vcAccountOrderDetail',
            params: {
                pageNumber: {value: null}
            }
        }

        var subscriptionsSate = {
            abstract: true,
            name: 'subscriptions',
            url: '/subscriptions',
            component: 'vcAccountSubscriptions'
        }


        var subscriptionsListSate = {
            name: 'subscriptions.list',
            url: '/?{pageNumber: int}',
            component: 'vcAccountSubscriptionsList',
            params: {
                pageNumber: {value: null}
            }
        }

        var subscriptionsDetailSate = {
            name: 'subscriptions.detail',
            url: '/{number}?pageNumber',
            component: 'vcAccountSubscriptionsDetail',
            params: {
                pageNumber: {value: null}
            }
        }

        var companyInfoSate = {
            name: 'companyInfo',
            url: '/companyInfo',
            component: 'vcAccountCompanyInfo'
        }

        var membersSate = {
            abstract: true,
            name: 'members',
            url: '/companyMembers',
            component: 'vcAccountCompanyMembers'
        }

        var membersListSate = {
            name: 'members.list',
            url: '/?{pageNumber: int}',
            component: 'vcAccountCompanyMembersList',
            params: {
                pageNumber: {value: null}
            }
        }

        var membersDetailSate = {
            name: 'members.detail',
            url: '/{member}?pageNumber',
            component: 'vcAccountCompanyMemberDetail',
            params: {
                pageNumber: {value: null}
            }
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
            url: '/lists',
            component: 'vcAccountLists'
        }

        var listsMyListsSate = {
            name: 'lists.myLists',
            url: '/',
            component: 'vcAccountMyLists',
        }

        var quotesSate = {
            name: 'quotes',
            url: '/quotes/?{pageNumber: int}',
            component: 'vcAccountQuotes',
            params: {
                pageNumber: {value: null}
            }
        }

        $stateProvider.state(dashboardSate);
        $stateProvider.state(ordersSate);
        $stateProvider.state(ordersListSate);
        $stateProvider.state(ordersDetailSate);
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

    .run(['$rootScope', '$window', '$templateCache', 'locale', '$translate', function ($rootScope, $window, $templateCache, locale, $translate) {
        $translate.use(locale);
        // cache application level templates
        $templateCache.put('pagerTemplate.html', '<ul uib-pagination boundary-links="true" max-size="$ctrl.pageSettings.numPages" items-per-page="$ctrl.pageSettings.itemsPerPageCount" total-items="$ctrl.pageSettings.totalItems" ng-model="$ctrl.pageSettings.currentPage" ng-change="$ctrl.pageSettings.pageChanged()" class="pagination-sm" style="padding-bottom: 20px;" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></ul uib-pagination>');

        $rootScope.adjustTemplateUrl = (templateUrl) => {
            let result = templateUrl;
            const path = $window.location.pathname;

            if(path && path.indexOf('/b4') > -1) {
                result = result.replace('/account/', '/account/b4/');
                result = result.replace('/common-components/', '/common-components/b4/');
            }

            return result;
        };
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

    .service('confirmService', ['$q', function ($q) {
        this.confirm = function (message) {
            return $q.when(window.confirm(message || 'Is it OK?'));
        };
    }])
