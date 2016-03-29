(function () {
    'use strict';
    var controllerId = 'students';
    angular.module('app').controller(controllerId, ['common', 'datacontext', students]);

    function students(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        
        /* objects for page */
        vm.academicAlerts = [];
        vm.nonacademicAlerts = [];
        vm.student = [];

        /* student properites to display data for student profile */
        vm.student = {
            id: 3, // student id, hard coded at the moment
            fname: 'Derrick', // string holds first name
            lname: 'Williams', // string holds last name
            /* use <img data-ng-src='vm.student.imgUrl'></img> 
             * Allows Angular time to replace {{vm.student.imgUrl}} with 
             * image. AnguarJS configures before run (app.config)->(app.run) */
            imgUrl: 'content/images/blankperson.png', // students img url from db field
            alerts: []
        };

        /* page labels */
        vm.page = {
            academic: 'Alerts | Academic',
            non: 'Alerts | Non-Academic'
        };

        activate();

        function activate() {
            var promises = [/*getAcademicAlerts(), getNonAcademicAlerts(), getStudent(s)*/];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Student Alerts View'); });
        }

        /* get alerts */
        function getAcademicAlerts() {
            return datacontext.getAcademicAlerts(function (data) {
                return vm.academicAlerts = data;
            });
        }

        function getNonAcademicAlerts() {
            return datacontext.getNonAcademicAlerts(function (data) {
                return vm.nonacademicAlerts = data;
            });
        }

        function getStudent(s) {
            return datacontext.getStudentProfile(s).then(function (data) {
                return vm.students = data;
            });
        }
    }
})();