var storefrontApp = angular.module('storefrontApp');

storefrontApp.component('vcLoader', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/loader.tpl.html",
    bindings: {
        isLoading: '<'
    }
});
