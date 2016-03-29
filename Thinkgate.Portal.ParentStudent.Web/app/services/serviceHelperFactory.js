(function () {
    'use strict';
     
    var serviceId = 'serviceHelperFactory';

    // TODO: refactor out app to parentStudentPortal...
    angular.module('app').factory(serviceId, ['$http', '$resource', 'config', 'common', '$location', serviceHelperFactory]);

    function serviceHelperFactory($http, $resource, config, common, $location) {

        //var baseUrl = 'http://localhost/';  //common.apiurl;
        //var buildUrl = function (resourceUrl) {
        //    if (resourceUrl.lastIndexOf('/') !== resourceUrl.length - 1) {
        //        resourceUrl += "/";
        //    }

        //    return baseUrl + resourceUrl;
        //};

        var baseUrl = $location.protocol() + "://" + $location.host() + "/Thinkgate.Portal.ParentStudent.api/";

        //var baseUrl = 'http://localhost/Thinkgate.Portal.ParentStudent.api/';

        //#region API data call retrievals for Login Activities

        return {
            AuthorizationToken: $resource(baseUrl + 'token', null,
            {
                requestToken: { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            }),

            AccountTemporaryPassword: $resource(baseUrl + 'api/Account/TemporaryPassword', null,
            {
                requestCall: { method: 'post' }
            }),

            AccountResetPassword: $resource(baseUrl + 'api/Account/ResetPassword', null,
            {
                requestCall: { method: 'POST' }
            }),

            AccountLogOff: $resource(baseUrl + 'api/Account/LogOff', null,
            {
                requestCall: { method: 'POST' }
            }),

            //#endregion

            //#region API data call retrievals 
            StudentList: $resource(baseUrl + 'api/Student/GetStudentList', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),

            StudentProfile: $resource(baseUrl + 'api/Student/GetStudentProfile', null,
            {     
                requestCall: { method: 'post' }
            }),

            courseList: $resource(baseUrl + 'api/Student/GetCourseList', null,
            {      
                requestCall: { method: 'post', isArray: true }
            }),

            attendanceList: $resource(baseUrl + 'api/Student/GetStudentAttendance', null,
            {      
                requestCall: { method: 'post', isArray: true }
            }),

            AssessmentScores: $resource(baseUrl + 'api/Assessment/GetAssessmentScoring', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),
                                                                                       
            AssessmentProficiency: $resource(baseUrl + 'api/Assessment/GetAssessmentProficiency', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),

            AssessmentStandard: $resource(baseUrl + 'api/Assessment/GetAssessmentStandard', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),

            AcademicAlerts: $resource(baseUrl + 'api/Alert/GetAcademicAlerts', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),
            SaveAcademicAlert: $resource(baseUrl + 'api/Alert/SaveAcademicAlert', null, {
                requestCall: { method: 'post' }
            }),

            NonAcademicAlerts: $resource(baseUrl + 'api/Alert/GetNonAcademicAlerts', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),

            Links: $resource(baseUrl + 'api/Resource/GetResourceLinks', null,
           {
               requestCall: { method: 'post', isArray: true }
           }),

		    Client: $resource(baseUrl + 'api/Client/GetClient', null,
		    {
			    requestCall: {
				    method: 'post', params:{client:'@client'}}
           }),

		    assessmentProficiencyReportURL : function(s)
		    {
		        return   'Handler/AssessmentReportCard.aspx?' + $.param(s);
		    },

		    resourceLinksAttachment : function(s)
		    {
		        return baseUrl + 'api/Account/GetAttachment?guid='+ s;
		    },

            //#endregion
            setAuthorizationHeader: function (data) {
                $http.defaults.headers.common.Authorization = "Bearer " + data.access_token;
            }
        };
    }
})();