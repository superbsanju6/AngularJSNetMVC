(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);

    function routeConfigurator($routeProvider, routes) {
        routes.forEach(function(r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/profile',
                config: {
                    templateUrl: 'app/views/profileselection/profile.html',
                    title: 'profile',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-search"></i><span>Student Selection</span></div>'
                    }
                }
            }, {
                url: '/checklist/:Id',
                config: {
                    title: 'checklist',
                    templateUrl: 'app/views/checklist/checklist.html'
                }
            }
            //,
            //{
            //    url: '/links',
            //    config: {
            //        title: 'links',
            //        templateUrl: 'app/views/links/links.html',
            //        settings: {
            //            nav: 2,
            //            content: '<i class="icon-list"></i><span>Links</span></div>'
            //        }
            //    }
            //}
        ];
    }
})();