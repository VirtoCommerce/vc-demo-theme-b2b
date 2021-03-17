vcAccountSwitchController.$inject = ['multiAccountService'];
function vcAccountSwitchController (multiAccountService) {
    var $ctrl = this;
    $ctrl.currentAccount = multiAccountService.getCurrentAccount();

    $ctrl.accounts = multiAccountService.getAccounts();

    $ctrl.switch = (account) => {
        multiAccountService.switch(account);
    }

    $ctrl.logout = (id, redirectUrl) => {
        multiAccountService.logout(id, redirectUrl);
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
    const multiAccountService = {
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
        getLastUsedUserName: () => {
            return $localStorage.lastUsedUserName;
        },
        updateCurrentAccount: () => {
            if (mainContext.customer.isRegisteredUser) {
                if (!$localStorage.accounts) {
                    $localStorage.accounts = {};
                }
                const currentAccount = multiAccountService.getCurrentAccount();
                $localStorage.accounts[mainContext.customer.id] = currentAccount;
                $localStorage.lastUsedUserName = currentAccount.userName;
            }
        },
        switch: (account) => {
            const thirtyMinutesInMilliseconds = 30 * 60 * 1000;
            const expirationDate = new Date(new Date().getTime() + thirtyMinutesInMilliseconds);
            $cookies.set('.AspNetCore.Identity.Application',
                account.cookie,
                {
                    path: '/',
                    expires: expirationDate,
                    samesite: 'lax'
                });
            $localStorage.lastUsedUserName = account.userName;
            $window.location.reload();
        },
        logout: (id, redirectUrl) => {
            delete $localStorage.accounts[id];
            if (mainContext.customer.id === id) {
                delete $localStorage.lastUsedUserName;
                $window.location = redirectUrl;
            }
        }
    };
    return multiAccountService;
}]);

storefrontApp.factory('multiAccountInterceptor', ['multiAccountService', function (multiAccountService) {
    var multiAccountInterceptor = {};

    multiAccountInterceptor.response = function (response) {
        multiAccountService.updateCurrentAccount();
        return response;
    };

    return multiAccountInterceptor;
}]);

storefrontApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('multiAccountInterceptor');
}])

storefrontApp.run(['multiAccountService', function(multiAccountService) {
    multiAccountService.updateCurrentAccount();
}])
