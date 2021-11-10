var storefrontApp = angular.module('storefrontApp');

storefrontApp.constant('vcTotalsDefaults', {
    show: {
        subtotal: true,
        taxes: true,
        shipping: true,
        payment: true,
        discount: true
    },
    complete: false
});

storefrontApp.component('vcTotals', {
    templateUrl: "themes/assets/js/common-components/totals.tpl.liquid",
	bindings: {
        order: '<',
        options: '<'
    },
    controller: ['vcTotalsDefaults', function(defaults) {
        var $ctrl = this;

        $ctrl.options = angular.merge({ }, defaults, $ctrl.options);
        $ctrl.isCollapsed = true;

        var fieldSuffix = $ctrl.showWithTaxes ? 'WithTax' : '';
        $ctrl.fieldNames = {
            subTotal: 'subTotal' + fieldSuffix,
            shippingPrice: 'shippingPrice' + fieldSuffix,
            shippingTotal: 'shippingTotal' + fieldSuffix,
            payment: 'paymentPrice' + fieldSuffix,
            discount: 'discountTotal' + fieldSuffix
        };

        $ctrl.toggleDiscountDetails = function () {
            $ctrl.isCollapsed = !$ctrl.isCollapsed;
        }
    }]
});


storefrontApp.component('vcTotalsFieldWithFree', {
  templateUrl: "totals-field-with-free-template.tpl",
bindings: {
      field: '<'
  }
});
