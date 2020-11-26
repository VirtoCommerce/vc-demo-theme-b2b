searchBarController.$inject = ['$scope', '$q', 'catalogService'];
function searchBarController($scope, $q, catalogService) {
  var $ctrl = this;
  $ctrl.hasHint = false;

  $scope.$watch('$ctrl.isOpen', function (isOpen) {
      $ctrl.hasHint = !!$ctrl.query && !isOpen;
  });

  $scope.$watch('$ctrl.query', function (query) {
      $ctrl.hasHint = !!query && !$ctrl.isOpen;
  });

  $ctrl.getSuggestions = function () {
      var searchCriteria = { keyword: $ctrl.query, start: 0, isFuzzySearch: true };
      return $q.all([
          catalogService.searchCategories(angular.extend({}, searchCriteria, { pageSize: $ctrl.categoryLimit })),
          catalogService.search(angular.extend({}, searchCriteria, { pageSize: $ctrl.productLimit }))
      ]).then(function (results) {
          var process = function (within) {
              return (results[0].data[within] || results[1].data[within]).map(function (suggestion) {
                  suggestion['within'] = within;
                  return suggestion;
              });
          }
          return process('categories').concat(process('products')).map(function (suggestion, index) {
              suggestion['index'] = index;
              return suggestion;
          });
      });
  };
}

var storefrontApp = angular.module('storefrontApp');
storefrontApp.component('vcSearchBar', {
    templateUrl: "themes/assets/js/common-components/searchBar.tpl.html",
    bindings: {
        formClass: '<',
        placeholder: '<',
        searching: '<',
        noResults: '<',
        query: '@',
        categoriesLabel: '<',
        productsLabel: '<',
        submitLabel: '<',
        categoryLimit: '@',
        productLimit: '@'
    },
    controller: searchBarController
});

storefrontApp.component('vcSearchBarMigration', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/searchBar.tpl.html",
    bindings: {
        formClass: '<',
        placeholder: '<',
        searching: '<',
        noResults: '<',
        query: '@',
        categoriesLabel: '<',
        productsLabel: '<',
        submitLabel: '<',
        categoryLimit: '@',
        productLimit: '@'
    },
    controller: searchBarController
});
