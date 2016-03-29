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

        var service = {

            /* Portal-Specific functions for Students and Profile */
            getStudents: getStudents,
            getStudentProfile: getStudentProfile,
            getChecklist: getChecklist,

            /* Login functions */
            getLoginCreds: getLoginCreds,
            getRegistration: getRegistration,
            getPasswordReset: getPasswordReset,

            /* Others */
            getClient: getClient,
            getLinks: getLinks,
            getPasswordRequirements:getPasswordRequirements,

            updateChecklist: updateChecklist,
            getLogOff: logOff
    };

        return service;
    
        function getMessageCount() { return $q.when(16); }

        function getLoginCreds(userlogin) {
            var userInfo = entityMngrFactory.getToken(userlogin).then(function (data) {
                $location.path('/profile');
                return userInfo = data;
            },function(errorResponse) {
                return userInfo = errorResponse;
            })
            return $q.when(userInfo);
        }

        function getRegistration(registration) {
            var registerInfo = entityMngrFactory.getRegistration(registration).then(function (data) {
                return registerInfo = data;
            }, function (errorResponse) {
                return registerInfo = errorResponse;
            })
            return $q.when(registerInfo);
        }

        function getPasswordReset(reset) {
            var resetInfo = entityMngrFactory.getResetPass(reset).then(function(data) {
                return resetInfo = data;
            }, function(errorResponse) {
                return resetInfo = errorResponse;
            });
            return $q.when(resetInfo);
        }

        function getStudentProfile(s) {     
            var details = entityMngrFactory.getStudentProfile(s);
            return $q.when(details);
        }

        function getStudents() {
            var students = entityMngrFactory.getStudents();
            return $q.when(students);
        }
        function getChecklist(s) {
            var checklist = entityMngrFactory.getChecklist(s);
            return $q.when(checklist);
        }

        function getClient(s) {
        	var client = entityMngrFactory.getClient(s);
        	return $q.when(client);
        }
        function getPasswordRequirements() {
            var requirements = entityMngrFactory.getPasswordRequirements();
            return $q.when(requirements);
        }

        function getLinks() {
            var links = entityMngrFactory.getLinks();
            return $q.when(links);
        }

        function updateChecklist(list) {
            var list = entityMngrFactory.updateChecklist(list);
            return $q.when(list);
        }

        function logOff() {
            var logOffSuccess = entityMngrFactory.getLogOff();
            return $q.when(logOffSuccess);
        }
    }
})();