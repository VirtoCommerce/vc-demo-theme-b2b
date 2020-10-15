storefrontApp.service('urlService', ['baseUrl', function (baseUrl) {
    return {
        toAbsoluteUrl: function (relativeUrl) {
            return baseUrl + relativeUrl;
        }
    }
}]);
