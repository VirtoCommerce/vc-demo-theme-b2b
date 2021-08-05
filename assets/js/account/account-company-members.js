angular.module('storefront.account')
    .component('vcAccountCompanyMembers', {
        templateUrl: "themes/assets/js/account/b4/account-company-members.tpl",
        controller: ['storefrontApp.mainContext', function () {
        }]
    })

    .component('vcAccountCompanyMembersList', {
        templateUrl: "account-company-members-list.tpl",
        controller: ['storefrontApp.mainContext', '$scope', 'accountApi', 'loadingIndicatorService', 'confirmService', '$location', '$translate', '$stateParams', 'b2bRoles', '$rootScope', function (mainContext, $scope, accountApi, loader, confirmService, $location, $translate, $stateParams, b2bRoles, $rootScope) {
            var $ctrl = this;
            $ctrl.currentMemberId = mainContext.customer.id;
            $ctrl.newMemberComponent = null;
            $ctrl.loader = loader;
            $ctrl.pageSettings = { currentPage: $stateParams.pageNumber || 1, itemsPerPageCount: 10, numPages: 10 };
            $ctrl.pageSettings.pageChanged = function () { refresh(); };
            $ctrl.availableRoles = b2bRoles;

            refresh();

            function refresh() {
                $ctrl.errors = undefined;
                loader.wrapLoading(function () {
                    return accountApi.searchOrganizationUsers({
                        pageNumber: $ctrl.pageSettings.currentPage,
                        pageSize: $ctrl.pageSettings.itemsPerPageCount
                    }).then(function (response) {
                        $ctrl.entries = response.data.results;
                        $ctrl.pageSettings.totalItems = response.data.totalCount;
                    });
                });
            };

            $ctrl.addNewMemberFieldsConfig = [
                {
                    field: 'CompanyName',
                    disabled: true,
                    visible: false,
                    required: false
                },
                {
                    field: 'Email',
                    disabled: false,
                    visible: true,
                    required: true
                },
                {
                    field: 'UserName',
                    disabled: false,
                    visible: true,
                    required: true
                },
                {
                    field: 'Password',
                    disabled: false,
                    visible: true,
                    required: true
                },
                {
                    field: 'Roles',
                    disabled: false,
                    visible: true,
                    required: true
                }
            ];

            $scope.init = function (storeId, cultureName, registrationUrl) {
                $ctrl.storeId = storeId;
                $ctrl.cultureName = cultureName;
                $ctrl.registrationUrl = registrationUrl;
            };

            $ctrl.inviteEmailsValidationPattern = new RegExp(/((^|((?!^)([,;]|\r|\r\n|\n)))([a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))+$/);
            $ctrl.invite = function () {
                $ctrl.inviteInfo.emails = $ctrl.inviteInfo.rawEmails.split(/[,;]|\r|\r\n|\n/g);
                loader.wrapLoading(function () {
                    return accountApi.createInvitation({
                        emails: $ctrl.inviteInfo.emails,
                        message: $ctrl.inviteInfo.message,
                        roles: [$ctrl.inviteInfo.role.name]
                    }).then(function(response) {
                        if (response.data.succeeded) {
                            $ctrl.cancel();
                            refresh();
                            $rootScope.$broadcast('successOperation', {
                                type: 'success',
                                message: 'The invintation was successfully sent out to users',
                            });
                        }
                        else {
                            $ctrl.errors = _.pluck(response.data.errors, 'description');
                        }

                    });
                });
            };

            $ctrl.addNewMember = function () {
                if ($ctrl.newMemberComponent.validate()) {
                    $ctrl.newMember.organizationId = mainContext.customer.organizationId;
                    $ctrl.newMember.role = $ctrl.newMember.role ? $ctrl.newMember.role.id : undefined;
                    $ctrl.newMember.storeId = $ctrl.storeId;

                    loader.wrapLoading(function () {
                        return accountApi.registerNewUser($ctrl.newMember).then(function(response) {
                            if (response.data.succeeded) {
                                $ctrl.cancel();
                                $ctrl.pageSettings.currentPage = 1;
                                $ctrl.pageSettings.pageChanged();
                                $rootScope.$broadcast('successOperation', {
                                  type: 'success',
                                  message: 'Company member was successfully added',
                              });
                            }
                            else {
                                $ctrl.errors = _.pluck(response.data.errors, 'description');
                            }
                        });
                    });
                }
            };

            $ctrl.cancel = function () {
                $ctrl.inviteInfo = null;
                $ctrl.newMember = null;
            };

            $ctrl.changeStatus = function (member) {
                loader.wrapLoading(function () {
                    var action = member.isLockedOut ? accountApi.unlockUser : accountApi.lockUser;
                    member.isLockedOut = !member.isLockedOut;
                    return action(member.id).then(function (response) {
                        if (response.data.succeeded) {
                            refresh();
                        }
                        else {
                            $ctrl.errors = _.pluck(response.data.errors, 'description');
                        }
                    });
                });
            };

            $ctrl.delete = function (member) {
                var showDialog = function (text) {
                    confirmService.confirm(text).then(function (confirmed) {
                        if (confirmed) {
                            loader.wrapLoading(function () {
                                return accountApi.deleteUser(member.id).then(function(response) {
                                    if (response.data.succeeded) {
                                        refresh();
                                    }
                                    else {
                                        $ctrl.errors = _.pluck(response.data.errors, 'description');
                                    }
                                });
                            });
                        }
                    });
                };

                $translate('customer.edit_company_members.delete_confirm').then(showDialog, showDialog);
            };

            $ctrl.validate = function () {
                $ctrl.inviteForm.$setSubmitted();
                return $ctrl.inviteForm.valid;
            };

            $ctrl.showActions = function (member) {
                return member.id != mainContext.customer.id;
            }
        }]
    });
