(function() {
    'use strict';

    var serviceId = 'entityMngrFactory';
    angular.module('app').factory(serviceId, ['config', 'common', '$resource', '$http', 'serviceHelperFactory', entityMngrFactory]);

    function entityMngrFactory(config, common, $resource, $http, serviceHelperFactory) {

        //#region  Login functions
        var token = serviceHelperFactory.AuthorizationToken;
        var accountLogOff = serviceHelperFactory.AccountLogOff;
        var accountResetPassword = serviceHelperFactory.AccountResetPassword;
        var accountTemporaryPassword = serviceHelperFactory.AccountTemporaryPassword;
        //#endregion


        //#region Student API call references

        /* student details retrieval */
        var studentList = serviceHelperFactory.StudentList;
        var profile = serviceHelperFactory.StudentProfile;
        var checklist = serviceHelperFactory.Checklist;
        var checklistUpdate = serviceHelperFactory.ChecklistUpdate;

        /* Other */
        var client = serviceHelperFactory.Client;
        var links = serviceHelperFactory.Links;
        var passwordRequirements = serviceHelperFactory.PasswordRequirements;
        //#endregion

        var buildFormData = function(formData) {
            var dataString = '';
            for (var prop in formData) {
                if (formData.hasOwnProperty(prop)) {
                    dataString += (prop + '=' + formData[prop] + '&');
                }
            }
            return dataString.slice(0, dataString.length - 1);
        };

        //#region Define the functions and properties to reveal.
        var service = {
            /* login functions */
            getToken: login, // regular login
            getRegistration: registerUser, // first time user
            getTempPass: tempPassword, // TemporaryPassword,
            getResetPass: resetPassword, // ResetPassword,
            getLogOff: logOff, // LogOff 

            /* profile functions */
            getStudentProfile: studentProfile,
            getStudents: getStudentList,
            getChecklist: getChecklist,

            /* Others */
            getClient: getClient,
            getLinks: getLinks,
            getPasswordRequirements:getPasswordRequirements,

            updateChecklist: updateChecklist
    };
        return service;

        //#endregion


        //#region Login Activities
        function login(userlogin) {
            var formData = { username: userlogin.Email, password: userlogin.Password, grant_type: 'password' };
            return token.requestToken(buildFormData(formData), function(data) {
                serviceHelperFactory.setAuthorizationHeader(data);
            }).$promise;
        }

        function registerUser(userRegistration) {
            userRegistration.client = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname.split('/')[1] + "/";
            var registration = accountTemporaryPassword.requestCall(userRegistration);
            return registration.$promise;
        }

        function resetPassword(reset) {
            reset.client = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname.split('/')[1] + "/";
            return accountResetPassword.requestCall(reset).$promise;
        }

        function tempPassword(reset) {
            reset.client = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname.split('/')[1] + "/";
            return accountTemporaryPassword.requestCall(reset).$promise;
        }

        function logOff() {
            return accountLogOff.requestCall().$promise;
        }

        //#endregion


        //#region Student Functions

        function getStudentList() {
            return studentList.requestCall().$promise;
        }

        function studentProfile(s) {
            return profile.requestCall(s).$promise;
        }
        function getChecklist(s) {
            return checklist.requestCall(s).$promise;
        }

        //#endregion

        function getClient(s) {
            return client.requestCall(s).$promise;
        }

        function getPasswordRequirements() {
            return passwordRequirements.requestCall().$promise;
        }

        function getLinks() {
            return links.requestCall().$promise;
        }

        function updateChecklist(list) {
            return checklistUpdate.requestCall(list).$promise;
        }
    }
})();