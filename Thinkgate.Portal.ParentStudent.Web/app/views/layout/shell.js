(function () {
    'use strict';

    var controllerId = 'shell';
    angular.module('app').controller(controllerId,
        ['$rootScope', '$scope', '$location', '$window', 'common', 'datacontext', 'config', shell]);

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
        var successMsg = '[Login]: Successful | Thinkgate Parent-Student Portal...';
        var errorMsg = '[Login]: Error | Please Check Spelling and Confirm You Are Registered User...';

        /* log functions : Specific success/error messages displayed by toastr for login fields */
        var emailWarning = 'Please Enter Your Email Address In Order To Validate User Credentials';
        var passwordWarning = 'Please Enter Your Password In Order To Validate User Credentials';
        var generalWarning = 'Please Enter All Required Information In Order To Login Successfully. ';

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
        vm.isRegister = false;
        /* login server error - error message displayed by a binded alert-error message */
        vm.errorMessage = 'The Information You Entered For Your Email Or Password Was Invalid. Please Check Your Spelling And Try Again...';
        $scope.errorMessageMode = false;    // hide alert screen error message initially until called upon

        /* redirection info for reset password - displayed by a binded alert-info message */
        vm.redirectMessage = 'Password Update Was Successful. Now Logging You In And Redirecting You To Profile Selection Page.'
        $scope.resetRedirectMessageMode = false;    // hide reset-redirection div initially until called upon

        /* page titles if needed */
        vm.news = {
            title: 'Please Enter Your Credentials',
            description: 'Parent-Student Login Page'
        };

        /* gather info from url to see if there is a tmpcode in it */
        var location = window.location.search;              // looking for a query string param called "tmpcode"
        var code = location.substring(9, location.length);  // grab the value for the code if it exists

        /* check for tmpcode, if there is tmpcode, set template to show reset mode and vm.title to resetMode value */
        if (code.length > 0) {
            /* Set the widget title accordingly */
            vm.title = 'Thinkgate | Parent-Student Portal Reset Password Page';

            // setup view modes accordingly for loginpage
            $scope.loginpageMode = true;        // entire wrapper
            $scope.loginsection = true;         // entire loginsection: container for all modes
            //$scope.loginMode = false;         // hide regular loginMode
            //$scope.registrationMode = false;  // hide registrationMode
            $scope.resetMode = true;            // show resetMode
            $scope.sidebarMode = false;         // hide sidebar

            /* set hidden input = url parameter: tmpcode */
            $scope.TmpCode = code;

        } else {
            /* if regular app start (not from email to reset password), setup page accordingly */
            vm.title = 'Thinkgate | Parent-Student Portal Login Page';
            $scope.loginpageMode = true;
            $scope.loginsection = true;
            $scope.loginMode = true;
            $scope.registrationMode = false;
            $scope.showReset = true;

            /* sidebar.html is included in shell, needs to be hidden */
            $scope.sidebarMode = false;
        }

        //#endregion

        //#region general application config setup
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
            common.activateController([], controllerId);
            var t = 'true';

            getClient();
        }

        /* get client */
        function getClient() {
            var pathArray = window.location.pathname.split('/');
            var clientPath = { client: pathArray[1] };
            $rootScope.client = window.location.protocol + "//" + window.location.host + window.location.pathname;

            return datacontext.getClient(clientPath).then(function (data) {
                //alert("data: " + JSON.stringify(data));
                return vm.client = data;
            });
        }

        function toggleSpinner(on) { vm.isBusy = on; }

        $rootScope.$on('$routeChangeStart',
            function (event, next, current) { toggleSpinner(true); }
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
            return datacontext.getLoginCreds(userlogin).then(function (data) { return data; });
        };

        /* gets temporary password */
        function getTempPassword(registration) {
            return datacontext.getRegistration(registration).then(function (data) {
                return vm.tempPass = data;
            });
        };

        /* get reset code to log in */
        function resetPassword(resetInfo) {
            return datacontext.getPasswordReset(resetInfo).then(function (data) {
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
            /* check all scenarios for login information ONLY because we 
             * need to provide specific info for client and server side errors */
            vm.isBusy = true;
            if ((userlogin != undefined) &&
                (userlogin.Email != null && userlogin.Email != '' && userlogin.Email != undefined) &&
                (userlogin.Password != null && userlogin.Password != '' &&
                (userlogin.Email != undefined))) {
                /* this logs the user in and checks for response, if not 200, checks the response.data */
                getToken(userlogin).then(function (response) {
                    if ((response.data == undefined || response.status == 200) && response.access_token != null && response.access_token != '') {                        
                        datacontext.getStudents().then(function (data) {
                            $rootScope.studentProfiles = data;

                            if (data.length != 0) {
                                $scope.loginpageMode = true;
                                $scope.loginsection = false;
                                $scope.registrationMode = false;
                                $scope.loginMode = false;
                                $scope.registrationMode = false;
                                $scope.resetMode = false;
                                $scope.userName = response.userName;
                                $scope.userRole = response.userRole;

                                if (data.length == 1) {
                                    $rootScope.CurrentStudent = _.first(data);
                                    $location.path('/dashboard/' + $rootScope.CurrentStudent.Id);
                                }                               
                                else
                                    $location.path('/profile');
                            }
                            else
                            {
                                /* setup the view's errorMessage and pageMode accordingly, then log server response */
                                vm.errorMessage = 'Your access has been disabled.  Please contact your school.';
                                $scope.errorMessageMode = true;
                                common.logger.logError(controllerId, log(vm.errorMessag));
                            }

                            vm.isBusy = false;
                        });

                    } else {
                        vm.isBusy = false;
                        /* setup the view's errorMessage and pageMode accordingly, then log server response */
                        vm.errorMessage = 'Login was unsuccessful.' + ' ' + response.data.error_description;
                        $scope.errorMessageMode = true;
                        common.logger.logError(controllerId, log(response.data.error_description));
                    }
                });

                /* conditions for incomplete or invalid UI entry scenarios */
            } else if (userlogin == undefined || userlogin == null) {
                vm.isBusy = false;
                /* general error for insufficient info entered */
                vm.errorMessage = generalWarning + ' ' + 'You Will Need To Enter A Valid Email And Password For This.';
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(generalWarning));
                /* Email */
            } else if ((userlogin.Email == '' ||
                        userlogin.Email == null ||
                        userlogin.Email == undefined) &&
                       (userlogin.Password)) {
                vm.isBusy = false;
                /* change value of vm.errorMessage accordingly */
                vm.errorMessage = 'Valid Email Is Required For Successful Login. ' + emailWarning;
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(emailWarning));
                /* Password */
            } else if ((userlogin.Password == '' || userlogin.Password == null || userlogin.Password == undefined) &&
                       (userlogin.Email)) {
                vm.isBusy = false;
                vm.errorMessage = 'Required Information Missing. ' + passwordWarning;
                $scope.errorMessageMode = true;
                common.logger.logError(controllerId, log(passwordWarning));
            }
        };

        /* First Time register() - user enters email address, API sends a temporary password */
        $scope.register = function (registrationForm, registration) {
            vm.isRegister = true;
            if (registration != null && registration != 'undefined'
                && registration.Email) {
                registration.client = $rootScope.client;
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
                        vm.isRegister = false;
                    } else {
                        var responseMessage = parseErrors(response);

                        /* setup the view's errorMessage and pageMode accordingly, then log server response */
                        vm.errorMessage = 'Temporary Email was unsuccessful.' + ' ' + responseMessage;
                        $scope.errorMessageMode = true;
                        vm.isRegister = false;
                    }
                });
            } else {
                var warning = 'Please Fill In All Information';
                vm.isRegister = false;
                /* This is the format of the custom logging functions from logger.js, which is injected into common.js */
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
            return errors;
        };
        /* Password reset() - allows user to reset their password */
        $scope.resetPass = function (resetForm, reset, TmpCode) {
            /* check all scenarios for inputs in resetForm: blank or undefined */
            if (reset.Email != '' && reset.Email != undefined
                && reset.NewPassword != '' && reset.NewPassword != undefined
                && reset.ConfirmPassword != '' && reset.ConfirmPassword != undefined
                && TmpCode != '' && TmpCode != undefined
                && reset != undefined) {
                /* consolidate reset information into 1 object by adding TmpCode (hidden input) */
                var resetInfo = {
                    Email: reset.Email,
                    TmpCode: TmpCode,
                    NewPassword: reset.NewPassword,
                    ConfirmPassword: reset.ConfirmPassword
                };

                /* call function to reset the password */
                resetPassword(resetInfo).then(function (response) {
                    if (response.data == null || response.status == 200) {
                        /* if we have a successful response, let's redirect the user to the login page to login and notify them of successful change */
                        $scope.resetRedirectMessageMode = true;
                        common.logger.logSuccess(controllerId, log('Password Update Was Successful. Now Logging In And Redirecting To Profile Selection...'));
                        /* after APIs validation and success, build a login info object again 
                         * and pass the email and user's new password to log them in */
                        var loginInfo = {
                            Email: resetInfo.Email,
                            Password: resetInfo.NewPassword
                        };

                        /* call logon procedure for user */
                        $scope.logon(null, loginInfo);    /* 6-30: Fine-tuning the login, done below */

                        ///* gather info from url to see if there is a tmpcode in it */
                        //var location = window.location.search;              // looking for a query string param called "tmpcode"
                        //var code = location.substring(9, location.length);  // grab the value for the code if it exists
                        //window.location = location.replace(code, '').replace('?tmpCode=', '');  //'/Thinkgate.Portal.ParentStudent.Web/index.html#/profile');
                    } else {
                        var responseMessage = parseErrors(response);
                        /* append a custom message to the response.data.Message if there was a server error or web error */
                        var completeError = responseMessage + '. Update was not successful.';
                        vm.errorMessage = completeError;
                        $scope.errorMessageMode = true;
                        /* also show as toast */
                        common.logger.logError(controllerId, log(completeError));
                    }
                });

            } else {
                var errorMsg = 'Please Fill In All Information';
                /* This is the format of the custom logging functions from logger.js, which is injected into common.js */
                common.logger.logError(controllerId, log(errorMsg));
            }
        };

        /* nav functions and logic */
        $scope.logOff = function () {
            logUserOff().then(function (response) {
                if (response.data == null || response.status == 200) {
                    common.logger.logSuccess(controllerId, log('Logging Off...'));
                    window.location.href = "index.html";
                } else {
                    common.logger.logError(controllerId, log('Log Off Was Not Successful'));
                }
            });
        };


        //#endregion


        //#region These are ng-show modes for loginMode, resetMode, and registrationMode

        /* ng-show value(s) for div "registrationMode" */
        $scope.showRegistration = function () {
            vm.title = 'Parent-Student Portal | Obtain Temporary Code For Password Reset';
            $scope.loginMode = false;
            $scope.registrationMode = true;
            $scope.errorMessageMode = false;
        };


        /* ng-show value(s) for div "loginMode" */
        $scope.showLogin = function () {
            vm.title = 'Parent-Student Portal | User Login Page';
            $scope.loginMode = true;
            $scope.registrationMode = false;
            $scope.resetMode = false;
            $scope.errorMessageMode = false;
        };

        /* ng-show value(s) for div "resetMode" */
        $scope.showReset = function () {
            vm.title = 'Parent-Student Portal | Reset Password Page';
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = true;
            $scope.errorMessageMode = false;
        };

        /*this was to try to hide login page and show the shell */
        $scope.shellview = function () {
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = false;
            $scope.shellMode = true;
            $scope.errorMessageMode = false;
        };

        //#endregion
    }
})();

// Load the Visualization API and the piechart package.
google.load('visualization', '1.0', { 'packages': ['corechart'] });