(function () {
    'use strict';

    var app = angular.module('app');

    // Configure Toastr
    toastr.options.timeOut = 5000;
    toastr.options.positionClass = 'toast-bottom-right';

    /* Preset Toastr Positions if needed */
    var toastrPos = {
        defaultPos: 'toast-bottom-right',
        bottomFull: 'toast-bottom-full-width',
        bottomLeft: 'toast-bottom-left',
        topFull: 'toast-top-full-width',
        topLeft: 'toast-top-left',
        topRight: 'toast-top-right'
    };

    // This be ASP.NET Web API
    var remoteServiceName = 'serviceHelperFactory';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        controllerActivateFailure: 'controller.activateFailure',
        spinnerToggle: 'spinner.toggle'
    };

    /* -jdw: Parent-Student Portal.WEB project's config
             Added properties for config: [apiurl, ] 
        [06_02_2014]: these changes made are to provide the service for the 'bearer-token'
        
     */ 
    var config = {
        appErrorPrefix: '[Portal Error] ', //Configure the exceptionHandler decorator
        docTitle: 'Thinkgate Parent-Student Portal: ',
        events: events,
        remoteServiceName: remoteServiceName,
        version: '1.0.0'
        //,
        //apiurl: 'http://localhost:61738/' // This is setting up the web api's Url location.  
    };
    

    app.value('config', config);
    
    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.controllerActivateFailureEvent = config.events.controllerActivateFailure;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    app.value('studentId', 0);
    app.value('FirstName', "");
    app.value('LastName', "");
    app.value('client', "");
    //#endregion
})();