(function () {
    'use strict';
    //  this controller is not used yet.  here is we need it. (6-17)
    var controllerId = 'registration';

    // TODO: replace app with your module name
    angular.module('app').controller(controllerId,
        ['$scope', 'common', 'datacontext', registration]);

    function registration($scope, common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        vm.news = {
            title: 'Please Enter Your Credentials',
            description: 'Parent-Student Login Page'
        };

        vm.title = 'Thinkgate | Parent-Student Portal Registration Page...';
        activate();

        function activate() {
            var promises = [];
            common.activateController(promises, controllerId)
                .then(function() { log('Activated Registration Screen'); });
        }

        $scope.submit = function () {
            //alert("Inside submit function, user is: ");
            //var user = $scope.username;
            //var pass = $scope.password;
            //alert("Inside submit function, user is: " + user + "password is: " + pass);
        }
    }

})();
