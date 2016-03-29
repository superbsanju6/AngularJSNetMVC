(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());

    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {
        routes.forEach(function (r) {
            $routeProvider.when(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });
    }

    /*NOTE* -j. derrick williams:  The sidebar.html does not include the route in the href anymore, it calls a js function that defines the relative url(r.url) */
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
                        type: 'parentNav',  /* new property: Will allow logic to feed from DB and determine which kind nav
                                             * it is:  parent nav or a sub nav. The objects have to be unique for CSS styling */
                        content: '<i class="icon-search"></i><span>Student Selection</span></div>'
                    }
                }
            }, {
                url: '/dashboard/:Id',
                config: {
                    templateUrl: 'app/views/studentdashboard/dashboard.html',     
                    title: 'dashboard',
                    settings: {
                        nav: 2,
                        type: 'parentNav',
                        content: '<i class="icon-user"></i> Student Profile'
                    }
                }
            }, {
                url: '/assessments/:pageMode',  /* probably don't need this route param b/c clicking on this */  
                config: {                       /* menu will not let you go anywhere, has to be submenu to route */
                    title: 'assessments',
                    templateUrl: 'app/views/assessment/assessments.html',
                    settings: {
                        nav: 3,
                        type: 'parentNav',
                        content: '<i class="icon-folder-open"></i> Student Data',
                        subMenus: [
                         {
                            url: '/assessments/:pageMode', /* new parameter that allows either a 'score' or 'proficiency' view */
                            config: {
                               templateUrl: 'app/views/assessment/assessments.html',
                               title: 'scores',
                               settings: {
                                        nav: 4,
                                        type: 'subNav',
                                        view: 'scores',
                                        content: '<span class="white"><i class="icon-pencil"></i> Assessment Scores</span>'
                                    }
                                }
                            }, {
                                url: '/assessments/:pageMode',
                                config: {
                                    templateUrl: 'app/views/assessment/assessments.html',
                                    title: 'proficiency',
                                    settings: {
                                        nav: 5,
                                        type: 'subNav',
                                        view: 'proficiency',
                                        content: '<span class="white"><i class="icon-pencil"></i>  Standards Proficiency</span>'
                                    }
                                }
                            }
                        ]
                    }
                }
            }, {
                   url: '/links/:Id',
                   config: {
                      title: 'links',
                      templateUrl: 'app/views/links/links.html',  
                      settings: {
                          nav: 6,
                          type: 'parentNav',
                          content: '<i class="icon-key"></i> Links Page'
                      }
                   }
             }, {
                    url: '/alerts',
                    config: {
                        title: 'alerts',
                        templateUrl: 'app/views/alert/alerts.html', 
                        settings: {
                            nav: 7,
                            type: 'parentNav',
                            content: '<i class="icon-exclamation"></i> Alerts'
                        }
                    }
                }
        ];
    }
})();