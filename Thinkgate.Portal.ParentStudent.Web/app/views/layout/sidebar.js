(function () {
    'use strict';

    var controllerId = 'sidebar';
    angular.module('app').controller(controllerId,
        ['$route', '$scope', '$location', 'config', '$routeParams', 'routes', '$rootScope', sidebar]);

    function sidebar($route, $scope, $location, config, $routeParams, routes, $rootScope) {
        var vm = this;

        vm.isCurrent = isCurrent;

        activate();

        function activate() { getNavRoutes(); }

        function getNavRoutes() {
            vm.navRoutes = routes.filter(function (r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function (r1, r2) {
                return r1.config.settings.nav > r2.config.settings.nav;
            });
        }

        /* -jdw:  this is what the sidebar.html 'href' calls */
        /* this is the new href to set the url instead of on the front-end with #{{r.url}}.  
         * This gives us more flexibility over what happens. Created for submenu functionality but should be used anyway. */
        $scope.setPath = function (r) {         // pass in route from front method
            //if (r.url == '/assessments') {    // check the relative url path. If user clicked parentMenu to subMenu, don't let them go anywhere
            if (r.config.title == 'assessments') {  // for this portal, we have to check the title property because of the layout of routes
                return;                             // We don't want them to be able to click "Assessments" sidenav, they must choose subMenu route
            } else {
                $location.path(r.url);      // if indeed user clicked a valid parentMenu item without children, then redirect them
            }
        }

        /* -jdw:  routing for submenus nav routes TODO:  get bootstrap fixed for submenu so colors switch but don't stay lit */
        /* sets the view when a submenu item is clicked. we will make this dynamic when the time is right... */
        $scope.setSubMenu = function (subMenu) {
            var view = '';
            view = subMenu.config.settings.view;

            $routeParams.pageMode = view;
            if (view == 'scores' || view == 'proficiency') {
                $location.path('/assessments/' + view);
            } else {
                view = '';
                $location.path('/assessments/' + view);
            }
        };
        $scope.isAlertSet = function (route) {
            if ($rootScope.studentProfiles)
                return route.config.title == 'alerts' && _.reduce(_.map($rootScope.studentProfiles, function (data) {
                    return data.AlertFlag ? 1 : 0;
                }), function (m, x) { return m + x }) > 0 ? '<span  class="icon-exclamation-sign smallCornerIcon ng-scope left-alert"></span>' : '';
        }
        function isCurrent(route) {
            //alert(route);
            if (!route.config.title || !$route.current || !$route.current.title) {
                return '';
            }
            var menuName = route.config.title;
            var pageMode = _.isUndefined($route.current.params.pageMode) ? '' : $route.current.params.pageMode;
            return $route.current.title.substr(0, menuName.length) === menuName || pageMode.substr(0, menuName.length) === menuName ? 'current' : '';
        }

        function setCurrent(r) {
            alert(r.url);
            alert(vm.isCurrent);
            vm.isCurrent = r;
        }
    };
})();