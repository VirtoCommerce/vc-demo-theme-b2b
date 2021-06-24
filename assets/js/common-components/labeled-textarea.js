angular.module('storefrontApp')

.component('vcLabeledTextArea', {
    templateUrl: "themes/assets/js/bootstrap-migration/common-components/labeled-textarea.tpl.html",
    bindings: {
        value: '=',
        form: '=',
        name: '@',
        label: '@',
        placeholder: '@',
        required: '<',
        requiredError: '@?',
        pattern: '<?',
        autofocus: '<'
    },
    controller: [function () {
        var $ctrl = this;

        $ctrl.validate = function () {
            $ctrl.form.$setSubmitted();
            return $ctrl.form.$valid;
        };

    }]
});
