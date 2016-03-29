(function () {
    'use strict';
    var controllerId = 'checklist';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$routeParams', '$rootScope', '$http', checklist]);
    angular.module('app').filter('userHtml', [
        '$sce', function($sce) {
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }
    ]);

    function checklist(common, datacontext, $routeParams, $rootScope, $http) {
        //#region Initial Page Setup

        /* common logging functions for all controllers */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        $rootScope.GradeNameDesc = '';

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
            course: 'Senior Advisement Checklist for Parents'
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

        $rootScope.student = $rootScope.CurrentStudent;

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


        vm.grades = [
            { GradeLevel: '08', GradeName: '8th Grade', GradeNameDesc: '8th Grade' },
            { GradeLevel: '09', GradeName: '9th Grade', GradeNameDesc: 'Freshman' },
            { GradeLevel: '10', GradeName: '10th Grade', GradeNameDesc: 'Sophomore' },
            { GradeLevel: '11', GradeName: '11th Grade', GradeNameDesc: 'Junior' },
            { GradeLevel: '12', GradeName: '12th Grade', GradeNameDesc: 'Senior' }
        ];

        vm.checklists = [];
        
        function listingsGroupBy() {
            vm.checklistsGrouped = [];
            vm.groups = _.groupBy(vm.checklists, "Month");

            _.each(vm.groups, function (e, i) {
                e.open = i == "";
                e.MonthName = i;
                var checklistIds = $.map(e, function (o) { return o.checklistId; }); Math.min.apply(Math, e);
                var lowestChecklistId = Math.min.apply(this, checklistIds);
                e.checklistId = lowestChecklistId;
                vm.checklistsGrouped.push(e);
            });

            var blankMonth = _.find(vm.checklistsGrouped, function(month) {
                return month.MonthName == '';
            });

            if (blankMonth != undefined) {
                var idx = vm.checklistsGrouped.indexOf(blankMonth);

                vm.checklistsGrouped.splice(idx, 1);
                vm.checklistsGrouped.unshift(blankMonth);
            }
        }

        vm.openClose = function (state) {
            vm.checklistsGrouped.forEach(function (e) {
                e.open = e.MonthName != "" ? state : true;
            });
        }


        //#endregion

        if ($routeParams.Id != ":Id") {
            $rootScope.studentId = $routeParams.Id;
        }

        activate($rootScope.CurrentStudent);
        //activate(); // gathers page promises


        // TODO: calling activate, I will have to perform some datacontext calls via functions to populate my student data

        function activate(student) {
            if (student) {
                vm.isBusy = true;
                $rootScope.studentId = student.Id;
                vm.student = {
                    id: student.Id,
                    ClientId: student.ClientId,
                    CacheDB: student.CacheDB,
                    ClientDB: student.ClientDB
                };
                var promises = [getStudentProfile(vm.student)];
                common.activateController(promises, controllerId)
                    .then(function () {
                        promises = [getChecklist(vm.student)];
                        common.activateController(promises, controllerId).then(function () {
                            vm.isBusy = false;
                        });
                        $rootScope.hideClientLogo = controllerId == 'checklist' ? true : false;
                    });
            }
        }

        //#region datacontext calls
        function getStudentProfile(s) {
            return datacontext.getStudentProfile(s).then(function (data) {
                vm.student = data;
                $rootScope.FirstName = vm.student.FirstName;
                $rootScope.LastName = vm.student.LastName;
                _.each(vm.grades, function (e, i) {
                    e.Selected = e.GradeLevel == vm.student.GradeLevel;
                    if (e.GradeLevel == vm.student.GradeLevel) {
                        $rootScope.GradeNameDesc = e.GradeNameDesc;
                    }
                });
            });
        }

        function getChecklist(s) {
            if (s.FirstName != null && s.FirstName != undefined) {
                vm.busyMessage = 'Loading ' + $rootScope.GradeNameDesc + ' Checklist for ' + s.FirstName + ' ...';
            } else {
                vm.busyMessage = 'Loading ...';
            }
            vm.isBusy = true;
            return datacontext.getChecklist(s).then(function (data) {
                vm.checklists = data;
                listingsGroupBy();
                vm.isBusy = false;
            },function(errorResponse) {
                if (errorResponse.status == 403) {
                    window.location.href = "index.html";
                }
            });
        }
  
        vm.setStudentId = setStudentId;
        function setStudentId(studentId) {
            activate(studentId);
        }

        vm.setGradeLevel = setGradeLevel;
        function setGradeLevel(grade) {
            vm.student.GradeLevel = grade.GradeLevel;
            $rootScope.GradeNameDesc = grade.GradeNameDesc;
            getChecklist(vm.student);
        }

        vm.printElement = printElement;
        function printElement(elementId) {
            //$("#expandCollapse").hide();
            //$("#listingDetail tr:first td:nth-child(1)").hide();
            //var content = document.getElementById(elementId).innerHTML;
            //var printWindow = window.open('', '', '');
            //printWindow.document.write(content.replace(/"checkbox"/g, '"checkbox" disabled="true"'));
            //printWindow.document.close();
            //printWindow.print();
            //$("#expandCollapse").show();

            $("#expandCollapse").hide();
            $("#listingDetail tr:first td:nth-child(1)").hide();
            var content = document.getElementById(elementId).innerHTML;

            //document.getElementById("myDialog").innerHTML = content;
            //$("#myDialog").html(content);
            // $dialog.dialog({}).open(content);
            // $("#myDialog").dialog('open');
            //var printWindow = window.open('', '_self', 'menubar=0,location=0,height=700,width=700');
            //printWindow.document.write(content.replace(/"checkbox"/g, '"checkbox" disabled="true"'));
            //printWindow.document.close();    
            // printWindow.print();
            // $("#expandCollapse").show();    
            //var printWin = window.open('', '', 'modal,left=0,top=0,width=1000,height=900,status=0');
            //printWin.document.write(content.replace(/"checkbox"/g, '"checkbox" disabled="true"'));
            //printWin.document.close();
            //printWin.focus();

            var printWin = window.open("", "",
   "ModalPopUp",
   "toolbar=no," +
   "scrollbars=no," +
   "location=no," +
   "statusbar=no," +
   "menubar=no," +
   "resizable=0," +
   "width=1000," +
   "height=1000," +
   "left = 10," +
   "top=10"
   );
            printWin.document.write(content.replace(/"checkbox"/g, '"checkbox" disabled="true"'));
            printWin.document.close()
            printWin.focus();
            printWin.onunload = function () {
                bcgDiv.style.display = "none";
            }
            var bcgDiv = document.getElementById("divBackground");
            bcgDiv.style.display = "block";
            printWin.print();
            printWin.close();

            if (printWin && !printWin.closed) {
                bcgDiv.style.display = "none";
            }
            $("#expandCollapse").show();
            $("#listingDetail tr:first td:nth-child(1)").show();

        }

        vm.updateChecklist = updateChecklist;
        function updateChecklist(list) {
            list.checkboxStatus = !list.checkboxStatus;
            return datacontext.updateChecklist(list).then(function (data) {
                _.each(vm.checklistsGrouped, function(e, i) {
                    _.each(e, function(l) {
                        if (l.checklistId == data.checklistId) {
                            l.ID = data.ID;
                        }
                    });
                });
            }, function(errors) {
                // handle error message here
            });
        }
        //#endregion
    }
})();