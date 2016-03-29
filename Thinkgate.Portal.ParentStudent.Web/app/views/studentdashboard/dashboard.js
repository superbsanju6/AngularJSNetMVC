(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$routeParams', '$rootScope', '$location', dashboard]);

    function dashboard(common, datacontext, $routeParams, $rootScope, $location) {
        //#region Initial Page Setup

        /* common logging functions for all controllers */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        /** General Page Properties (page labels, widget titles/labels **/
        /* widget titles */
        vm.widget = {
            title: 'Attendance',
            footer: 'Student Attendance'
        };

        /* gen. page labels */
        vm.label = {
            name: 'Student Name: ',
            grade: 'Student Grade: ',
            school: 'Current School: '
        };

        /* 3 divs of widgets (Profile Info, Course Info, Attendance Info) */
        vm.title = {
            profile: 'Student Profile',
            course: 'Course Schedule Section'
        };

        /* subtitles for course widgets */
        vm.classLabels = {
            title: 'Course Schedule Selection',
            CourseId: 'Course ID',
            CourseName: 'Course',
            Subject: 'Subject',
            GradePeriod: 'Grade-Period',
            Semester: 'Semester',
            Teacher: 'Teacher'
        };

        /* define titles for attendance widget section */
        vm.attendence = {
            title: 'Attendence',
            absc: 'Absences',
            tard: 'Tardies'
        };
        //#endregion




        //#region Properties to bind to from model once connections are made

        /* student info */
        vm.student = {};

        /* course info */
        vm.courselist = [];

        /* attendance info */
        vm.attendancelist = [];

        //#endregion

        if ($routeParams.Id != ":Id") {
            $rootScope.studentId = $routeParams.Id;
        }

        // New
        /* -jdw: this will keep the tab active after first student toggle is made (keeps tabs in sync with current student */
        $rootScope.student = $rootScope.CurrentStudent;

        activate($rootScope.CurrentStudent);
        //activate(); // gathers page promises


        // TODO: calling activate, I will have to perform some datacontext calls via functions to populate my student data

        function activate(student) {
            //$rootScope.studentId = student.Id;
            vm.student = student;

            //if ($routeParams.Id != ":Id") {
            //    vm.student = { id: $routeParams.Id };
            //    $rootScope.studentId = $routeParams.Id;
            //} else {
            //    vm.student = { id: $rootScope.studentId };
            //}
          
            //var promises = [getStudentProfile($rootScope.CurrentStudent), getCourses($rootScope.CurrentStudent) /*, getAttendance(vm.student) */];
            var promises = [getStudentProfile(student),getCourses(student) /*, getAttendance(vm.student) */];
            
            common.activateController(promises, controllerId)
                .then(function () {
                    
                });
        }

        //#region datacontext calls
        function getStudentProfile(s) {
            return datacontext.getStudentProfile(s).then(function(data) {
                vm.student = data;
                //$rooteScope.CurrentStudent = vm.student;
                $rootScope.FirstName = vm.student.FirstName;
                $rootScope.LastName = vm.student.LastName;
                

            });
        }
        function getCourses(s) {
            return datacontext.getCourses(s).then(function (data) {
                vm.courselist = data;
            });
        }
        function getAttendance(s) {
            return datacontext.getAttendance(s).then(function (data) {
                vm.courselist = data;
            });
        }

        vm.setStudentId = setStudentId;
        function setStudentId(student) {
            //#region Original code for selecting student which is fine, but for styling reasons, we need to try new code block
            //$rootScope.CurrentStudent = student;
            //activate(student);

            //#endregion

            /* current code that sets the vm.student object's properties by 'student' object passed from html */
            vm.student = {
                id: student.Id,
                FirstName: student.FirstName,
                LastName: student.LastName,
                ClientId: student.ClientId,
                CacheDB: student.CacheDB,
                ClientDB: student.ClientDB
            };

            /* once vm.student is set, set the rootScope for the current student for styling on <li> tabs */
            $rootScope.CurrentStudent = student;

            /* call the activate event, send the vm.student object and routeParams.pageMode which is the view that the page currently shows */
            //activate(vm.student);
            activate(vm.student);
        }

//#endregion
    }
})();