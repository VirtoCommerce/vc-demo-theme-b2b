var storefrontApp = angular.module('storefrontApp');

storefrontApp.controller('collectionController', ['$scope', '$location', 'inventoryApi',  function ($scope, $location, inventoryApi) {
    $scope.currentFulfillmentCenter = { id: null };
    var $ctrl = this;
    $scope.fulfillmentCenters = [];

    $ctrl.init = function() {
        $ctrl.sortModes = {
            'priority-descending;name-ascending': 'collections.sorting.featured',
            // 'best-selling': 'collections.sorting.best_selling',
            'name-ascending': 'collections.sorting.az',
            'name-descending': 'collections.sorting.za',
            'price-ascending': 'collections.sorting.price_ascending',
            'price-descending': 'collections.sorting.price_descending',
            'createddate-descending': 'collections.sorting.date_descending',
            'createddate-ascending': 'collections.sorting.date_ascending'
        };
        $ctrl.viewQuery = { view: ['grid'] };
        $ctrl.keywordQuery = { keyword: [] };
        loadFulfillmentCenters();
    }

    $ctrl.generatePageSizes = function (capacity, steps) {
        $ctrl.pageSizeQuery = { page_size: [capacity] };
        // for example            start: 16 stop: 16 * 3 + 1 = 49 step: 16
        $ctrl.pageSizes = _.range(capacity, capacity * steps + 1, capacity);
    }

    function loadFulfillmentCenters () {
        inventoryApi.searchFulfillmentCenters({ }).then(function(response) {
             $scope.fulfillmentCenters = response.data.results;
         });
    }

    $scope.adaptFilterName = function (termKey) {
      return termKey === 'available_in' ? 'Available in' : termKey;
    }

    $scope.adaptFilterValue = function (termKey, termValue) {
      let resultValue = termValue;

      if (termKey === 'available_in') {
        const fulfillmentCenter = $scope.fulfillmentCenters.find(x => x.id === termValue);
        resultValue = !!fulfillmentCenter ? fulfillmentCenter.name : '';
      }

      return resultValue;
    }


    $ctrl.init();
}]);
