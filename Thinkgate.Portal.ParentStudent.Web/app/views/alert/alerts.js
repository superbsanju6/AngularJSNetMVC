(function () {
    'use strict';
    var controllerId = 'alerts';
    angular.module('app').controller(controllerId, ['common', '$scope', 'datacontext', '$routeParams', '$rootScope', 'config', alerts]);

    function alerts(common, $scope, datacontext, $routeParams, $rootScope, config) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logSuccess = common.logger.getLogFn(controllerId, 'success');
        var vm = this;
        var itemCounter = 0;
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


        /* objects for page */
        vm.academicAlerts = [];
        vm.nonacademicAlerts = [];
        vm.student = {};



        /* page labels */
        vm.page = {
            currentAlerts: 'Current Alerts',
            archivedAlerts: 'Archived Alerts'
        };

        if ($routeParams.Id != ":Id") {
            $rootScope.studentId = $routeParams.Id == undefined ? $rootScope.studentId : $routeParams.Id;
        }

        // New
        /* -jdw: this will keep the tab active after first student toggle is made (keeps tabs in sync with current student */
        $rootScope.student = $rootScope.CurrentStudent;

        /* activate controller */
        activate($rootScope.CurrentStudent);
        //activate($rootScope.studentId);

        function activate(student/*studentId*/) {
            //#region Original Code, had to be updated
            //$rootScope.studentId = studentId;
            //if (studentId) {
            //    vm.student = {
            //        id: studentId,
            //        FirstName: $rootScope.FirstName,
            //        LastName: $rootScope.LastName
            //    };
            //}
            //#endregion
            if (student) {
                vm.student = student;
            }
            var promises = [getAcademicAlerts(student) /*, getNonAcademicAlerts()*/];
            common.activateController(promises, controllerId)
                .then(function () { log('Alert View Activated...'); });
        }

        /* if Role exists then it will return true other false*/
        vm.roleValidate = roleValidate;
        function roleValidate(role) {
            return _.indexOf($scope.userRole.split(','), role) > -1;
        }

        /* get alerts */
        function getAcademicAlerts(s) {
            vm.isBusy = true;
            return datacontext.getAcademicAlerts(s).then(function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].CreateDate != null) data[i].CreateDate = moment(data[i].CreateDate).format('MM/DD/YYYY');
                    if (data[i].AcknowledgedDate != null) data[i].AcknowledgedDate = moment(data[i].AcknowledgedDate).format('MM/DD/YYYY hh:mm:ss a');
                    if (data[i].AcknowledgedUser != null) data[i].AcknowledgedBy = data[i].AcknowledgedUser.split(',');
                }
                itemCounter = vm.academicAlerts.length;
                vm.isBusy = false;
                return vm.academicAlerts = buildDetailAlert(data);
            });
        }

        function getNonAcademicAlerts() {
            return datacontext.getNonAcademicAlerts(function (data) {
                return vm.nonacademicAlerts = data;
            });
        }

        vm.setStudentId = setStudentId;
        //function setStudentId(student/*studentId, firstName, lastName*/) {
        ////    //#region Original Code, had to be changed due to schema changes
        ////    //$rootScope.FirstName = firstName;
        ////    //$rootScope.LastName = lastName;
        ////    //activate(studentId);
        ////    //#endregion

        ////    //#region Newer code that I am altering due to the changes yesterday
        ////    /* current code that sets the vm.student object's properties by 'student' object passed from html */
        ////    vm.student = {
        ////        id: student.Id,
        ////        FirstName: student.FirstName,
        ////        LastName: student.LastName
        ////    };

        ////    /* once vm.student is set, set the rootScope for the current student for styling on <li> tabs */
        ////    $rootScope.CurrentStudent = student;

        ////    /* call the activate event, send the vm.student object and routeParams.pageMode which is the view that the page currently shows */
        ////    activate(vm.student);
        ////    //#endregion
        ////    $rootScope.CurrentStudent = student;
        ////    activate(student);


        //}

        /* set the current vm.student object from the html click(student) event on <li> tabs at the top of the partials for each student clicked */
        function setStudentId(student) {
            //#region  Code that was used before data model that used sql views changed to stored procs

            /* first revised code to set the $rootScope.CurrentStudent object properties */
            //$rootScope.FirstName = student.firstName;
            //$rootScope.LastName = student.lastName;
            //$rootScope.CurrentStudent = student;

            /* original code before database schema was complete for cache and parms tables */
            //student.Id = studentId;

            /* 2nd revised code to set the student object by just passing studentId or student.Id to this routine from html click event */
            //student.FirstName = studentFName;
            //student.LastName = studentLName;
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
            //$rootScope.student = $rootScope.CurrentStudent;
            $rootScope.CurrentStudent = student;
            /* call the activate event, send the vm.student object and routeParams.pageMode which is the view that the page currently shows */
            activate(vm.student);
            //activate($rootScope.CurrentStudent, $routeParams.pageMode);
        }


        function buildDetailAlert(inData) {
            var outData = [];
            var fourteenDaysAgo = moment().day(-14);

            for (var i = 0; i < inData.length; i++) {
                var currentItemDate = moment(inData[i].CreateDate);
                inData[i].IsRowBold = false;
                if (moment(currentItemDate).isAfter(fourteenDaysAgo)) {     // I only commented out the moment.js 14-day constraint so I could see the data,  It should be put back.
                    inData[i].IsRowBold = true;
                }
                outData.push(inData[i]);
            }
            return outData;
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

        $rootScope.$on(events.spinnerToggle,
                    function (data) { toggleSpinner(data.show); }
                );



        vm.saveAlertAcknowledgement = saveAlertAcknowledgement;
        function saveAlertAcknowledgement(s) {
            vm.isBusy = true;
            // var  = vm.academicAlerts.count;
            //itemCounter = vm.academicAlerts.length;
            var itemIndex = vm.academicAlerts.indexOf(s);
            s.AcknowledgedUser = (s.AcknowledgedUser != null ? s.AcknowledgedUser + ', ' : '') + $scope.userName.trim();
            s.AcknowledgedDate = moment(new Date()).format('MM/DD/YYYY hh:mm:ss a');
            datacontext.saveAlertAcknowledgement(s).then(function (data) {
                if (data != null && data.Status) {
                    datacontext.getStudents().then(function (data) {
                        $rootScope.studentProfiles = data;
                        vm.isBusy = false;
                        vm.academicAlerts[itemIndex].AcknowledgedUser = s.AcknowledgedUser;
                        vm.academicAlerts[itemIndex].AcknowledgedBy = s.AcknowledgedUser.split(',');
                        vm.message = 'Alert Is Now Archived.';
                        itemCounter = itemCounter - 1;
                        vm.source = controllerId;
                        logSuccess('Student Alert Acknowledged, Archiving...', null, true);
                    });
                    //return data;
                }

                if (itemCounter < 1) {
                    vm.message = 'All Alerts Have Been Archived for Student';
                    log(vm.message, null, null, 'info');
                }
                /*else if ((data == null) || !data.Statu || itemCounter === 0) {
                    var alertsRemaining = vm.academicAlerts.length;
                    if (alertsRemaining < 1) {
                        vm.message = 'The are no more current alerts for student. Alerts icon will not be visible after logout.';
                        log(vm.message, null, vm.source, 'info');
                    }
                }*/
            });
        }
    }
})();