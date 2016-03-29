(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['common', 'entityMngrFactory', 'loginService', '$location', datacontext]);

    function datacontext(common, entityMngrFactory, loginService, $location) {

        /* common logging functions */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');

        var $q = common.$q;

        //#region services that datacontext uses

        var service = {

            /* Portal-Specific functions for Students and Profile */
            getStudents: getStudents,
            getStudentProfile: getStudentProfile,
            getCourses: getCourses,
            getAttendance: getAttendance,

            /* Assessment functions */
            getAssessmentScores: getAssessmentScores,
            getAssessmentProficiency: getAssessmentProficiency,
            getAssessmentStandard : getAssessmentStandard,

            /* Alerts */
            getAcademicAlerts: getAcademicAlerts,
            getNonAcademicAlerts: getNonAcademicAlerts,

            /* Login functions */
            getLoginCreds: getLoginCreds,
            getRegistration: getRegistration,
            getPasswordReset: getPasswordReset,
            getLogOff: getLogOff,

            /* Others */
            getLinks: getLinks,
            getClient: getClient,
            saveAlertAcknowledgement: saveAlertAcknowledgement,
            setAssessmentProficiencyReportURL: setAssessmentProficiencyReportURL,
            getAttachmentLinks : getAttachmentLinks

        };

        return service;

        //#endregion


        //#region methods: populates messageCount and people (hard-coded dumby-data)        
        function getMessageCount() { return $q.when(16); }


        //#endregion


        //#region Login Activities  (getLoginCreds, getRegistration, getPasswordReset)

        /* login to application using email and password (for existing, valid users) */

        function getLoginCreds(userlogin) {
            var userInfo = entityMngrFactory.getToken(userlogin).then(function (data) {                
                return userInfo = data;
            }, function (errorResponse) {
                return userInfo = errorResponse;
            })
            return $q.when(userInfo);
        }

        function setAssessmentProficiencyReportURL(params) {
            return entityMngrFactory.setAssessmentProficiencyReportURL(params);
        }

        /* register user email and send temp password - initial version of function */
        //function getRegistration(registration) {
        //    var tempKey = entityMngrFactory.getRegistration(registration).then(function(data) {
        //        return tempKey = data;
        //    });
        //    return $q.when(tempKey);

        //}

        /* register user email and send temp password */
        function getRegistration(registration) {
            var registerInfo = entityMngrFactory.getRegistration(registration).then(function (data) {
                return registerInfo = data;
            }, function (errorResponse) {
                return registerInfo = errorResponse;
            })
            return $q.when(registerInfo);
        }




        /* reset user password using SMTP */
        function getPasswordReset(reset) {
            var resetInfo = entityMngrFactory.getResetPass(reset).then(function (data) {
                return resetInfo = data;
            }, function (errorResponse) {
                return resetInfo = errorResponse;
            });
            return $q.when(resetInfo);
        }

        function getLogOff() {
            return entityMngrFactory.getLogOff();
        }

        //#endregion

        //#region Student Details retrieval
        /* student's profile */
        function getStudentProfile(s) {
            var details = entityMngrFactory.getStudentProfile(s);
            return $q.when(details);
        }
        /* student's course list */
        function getCourses(s) {
            var courses = entityMngrFactory.getCourses(s);
            return $q.when(courses);
        }
        /* student's attendance */
        function getAttendance(s) {
            var attendance = entityMngrFactory.getAttendance(s);
            return $q.when(attendance);
        }
        /* student list */
        function getStudents() {
            var students = entityMngrFactory.getStudents()
            return $q.when(students);
        }

        //#endregion

        //#region Functions for Assessments
        /* Assessment Scores */
        function getAssessmentScores(s) {
            var scores = entityMngrFactory.getAssessmentScores(s);
            return $q.when(scores);
        }

        
        /* Assessment Proficiency */
        function getAssessmentProficiency(s) {
            var proficiency = entityMngrFactory.getAssessmentProficiency(s);
            return $q.when(proficiency);
        }

        function getAssessmentStandard(s)
        {
            var standards = entityMngrFactory.getAssessmentStandard(s);
            return $q.when(standards);
        }

        //#endregion

        //#region Student Alerts functions
        /* Academic Alerts */
        function getAcademicAlerts(s) {
            var academicAlerts = entityMngrFactory.getAcademicAlerts(s);
            return $q.when(academicAlerts);
        }


        function getClient(s) {
            var client = entityMngrFactory.getClient(s);
            return $q.when(client);
        }

        /* Non-Academic Alerts */
        function getNonAcademicAlerts(s) {
            var nonAcademicAlerts = entityMngrFactory.getNonAcademicAlerts(s);
            return $q.when(nonAcademicAlerts);
        }
        //#endregion

        /* Non-Academic Alerts */
        function getLinks(s) {
            var Links = entityMngrFactory.getLinks(s);
            return $q.when(Links);
        }

        function getAttachmentLinks(s)
        {
            return entityMngrFactory.getAttachmentLinks(s);
        }

        /* Save alert acknowledgement */
        function saveAlertAcknowledgement(s) {
            var alertAcknowledged = entityMngrFactory.saveAlertAcknowledgement(s);
            return $q.when(alertAcknowledged);
        }
    }
})();