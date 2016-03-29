/// <reference path="links.js" />
(function () {
    'use strict';
    var controllerId = 'links';
    angular.module('app').controller(controllerId, ['common', 'datacontext', links]);

    function links(common, datacontext) {
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

        //#region Template objects with binding properties for real page display
        vm.messageCount = 0;    // alerts (Count)
        vm.alerts = [];         // alterts with information (array object)

        //#endregion

        /* call activation for controller */
        activate();

        function activate() {
            var promises = [getLinks()];
            common.activateController(promises, controllerId)
                .then(function () {});
        }

        function getLinks() {
            return datacontext.getLinks().then(function (data) {
                return vm.linkinfo = data;
            });
        }

     }
})();