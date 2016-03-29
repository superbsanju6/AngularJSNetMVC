(function () {
    'use strict';
    var serviceId = 'loginService';
    angular.module('app').factory(serviceId, ['config', 'common', '$resource', '$http', 'serviceHelperFactory', loginService]);

    function loginService(config, common, $resource, $http, serviceHelperFactory) {
        var token = serviceHelperFactory.AuthorizationToken;

        var buildFormData = function (formData) {
            var dataString = '';
            for (var prop in formData) {
                if (formData.hasOwnProperty(prop)) {
                    dataString += (prop + '=' + formData[prop] + '&');
                }
            }
            return dataString.slice(0, dataString.length - 1);
        };
        return {
            login: function(userLogin) {
                var formData = { username: userLogin.Email, password: userLogin.Password, grant_type: 'password' };
                return token.requestToken(buildFormData(formData), function(data) {
                    serviceHelperFactory.setAuthorizationHeader(data);
                });
            }
        };
    }
})();
