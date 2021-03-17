vcAccountSwitchController.$inject = ['multiAccountService', '$log'];
function vcAccountSwitchController (multiAccountService, $log) {
    var $ctrl = this;
    $ctrl.currentAccount = multiAccountService.getCurrentAccount();

    $ctrl.accounts = multiAccountService.getAccounts();
    $log.log($ctrl.accounts);

    $ctrl.switch = (account) => {
        multiAccountService.switch(account);
    }

    $ctrl.logout = (id) => {
        multiAccountService.remove(id);
        $ctrl.accounts = multiAccountService.getAccounts();
    }
}

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcAccountSwitch', {
    templateUrl: "themes/assets/js/account/account-switch.tpl.liquid",
    controller: vcAccountSwitchController
});

storefrontApp.component('vcAccountSwitchMigration', {
    templateUrl: "themes/assets/js/account/b4/account-switch.tpl.liquid",
    controller: vcAccountSwitchController
});

storefrontApp.service('multiAccountService', ['$window', '$localStorage', '$cookies', 'storefrontApp.mainContext', function ($window, $localStorage, $cookies, mainContext) {
    return {
        getAccounts: () => Object.values($localStorage.accounts || {}),
        getCurrentAccount: () => {
            const customer = mainContext.customer;
            return {
                id: customer.id,
                userName: customer.userName,
                name: customer.name,
                role: customer.role,
                cookie: $cookies.get('.AspNetCore.Identity.Application')
            };
        },
        get: (id) => {
            return $localStorage.accounts[id];
        },
        set: (account) => {
            if (!$localStorage.accounts) {
                $localStorage.accounts = {};
            }
            $localStorage.accounts[account.id] = account;
        },
        remove: (id) => {
            delete $localStorage.accounts[id];
        },
        switch: (account) => {
            const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
            const expirationDate = new Date(new Date().getTime() + thirtyMinutesInMilliseconds);
            $cookies.set('.AspNetCore.Identity.Application', account.cookie,
                {
                    path: '/',
                    expires: expirationDate,
                    samesite: 'lax'
                });
            $window.location.reload();
        }
    }
}]);

storefrontApp.factory('multiAccountInterceptor', ['multiAccountService', 'storefrontApp.mainContext', function (multiAccountService, mainContext) {
    var multiAccountInterceptor = {};

    multiAccountInterceptor.response = function (response) {
        if (mainContext.customer.isRegisteredUser) {
            multiAccountService.set(multiAccountService.getCurrentAccount());
        }
        return response;
    };

    return multiAccountInterceptor;
}]);

storefrontApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('multiAccountInterceptor');
}])

storefrontApp.run(['multiAccountService', 'storefrontApp.mainContext', function(multiAccountService, mainContext) {
    if (mainContext.customer.isRegisteredUser) {
        multiAccountService.set(multiAccountService.getCurrentAccount());
    }
}])
