(function () {
    'use strict';

    var controllerId = 'loginpage';
    angular.module('app').controller(controllerId, ['common', '$scope', '$location', '$window', 'datacontext', loginpage]);

    //#region  Controller Properties

    /* loginpage function with dependency injections */
    function loginpage(common, $scope, $location, $window, datacontext) {
        /* common logger functions to initiate controller */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        /* logSucces and logError functions and success/error messages to be displayed by toastr */
        var logSuccess = getLogFn(controllerId, 'success');
        var logError = getLogFn(controllerId, 'error');
        var successMsg = 'You are now successfully logged into Thinkgate Parent-Student Portal';
        var errorMsg = '[Login Error] Please check your spelling and confirm you are registered';

        /* using "controller as" functionality. Want to set 'this' controller equal to vm for easy referencing */
        var vm = this;
        /* view model properties */
        vm.data_token = null;
        vm.tempPass = [];
        vm.resetCode = [];
        vm.news = {
            title: 'Please Enter Your Credentials',
            description: 'Parent-Student Login Page'
        };
        vm.title = 'Thinkgate | Parent-Student Portal Login Page...';

        //vm.isCurrent = isCurrent;
        
        /* activate() function: gathers all promises for page */
        activate();

        // data-ng-show for 3 main views of loginpage
        $scope.loginsection = true;     // entire loginsection: container for all modes
        $scope.loginMode = true;        // loginMode
        $scope.registrationMode = false;// registrationMode
        $scope.resetMode = false;       // resetMode
        $scope.shellview = false;       // will be shellMode once I integrate the two controllers
       
        //#endregion


        //#region Activation for Controller: activate() - calls all configurations and returns promises before running the controller

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Login Page View'); });
        };

        //#endregion


        //#region  Functions for login actions: getToken, getTempPassword, and resetPassword

        /* **NOTE**: All functions processed via datacontext -> entityMngrFactory -> serviceHelperFactory */

        /* gets authorization token */
        function getToken(userlogin) {
            return datacontext.getLoginCreds(userlogin).then(function (data) {
                return vm.data_token = data;
            });
        };

        /* gets temporary password */
        function getTempPassword(registration) {
            return datacontext.getRegistration(registration).then(function(data) {
                return vm.tempPass = data;
            });
        };

        /* get reset code to log in */
        function resetPassword(reset) {
            return datacontext.getPasswordReset(reset).then(function (data) {
                return vm.resetCode = data;
            });
        }
        //#endregion


        //#region Contains: 3 page scope functions. Gathers user input, passes to applicable function for the login action

        /* submit() - this is regular login for existing user */
        $scope.logon = function(loginForm, userlogin) {
            if (userlogin.Email && userlogin.Password && userlogin != 'undefined') {
                //alert('Inside submit function, user is: ' + userlogin.Email + 'password is: ' + userlogin.Password);
                getToken(userlogin);
                
                if (vm.data_token != null && vm.data_token != undefined) {
                    $scope.loginsection = false;
                    $scope.registrationMode = false;
                    $scope.loginMode = false;
                    $scope.registrationMode = false;
                    $scope.resetMode = false;
                    
                    //common.logger.getLogFn(controllerId, log('You are Authenticated'));
                    $location.path('/profile');
                } else {
                    logError();
                }
            } else {
                alert('Please enter your login information');
                $scope.email.focus();
            }
        };

        /* First Time register() - user enters email address, API sends a temporary password */
        $scope.register = function(registrationForm, registration) {

            //alert('User: ' + registration.Email);// + ' Password: ' + registration.Password);
            var creds = getTempPassword(registration);
            $scope.loginsection = false;
            $scope.registrationMode = false;
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = false;
        };

        /* Password reset() - allows user to reset their password */
        $scope.resetPass = function(resetForm, reset) {
            //alert('Email: ' + reset.Email + 'Code: ' + reset.TmpCode + 'New Password: ' + reset.NewPassword + 'Confirmed Password: ' + reset.ConfirmPassword);
            var creds = resetPassword(reset);
            $scope.loginsection = false;
            $scope.registrationMode = false;
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = false;
        };
        //#endregion


        //#region These are ng-show modes for loginMode, resetMode, and registrationMode

        /* ng-show value(s) for div "registrationMode" */
        $scope.showRegistration = function () {
            vm.title = 'Thinkgate | Parent-Student Portal Registration Page';
            $scope.loginMode = false;
            $scope.registrationMode = true;
        };


        /* ng-show value(s) for div "loginMode" */
        $scope.showLogin = function () {
            vm.title = 'Thinkgate | Parent-Student Portal Login Page';
            $scope.loginMode = true;
            $scope.registrationMode = false;
            $scope.resetMode = false;
        };

        /* ng-show value(s) for div "resetMode" */
        $scope.reset = function () {
            vm.title = 'Thinkgate | Parent-Student Portal Login Reset';
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = true;
        };

        /*this was to try to hide login page and show the shell */
        $scope.shellview = function () {
            $scope.loginMode = false;
            $scope.registrationMode = false;
            $scope.resetMode = false;
            $scope.shellMode = true;
        };

        //#endregion


        // this is to clear the boxes when the page is loaded
        function clearInfo() {
           
         
        };


    };
})();