(function () {
    'use strict';

    var controllerId = 'profile';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['$scope', 'common', 'datacontext', '$location', '$rootScope', profile]);

    function profile($scope, common, datacontext, $location, $rootScope) {
        /* common logging functions to inherit and vm instanciated to this controller */
        var getLogFn = common.logger.getLogFn; 
        var log = getLogFn(controllerId);  
        var vm = this;
         
        /* page labels */
        vm.news = {
            title: 'Student Image',
            description: 'Links To Student Information'
        };

        /* widget headers */
        vm.title = 'Thinkgate ParentStudent Portal  |   Please Select The Profile To View';

        /* Properties to bind to datacontext, which calls services and gathers info from Web API */
        vm.messageCount = 0;    // alerts, shows next to the exclamation sign
        vm.students = [];       // students array for guardians with multiple kids in school system
        vm.studentDetails = [];
        
        vm.activate = activate; // not sure about this, we call activate() a few lines down

        // activate() retrieves the 'promises' for the page
        activate();

        /* fulfills the 'promises' ('$q') must return successful */
        function activate() {
            var promises = [getStudents()];
            // activate controller using common module that sets up logger.js/spinner.js/toastr settings
            common.activateController(promises, controllerId)
                .then(function() {
                
            });
        }

        //#region Calls to datacontext : datacontext communicates with services to reach API

        // get all students this guardian is associated with through datacontext.
        function getStudents() {
            //return datacontext.getStudents().then(function (data) {
            //    $rootScope.studentProfiles = data;
            //    return vm.students = data;
            //});
            vm.students = $rootScope.studentProfiles;
            return vm.students;
        }

       
        //#endregion

        //#region page $scope functions
        $scope.getProfile = function (s) {
            $rootScope.CurrentStudent = s;
            $location.path('/dashboard/' + s.Id);  // here, when we use E3StudentId to pass, it won't pull the profile right away from $routeParam
        };

        //#endregion


    }
})();
