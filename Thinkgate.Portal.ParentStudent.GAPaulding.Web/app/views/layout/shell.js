(function () {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId,
        ['$rootScope', '$scope', '$location', '$window', 'common', 'datacontext', 'config', shell]);

    angular.module('app').filter('userHtml', [
        '$sce', function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }
    ]);

    /***************************************************************************************************************************** 
      *          Format of the Custom Logging Functions from logger.js which is injected into common.js:                         *
     *****************************************************************************************************************************
      *                  Actual Declaration:  log(message, data, source, showToast)                                               *
      *                  TAKE ADVANTAGE OF THIS FUNCTIONALITY AS IT LOGS: logWarning(message, data, source, showToast)            *
      *                                                                   logSuccess(message, data, source, showToast)            *
      *                                                                   logError(message, data, source, showToast)              *  
      *              All of the parameters have the option of being null.     Ex:  log(null, data, null, true)                    *
     *****************************************************************************************************************************/


    function shell($rootScope, $scope, $location, $window, common, datacontext, config) {
        /* Setup general logging functionality and success/error messages to be displayed by toastr */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        /* log functions : General success/error messages displayed by toastr */
        var logSuccess = getLogFn(controllerId, 'success');
        var logError = getLogFn(controllerId, 'error');
        var successMsg = '[Login]: Successful | Thinkgate Parent-Student Portal ...';
        var errorMsg = '[Login]: Error | Login failed, please try again.';

        /* log functions : Specific success/error messages displayed by toastr for login fields */
        var emailWarning = 'Please enter your email address in order to validate your credentials.';
        var passwordWarning = 'Please enter your password in order to validate your credentials.';
        var generalWarning = 'Please enter all required information.';

        var vm = this; // set reference

        //#region topnav  Menu Options
        /* nav titles */
        vm.titles = {
            brand: 'Parent-Student Portal',
            logoffLink: '| Log Off |',
            helpLink: '| Help |',
            aboutLink: '| About |'
        };


        //#endregion


        //#region loginpage page setup - settings are created accordingly

        /* using "controller as" functionality. Want to set 'this' controller equal to vm for easy referencing */

        /* view model properties */
        vm.data_token = null;
        vm.tempPass = [];
        vm.resetCode = [];

        /* login server error - error message displayed by a binded alert-error message */
        vm.errorMessage = '';
        $scope.errorMessageMode = false;    // hide alert screen error message initially until called upon

        /* redirection info for reset password - displayed by a binded alert-info message */
        vm.redirectMessage = 'Password update was successful. Redirecting to Profile Selection.';
        $scope.resetRedirectMessageMode = false;    // hide reset-redirection div initially until called upon

        /* page titles if needed */
        vm.news = {
            title: 'Please enter your credentials',
            description: 'Parent-Student Login Page'
        };

        /* gather info from url to see if there is a tmpcode in it */
        var location = window.location.search;              // looking for a query string param called "tmpcode"
        //var code = location.substring(9, location.length);  // grab the value for the code if it exists
        var code = getQueryStringValue("tmpcode");
        var isNewReg = getQueryStringValue("reg");

        /* check for tmpcode, if there is tmpcode, set template to show reset mode and vm.title to resetMode value */
        if (code.length > 0) {
            /* Set the widget title accordingly */
            if (isNewReg.toLowerCase() == "true") {
                vm.title = 'Thinkgate | Parent-Student Portal Registration Page';
            } else {
                vm.title = 'Thinkgate | Parent-Student Portal Reset Password';
            }

            // setup view modes accordingly for loginpage
            $scope.loginpageMode = true;        // entire wrapper
            $scope.loginsection = true;         // entire loginsection: container for all modes
            //$scope.loginMode = false;         // hide regular loginMode
            //$scope.registrationMode = false;  // hide registrationMode
            $scope.resetMode = true;            // show resetMode
            $scope.sidebarMode = false;         // hide sidebar

            /* set hidden input = url parameter: tmpcode */
            $scope.TmpCode = code;
            getPasswordRequirements();
        } else {
            /* if regular user login, setup page accordingly */
            vm.title = 'Thinkgate | Paulding County School District Parent-Student Portal Login';
            $scope.loginpageMode = true;
            $scope.loginsection = true;
            $scope.loginMode = true;
            $scope.registrationMode = false;
            $scope.showReset = true;

            /* sidebar.html is included in shell, needs to be hidden */
            $scope.sidebarMode = false;
        }

        /* setup configuration events */
        var events = config.events;
        vm.busyMessage = 'Please wait ...';

        /* spinner options */
        vm.isBusy = true;
        vm.spinnerOptions = {
            radius: 40,
            lines: 7,
            length: 0,
            width: 30,
            speed: 1.7,
            corners: 1.0,
            trail: 100,
            color: '#F58A00'
        };

        //#endregion


        /* shell.html is the page that the views are laid out using data-ng-include   
         * and data-ng-show and it is the parent scope for all templates and/or views */
        activate(); // activate shell 


        function activate() {
            //logSuccess('Parent-Student Portal Loaded...', null, true);
            getClient().then(function (data) {
                vm.client = data;
                common.activateController([], controllerId);
                var t = 'true';
            });
        }

        /* get client */
        function getClient() {
            var pathArray = window.location.pathname.split('/');
            var clientPath = { client: pathArray[1] };
            $rootScope.client = window.location.protocol + "//" + window.location.host + window.location.pathname;

            return datacontext.getClient(clientPath).then(function (data) {
                return vm.client = data;
            });
        }

        function getPasswordRequirements() {
            return datacontext.getPasswordRequirements().then(function (data) {
                return vm.passwordRequirements = data;
            });
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) {
                $rootScope.hideClientLogo = false;
                toggleSpinner(true);
            }
        );
        $rootScope.$on('$routeChangeError',
            function (event, next, current) { toggleSpinner(false); }
        );
        $rootScope.$on('$routeChangeSucess',
           function (event, next, current) { toggleSpinner(false); }
       );

        $rootScope.$on(events.controllerActivateSuccess,
            function (data) { toggleSpinner(false); }
        );

        $rootScope.$on(events.controllerActivateFailer,
           function (data) {
               window.location.href = "index.html";
           }
       );

        $rootScope.$on(events.spinnerToggle,
            function (data) { toggleSpinner(data.show); }
        );

        //#region  Functions for login actions: getToken, getTempPassword, and resetPassword

        /* **NOTE**: All functions processed via datacontext -> entityMngrFactory -> serviceHelperFactory */

        /* gets authorization token */
        function getToken(userlogin) {
            //return datacontext.getLoginCreds(userlogin).then(function (data) {
            //    return vm.data_token = data;
            //});
            vm.isBusy = true;
            return datacontext.getLoginCreds(userlogin).then(function (data) {
                vm.isBusy = false;
                return data;
            }, function (errorResponse) {
                vm.errorMessage = 'Invalid email or password.  Please try again ...';
            });
        };

        /* gets temporary password */
        function getTempPassword(registration) {
            vm.isBusy = true;
            return datacontext.getRegistration(registration).then(function (data) {
                vm.isBusy = false;
                return vm.tempPass = data;
            });
        };

        /* get reset code to log in */
        function resetPassword(resetInfo) {
            vm.isBusy = true;
            return datacontext.getPasswordReset(resetInfo).then(function (data) {
                vm.isBusy = false;
                return vm.resetCode = data;
            });
        };

        /* logs off user - navbar link */
        function logUserOff() {
            return datacontext.getLogOff().then(function (data) { return data; });
        };

        //#endregion


        //#region Contains: 3 page scope functions. Gathers user input, passes to applicable function for the login action

        /* submit() - this is regular login for existing user */
        $scope.logon = function (loginForm, userlogin) {
            // Clear any previous error messages.
            //if (userlogin == undefined) {
            
            //if (loginForm != null && userlogin == null) {
            if (loginForm != 'null') {
                var userEmail = document.getElementById("username").value == undefined ? document.getElementById("username").innerText : document.getElementById("username").value;
                var userPassword = document.getElementById("passwrd").value;
                userlogin = {};
                userlogin.Email = userEmail.trim();
                userlogin.Password = userPassword.trim();
            }

            // }
            vm.errorMessage = '';
            $scope.errorMessageMode = false;
            /* check all scenarios for login information ONLY because we 
             * need to provide specific info for client and server side errors */
            if ((userlogin != undefined) &&
                (userlogin.Email != null && userlogin.Email != '' && userlogin.Email != undefined) &&
                (userlogin.Password != null && userlogin.Password != '' &&
                (userlogin.Email != undefined))) {
                /* this logs the user in and checks for response, if not 200, checks the response.data */
                getToken(userlogin).then(function (response) {
                    if ((response.data == undefined || response.status == 200) && response.access_token != null && response.access_token != '') {
                        $scope.loginpageMode = true;
                        $scope.loginsection = false;
                        $scope.registrationMode = false;
                        $scope.loginMode = false;
                        $scope.registrationMode = false;
                        $scope.resetMode = false;
                        $scope.userName = response.userName;
                        $scope.userRole = response.userRole;
                    } else {
                        /* setup the view's errorMessage and pageMode accordingly, then log server response */
                        vm.errorMessage = 'Login was unsuccessful.' + '<br/>' + response.data.error_description;
                        $scope.errorMessageMode = true;
                    }
                },function(errorResponse) {
                    // handles server error here
                });

                /* conditions for incomplete or invalid UI entry scenarios */
            } else if (userlogin == undefined || (userlogin.Email==null||userlogin.Email==undefined||userlogin.Email=='') 
                && (userlogin.Password == null || userlogin.Password == undefined || userlogin.Password == '')) {
                /* general error for insufficient info entered */
                vm.errorMessage = generalWarning + '<br/>' + 'Please enter a valid email and password.<br/>';
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(generalWarning));
                /* Email */
            } else if ((userlogin.Email == '' ||
                        userlogin.Email == null ||
                        userlogin.Email == undefined) &&
                       (userlogin.Password)) {
                /* change value of vm.errorMessage accordingly */
                vm.errorMessage = 'A valid email is required.<br/>' + emailWarning;
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(emailWarning));
                /* Password */
            } else if ((userlogin.Password == '' || userlogin.Password == null || userlogin.Password == undefined) &&
                       (userlogin.Email)) {
                vm.errorMessage = 'Required information missing.<br/>' + passwordWarning;
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(passwordWarning));
            }
        };

        /* First Time register() - user enters email address, API sends a temporary password */
        $scope.register = function (registrationForm, registration) {

            //if (registration == null) {
                var userEmail = document.getElementById("regEmail").value == undefined ? document.getElementById("regEmail").innerText : document.getElementById("regEmail").value;
                var guid = document.getElementById("guid").value == undefined ? document.getElementById("guid").innerText : document.getElementById("guid").value;
                var studentId = document.getElementById("studentId").value == undefined ? document.getElementById("studentId").innerText : document.getElementById("studentId").value;

                registration = {};
                registration.Email = userEmail;
                registration.Guid = guid;
                registration.StudentId = studentId;
            //}
            registration.isNewRegistration = $scope.isNewRegistration;

            vm.errorMessage = '';
            if (registration.Email && registration.Guid && registration.StudentId) {
                registration.client = $rootScope.client;
                // Clear any previous error messages.
                vm.errorMessage = "";
                $scope.errorMessageMode = false;
                // get temporary password and setup page modes accordingly
                getTempPassword(registration)
                .then(function (response) {
                    if (response.data == undefined || response.status == 200) {
                        $scope.loginpageMode = true;
                        $scope.loginsection = true;
                        $scope.registrationMode = false;
                        $scope.loginMode = false;
                        $scope.registrationMode = false;
                        $scope.resetMode = false;
                        $scope.registrationNoticeMode = true;
                    } else {
                        var responseMessage = parseErrors(response);

                        /* setup the view's errorMessage and pageMode accordingly, then log server response */
                        //var exceptionMessage = response.data != undefined && response.data.ExceptionMessage != undefined ? response.data.ExceptionMessage : "";
                        vm.errorMessage = responseMessage + '<br/>' + 'Temporary email was unsuccessful.' + '<br/>';
                        $scope.errorMessageMode = true;
                    }
                });

            } else {
                var warning = 'Please fill in all the required information.';
                /* This is the format of the custom logging functions from logger.js, which is injected into common.js */
                vm.errorMessage = warning;
                common.logger.logError(controllerId, log(warning));
            }

        };

        function parseErrors(response) {
            var errors = [];
            for (var key in response.data.ModelState) {
                for (var i = 0; i < response.data.ModelState[key].length; i++) {
                    errors.push(response.data.ModelState[key][i]);
                }
            }
            return errors.join("<br/>");
        }

        /* Password reset() - allows user to reset their password */
        $scope.resetPass = function (resetForm, reset, TmpCode) {
            /* check all scenarios for inputs in resetForm: blank or undefined */
            //if (reset == null) {
                var userEmail = document.getElementById("email").value == undefined ? document.getElementById("email").innerText : document.getElementById("email").value;
                var userPassword = document.getElementById("password").value == undefined ? document.getElementById("password").innerText : document.getElementById("password").value;
                var userPasswordConfirm = document.getElementById("confirmpassword").value == undefined ? document.getElementById("confirmpassword").innerText : document.getElementById("confirmpassword").value;

                reset = {};
                reset.Email = userEmail;
                reset.NewPassword = userPassword;
                reset.ConfirmPassword = userPasswordConfirm;
            //}

            vm.errorMessage = '';
            if (reset.Email != '' && reset.Email != undefined
                && reset.NewPassword != '' && reset.NewPassword != undefined
                && reset.ConfirmPassword != '' && reset.ConfirmPassword != undefined
                && TmpCode != '' && TmpCode != undefined) {
                /* consolidate reset information into 1 object by adding TmpCode (hidden input) */
                var resetInfo = {
                    Email: reset.Email,
                    TmpCode: TmpCode,
                    NewPassword: reset.NewPassword,
                    ConfirmPassword: reset.ConfirmPassword
                };
                // Clear any previous error messages.
                vm.errorMessage = "";
                $scope.errorMessageMode = false;
                /* call function to reset the password */
                resetPassword(resetInfo).then(function (response) {
                    if (response.data == null || response.status == 200) {
                        /* if we have a successful response, let's redirect the user to the login page to login and notify them of successful change */
                        $scope.resetRedirectMessageMode = true;
                        common.logger.logSuccess(controllerId, log('Password updated successfully. Redirecting to Profile Selection ...'));
                        /* after APIs validation and success, build a login info object again 
                         * and pass the email and user's new password to log them in */
                        var loginInfo = {
                            Email: resetInfo.Email,
                            Password: resetInfo.NewPassword
                        };

                        /* call logon procedure for user */
                        $scope.logon('null', loginInfo);    /* 6-30: Fine-tuning the login, done below */

                        ///* gather info from url to see if there is a tmpcode in it */
                        //var location = window.location.search;              // looking for a query string param called "tmpcode"
                        //var code = location.substring(9, location.length);  // grab the value for the code if it exists
                        //window.location = location.replace(code, '').replace('?tmpCode=', '');  //'/Thinkgate.Portal.ParentStudent.Web/index.html#/profile');
                    } else {
                        /* append a custom message to the response.data.Message if there was a server error or web error */
                        var responseMessage = parseErrors(response);
                        var completeError = responseMessage + '<br/>' + 'Update was not successful.';
                        vm.errorMessage = completeError;
                        $scope.errorMessageMode = true;
                        /* also show as toast */
                        common.logger.logError(controllerId, log(completeError));
                    }
                });

            } else {
                var errorMsg = 'Please fill in all the required information.';
                /* This is the format of the custom logging functions from logger.js, which is injected into common.js */
                vm.errorMessage = errorMsg;
                common.logger.logError(controllerId, log(errorMsg));
            }
        };

        /* nav functions and logic */
        $scope.logOff = function () {
            vm.errorMessage = '';
            logUserOff().then(function (response) {
                if (response.data == null || response.status == 200) {
                    common.logger.logSuccess(controllerId, log('Logging Off ...'));
                    window.location.href = "index.html";
                } else {
                    common.logger.logError(controllerId, log('Log off was not successful.'));
                }
            });
        }


        //#endregion


        //#region These are ng-show modes for loginMode, resetMode, and registrationMode

        /* ng-show value(s) for div "registrationMode" */
        $scope.showRegistration = function () {
            vm.errorMessage = '';
            $scope.isNewRegistration = true;
            vm.title = 'Thinkgate | Paulding County School District Parent-Student Portal Registration';
            $scope.loginMode = false;
            $scope.registrationMode = true;
        };


        /* ng-show value(s) for div "loginMode" */
        $scope.showLogin = function () {
            vm.errorMessage = '';
            vm.title = 'Thinkgate | Paulding County School District Parent-Student Portal Login';
            $scope.loginMode = true;
            $scope.registrationMode = false;
            $scope.resetMode = false;
        };

        /* ng-show value(s) for div "resetMode" */
        $scope.showReset = function () {
            vm.errorMessage = '';
            $scope.isNewRegistration = false;
            vm.title = 'Thinkgate | Paulding County School District Parent-Student Portal Reset Password';
            $scope.loginMode = false;
            $scope.registrationMode = true;
            $scope.resetMode = false;
        };

        /*this was to try to hide login page and show the shell */
        $scope.shellview = function () {
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = false;
            $scope.shellMode = true;
        };
        //#endregion

        /* nav functions and logic */
        //$scope.logOff = function () {
        //    vm.errorMessage = '';
        //    logUserOff().then(function (response) {
        //        if (response.data == null || response.status == 200) {
        //            //$window.sessionStorage.removeItem('token');
        //            common.logger.logSuccess(controllerId, log('Logging off ...'));
        //            window.location.href = "index.html";
        //        } else {
        //            common.logger.logError(controllerId, log('Log off was not successful.'));
        //        }
        //    });
        //}

        ///* logs off user - navbar link */
        //function logUserOff() {
        //    return datacontext.getLogOff().then(function (data) { return data; });
        //};

        function getQueryStringValue(key) {
            return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }
    };
})();

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', { 'packages': ['corechart'] });