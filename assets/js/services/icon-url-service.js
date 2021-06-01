storefrontApp.service('iconUrlService', ['urlService', 'creditCardPaymentMethodCode', 'invoicePaymentMethodCode', function (urlService, creditCardPaymentMethodCode, invoicePaymentMethodCode) {
    return {
        getPaymentMethodIconUrl: function (paymentMethodCode) {
            switch(paymentMethodCode) {
                case invoicePaymentMethodCode:
                    return urlService.toAbsoluteUrl('themes/assets/images/mock/invoice-payment-method.svg');
                case creditCardPaymentMethodCode:
                    return urlService.toAbsoluteUrl('themes/assets/images/mock/credit-card-payment-method.svg');
                default:
                    return urlService.toAbsoluteUrl('themes/assets/images/no-image.svg');
            }
        }
    }
}]);
