var storefrontApp = angular.module('storefrontApp');

storefrontApp.directive('onlyInteger', function () {
  return  {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
        ngModelCtrl.$parsers.push( (text) => {
            if (text) {
                var transformedInput = text.replace(/[^0-9]/g, '');

                if (transformedInput !== text) {
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                }
                return transformedInput;
            }
            return undefined;
        });
    }
  }
});
