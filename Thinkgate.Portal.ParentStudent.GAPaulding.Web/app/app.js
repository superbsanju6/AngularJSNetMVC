(function() {
    'use strict';

    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate', // animations
        'ngRoute', // routing
        'ngSanitize', // sanitizes html bindings (ex: sidebar.js)
        'ngResource', // resource for creating form data to pass to API


        // Custom modules 
        'common', // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions


        // 3rd Party Modules
        'ui.bootstrap' // ui-bootstrap (ex: carousel, pagination, dialog)

    ]);


    // this will keep us from putting it into every function and controller.
    //app.config(function ($httpProvider) {
    //    $httpProvider.defaults.headers.post['Content Type'] = 'application/x www form urlencoded';
    //});

    // Handle routing errors and success events
    app.run(['$route','$rootScope',  function ($route, $rootScope) {
        // Include $route to kick start the router.
        $rootScope.$on('$routeChangeSuccess', function (e, curr, prev) {
            $rootScope.showSideBar = curr.$$route != null && curr.$$route.title != 'profile';
        });
    }]);        
})();