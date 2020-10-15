storefrontApp.service('authService', ['storefrontApp.mainContext', function (mainContext) {
    return {
        canByRole: function (roleId) {
            var customer = mainContext.customer;
            var role = customer.roles.find(x=>x.id === roleId);
            return role != null;
        }
    }
}]);
