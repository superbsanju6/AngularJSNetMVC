/// <reference path="links.js" />
(function () {
    'use strict';
    var controllerId = 'links';
    angular.module('app').controller(controllerId, ['common', 'datacontext', '$location', '$rootScope', '$routeParams', 'config', links]);

    function links(common, datacontext, $location, $rootScope, $routeParams, config) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;

        /* 3 labels for link info */
        vm.page = {
            title: 'Links',
            label1: 'District Website: ',
            label2: 'Attendance Hotline: '
        };

        vm.student = {};

        /* link info */
        vm.linkinfo = {};

        vm.news = {
            title: 'Links',
            description: 'Links'
        };

        //#region general application config setup
        /* setup configuration events */
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

        //#region Template objects with binding properties for real page display
        vm.messageCount = 0;    // alerts (Count)
        vm.alerts = [];         // alterts with information (array object)
        //#endregion

        /* check the Id parameter to see what student we are working with */
        if ($routeParams.Id != ":Id") {
            $rootScope.studentId = $routeParams.Id == undefined ? $rootScope.studentId : $routeParams.Id;
        }

        // New
        /* -jdw: this will keep the tab active after first student toggle is made (keeps tabs in sync with current student */
        $rootScope.student = $rootScope.CurrentStudent;

        /* call activation for controller */
        activate($rootScope.CurrentStudent);

        function activate(student) {


            vm.student = student;


            var promises = [getLinks(student)];
            common.activateController(promises, controllerId)
                .then(function () { });
        }

        function getLinks(s) {
            vm.isBusy = true;
            return datacontext.getLinks(s).then(function (data) {
                _.each(data, function (item) {
                    item.AttachmentURL = datacontext.getAttachmentLinks(item.AttachmentGuid) + "&clientId=" + item.Phone;
                    item.AssignDate = _.isNull(item.AssignDate) ? '-' : moment(item.AssignDate).format('MM/DD/YYYY');
                    item.AssignBeginDate = _.isNull(item.AssignBeginDate) ? '-' : moment(item.AssignBeginDate).format('MM/DD/YYYY')
                    item.AssignEndDate =_.isNull( item.AssignEndDate) ? '-' : moment(item.AssignEndDate).format('MM/DD/YYYY')
                });
                vm.isBusy = false;
                return vm.linkinfo = data;
            });
        }

        /* vm.setStudentId object resides on all html templates, get's set by the student tab click event setStudentId(student) */
        vm.setStudentId = setStudentId;

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
            $rootScope.CurrentStudent = student;

            /* call the activate event, send the vm.student object and routeParams.pageMode which is the view that the page currently shows */
            activate(vm.student);
        }


        /* in case I ever need to call the javascript from the href */
        //function goToUrl(l) {
        //    $location.path(l);
        //}

    }
})();