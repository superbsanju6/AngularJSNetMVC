(function () {
    'use strict';
     
    var serviceId = 'serviceHelperFactory';

    // TODO: refactor out app to parentStudentPortal...
    angular.module('app').factory(serviceId, ['$http', '$resource', '$location', serviceHelperFactory]);

    function serviceHelperFactory($http, $resource, $location) {
        //var baseUrl = 'http://localhost/thinkgate.portal.parentstudent.api/';
        var baseUrl = $location.protocol() + "://" + $location.host() + "/Thinkgate.Portal.ParentStudent.api/";

        //#region API data call retrievals for Login Activities

        return {
            AuthorizationToken: $resource(baseUrl + 'token', null,
            {
                requestToken: { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            }),

            AccountTemporaryPassword: $resource(baseUrl + 'api/Account/TemporaryPasswordGuid', null,
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

            StudentProfile: $resource(baseUrl + 'api/Student/GetStudentProfileCounselor', null,
            {
                requestCall: { method: 'post' }
            }),
            Checklist: $resource(baseUrl + 'api/Student/GetChecklist', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),
            ChecklistUpdate: $resource(baseUrl + 'api/Student/SaveChecklistItem', null,
            {
                requestCall: { method: 'post' }
            }),
            Client: $resource(baseUrl + 'api/Client/GetClient', null,
            {
                requestCall: {
                    method: 'post',
                    params: { client: '@client' }
                }
            }),
            PasswordRequirements: $resource(baseUrl + 'api/Client/GetPasswordRequirements', null,
            {
                requestCall: { method: 'post', isArray: false }
            }),
            Links: $resource(baseUrl + 'api/Resource/GetResourceLinks', null,
            {
                requestCall: { method: 'post', isArray: true }
            }),
            //#endregion

            setAuthorizationHeader: function(data) {
                $http.defaults.headers.common.Authorization = "Bearer " + data.access_token;
            }
        };
    }
})();