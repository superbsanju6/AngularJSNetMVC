(function () {
    'use strict';

    /**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
    angular.module('ui.filters', []).filter('unique', function () {
        return function (collection, keyname) {
            var output = [],
                keys = [];

            angular.forEach(collection, function (item) {
                var key = item[keyname];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };
    }).filter('split', function () {
        return function (input, delimiter) {
            var delimiter = delimiter || ',';
            return input.split(delimiter);
        }
    }).filter('NotInArray', function ($filter) {
        return function (list, arrayFilter, element, isNullProp) {
            if (arrayFilter) {
                return $filter("filter")(list, function (listItem) {
                    if (listItem[element] == null)
                        return true;
                    listItem[element] = $.map(listItem[element], function (item) { return item.trim(); })
                    return ($.inArray(arrayFilter, listItem[element]) == -1) || (isNullProp != null && listItem[isNullProp] == null);
                });
            }
        };
    }).filter('ConvertToArray', function () {
        return function (input) {
            if (!angular.isObject(input)) return input;

            var array = [];

            for(var objectKey in input) {
                array.push(input[objectKey]);
            };       
            return array;
        }
    });
})();