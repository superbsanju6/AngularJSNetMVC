(function () {
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
        var courseList = serviceHelperFactory.courseList;
        var attendanceList = serviceHelperFactory.attendanceList;

        /* assessment details retrieval */
        var scores = serviceHelperFactory.AssessmentScores;
        var proficiency = serviceHelperFactory.AssessmentProficiency;
        var standard = serviceHelperFactory.AssessmentStandard;

        /* Other */
        var links = serviceHelperFactory.Links;
        var client = serviceHelperFactory.Client;
        var attachmentLinks = serviceHelperFactory.resourceLinksAttachment;
        //#endregion


        //#region Alert API call references

        /* alerts details retrieval */
        var alertsAcademic = serviceHelperFactory.AcademicAlerts;
        var alertsNonAcademic = serviceHelperFactory.NonAcademicAlerts;
        var alertAcademicAcknowledgementSave = serviceHelperFactory.SaveAcademicAlert;

        //#endregion

        var buildFormData = function (formData) {
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
            getCourses: getCourses,
            getAttendance: getAttendance,

            /* assessment functions */
            getAssessmentScores: assessmentScores,
            getAssessmentProficiency: assessmentProficiency,
            getAssessmentStandard: assessmentStandard,

            /* alert functions */
            getAcademicAlerts: academicAlerts,
            getNonAcademicAlerts: nonAcademicAlerts,

            /* Others */
            getLinks: getLinks,
            getClient: getClient,
            saveAlertAcknowledgement: saveAlertAcknowledgement,
            setAssessmentProficiencyReportURL: setAssessmentProficiencyReportURL,
            getAttachmentLinks : setAttachmentLinks
        };
        return service;
        //#endregion


        //#region Login Activities
        function login(userlogin) {
            var formData = { username: userlogin.Email, password: userlogin.Password, grant_type: 'password' };
            return token.requestToken(buildFormData(formData), function (data) {
                serviceHelperFactory.setAuthorizationHeader(data);

            }).$promise;
        }

        function setAssessmentProficiencyReportURL(params) {
            return serviceHelperFactory.assessmentProficiencyReportURL(params);
        }

        function registerUser(userRegistration) {
            var registration = accountTemporaryPassword.requestCall(userRegistration);
            return registration.$promise;
        }

        function resetPassword(reset) {
            return accountResetPassword.requestCall(reset).$promise;
        }

        function tempPassword(reset) {
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

        function getCourses(s) {
            return courseList.requestCall(s).$promise;
        }
        function getAttendance(s) {
            return attendanceList.requestCall(s).$promise;
        }
        //#endregion

        //#region Assessment Functions

        function assessmentScores(s) {
            return scores.requestCall(s).$promise;
        }

        function assessmentProficiency(s) {
            return proficiency.requestCall(s).$promise;
        }

        function assessmentStandard(s) {
            return standard.requestCall(s).$promise;
        }

        //#endregion

        //#region Alert Functions
        function academicAlerts(s) {
            return alertsAcademic.requestCall(s).$promise;
        }

        function nonAcademicAlerts(s) {
            return alertsNonAcademic.requestCall(s).$promise;
        }

        //#endregion

        function getLinks(s) {
            return links.requestCall(s).$promise;
        }

        function setAttachmentLinks(s)
        {
            return serviceHelperFactory.resourceLinksAttachment(s);
        }

        function getClient(s) {
            return client.requestCall(s).$promise;
        }

        function saveAlertAcknowledgement(s) {
            return alertAcademicAcknowledgementSave.requestCall(s).$promise;
        }
    }

})();