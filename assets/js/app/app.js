var storefrontAppDependencies = [
    'ngStorage',
    'pascalprecht.translate',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'vcRecaptcha',
    'storefrontApp.consts',
    'mgo-angular-wizard',
    'angularjs-dropdown-multiselect',
    'storefrontApp.customerInfo',
    'ui.router'
];
var storefrontApp = angular.module('storefrontApp', storefrontAppDependencies);

storefrontApp.factory('httpErrorInterceptor', [
    '$q', '$rootScope', function ($q, $rootScope) {
        var httpErrorInterceptor = {};

        httpErrorInterceptor.responseError = function (rejection) {
            if (rejection.data && rejection.data.message) {
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: [rejection.config.method, rejection.config.url, rejection.status, rejection.statusText, rejection.data.message].join(' '),
                    message: rejection.data.stackTrace
                });
            }
            return $q.reject(rejection);
        };
        httpErrorInterceptor.requestError = function (rejection) {
            if (rejection.data && rejection.data.message) {
                $rootScope.$broadcast('storefrontError', {
                    type: 'error',
                    title: [rejection.config.method, rejection.config.url, rejection.status, rejection.statusText, rejection.data.message].join(' '),
                    message: rejection.data.stackTrace
                });
            }
            return $q.reject(rejection);
        };

        return httpErrorInterceptor;
    }
]);

storefrontApp.factory('themeInterceptor', ['$q', 'baseUrl', function ($q, baseUrl) {
    var themeInterceptor = {};

    themeInterceptor.request = function (config) {
        if (config.url.startsWith('storefrontapi') || config.url.startsWith('themes')) {
            config.url = baseUrl + config.url;
        }
        return config || $q.when(config);
    };

    return themeInterceptor;
}
]);

storefrontApp.factory('roundHelper', function () {
    return {
        bankersRound: function (n, d=2) {
            var x = n * Math.pow(10, d);
            var r = Math.round(x);
            var br = Math.abs(x) % 1 === 0.5 ? (r % 2 === 0 ? r : r-1) : r;
            return br / Math.pow(10, d);
        }
    }
});

storefrontApp.factory('validationHelper', function () {
    return {
        positiveInt: function($event) {
            const e = $event;

            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
                // Allow: Ctrl+C
                (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
                // Allow: Ctrl+V
                (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
                // Allow: Ctrl+X
                (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
              // let it happen, don't do anything
              return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            }
        }
    }
});

storefrontApp.config(['$locationProvider', '$httpProvider', 'baseUrl', '$translateProvider', 'vcRecaptchaServiceProvider', 'reCaptchaKey', function ($locationProvider, $httpProvider, baseUrl, $translateProvider, vcRecaptchaServiceProvider, reCaptchaKey) {
    //$locationProvider.html5Mode({ enabled: true, requireBase: false, rewriteLinks: false });
    $httpProvider.interceptors.push('httpErrorInterceptor');
    $httpProvider.interceptors.push('themeInterceptor');

    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useUrlLoader(baseUrl + 'themes/localization.json');
    $translateProvider.preferredLanguage('en');

    // wizardConfigProvider.prevString = 'Back';
    // wizardConfigProvider.nextString = 'Continue';
    // wizardConfigProvider.submitString = 'Complete';

    vcRecaptchaServiceProvider.setSiteKey(reCaptchaKey);
}]);

storefrontApp.run(['$rootScope', '$window', function ($rootScope, $window) {
    $rootScope.print = function () {
        $window.print();
    };
}]);


/**
 * this function gets the customer info and after that it starts 'storefrontApp'
 */
(function() {
    // Get Angular's $http module.
    var initInjector = angular.injector(['ng']);
    var $http = initInjector.get('$http');
    var requestUrl = BASE_URL + 'storefrontapi/account?t=' + new Date().getTime();
    // Get customer info.
    $http.get(requestUrl).then(
        function(response) {
            adjustCurrentCustomerResponse(response);
            // Define a 'customerInfo' module with 'mainContext' service
            angular.module('storefrontApp.customerInfo', []).factory('storefrontApp.mainContext', function () {
                return { customer: response.data };
            });
            // Start myAngularApp manually instead of using directive 'ng-app'.
            angular.element(document).ready(function() {
                angular.bootstrap(document, ['storefrontApp']);
            });
        });
})();
