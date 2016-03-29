/*!
* line_intersection.js javascript library
* Copyright (c) 2013 Vigneshwaran Raveendran <vigneshwaran2007@gmail.com>
* https://github.com/vigneshwaranr/line_intersection.js
*
* Released under the MIT license
* http://opensource.org/licenses/MIT
*
*
* Code for getTrendlineData method extracted from highcharts_trendline library (MIT license)
* Copyright (c) 2011-2013 Chris Stefano <virtualstaticvoid@gmail.com>
* https://github.com/virtualstaticvoid/highcharts_trendline/blob/65d53dd1ce64648d97a2dbb49444bbb522cec313/regression.js
*
*/
/**
* Given two straight line data each of the form [[x1, y1], [x2, y2], ... [xn, yn]]
* this method will return an object that contains the intersection points and two "new line data"
* with the intersection point added. (Does not modify the input data!)
*
* @param line1_data - Mandatory argument that contains the data of line1 of the form
* [[x1, y1], [x2, y2], ... [xn, yn]]
*
* @param line2_data - Mandatory argument that contains the data of line2 of the form
* [[x1, y1], [x2, y2], ... [xn, yn]]
*
* @param user_options - Optional argument that is an object containing custom options that overrides the default
* behavior of the method. Refer the comments for each option in the opt object for the valid
* values for that option.
*
* @returns
* > an object with the following properties
* icptX - The intersection point X
* icptY - The intersection point Y
* line1_data - The new line1 data with intersection point added
* line2_data - The new line2 data with intersection point added
* > or returns undefined
* if the lines are parallel,
* if any of the first two arguments are not in the form [[x1, y1], [x2, y2], ... [xn, yn]]
* if any of the line data has less than 2 points (it's not a line then)
* if the user_options argument or any of the options inside it is not in the required format
* if any callback set in user_options returns false
*/
function getLineIntersectionData(line1_data, line2_data, user_options) {
    var opt = {
        /**
        * The point array/object for the intersection points that will be inserted to the line arrays.
        * By default the point will be inserted as [icptX, icptY] to both the new lines "that will be returned".
        * (This method won't modify supplied line arrays)
        *
        * If you are using this method for highcharts, You may customize this by setting icptPoint to a custom object.
        * Set any custom parameters except x and y which will be set/overridden with the intersection point
        * (Refer: http://api.highcharts.com/highcharts#series.data for the parameters supported by highcharts)
        *
        * Ignore this if you are using a charting library other than highcharts
        */
        icptPoint: [],
        /**
        * Override this method to customize the behavior if the lines are parallel (never meets).
        *
        * (like =, ||, //)
        *
        * getLineIntersectionData() always exits returning undefined if this method is called i.e. if lines are
        * parallel.
        */
        onParallel: function () {
            console.log('Parallel lines can never meet');
        },
        /**
        * Override this method to customize the behavior if the given line segments already intersect.
        *
        * (like X, >, <)
        *
        *
        * getLineIntersectionData() exits returning undefined if this function explicitly returns false
        * Otherwise proceeds as usual.
        *
        * @param icptX - intersection point X
        * @param icptY - intersection point Y
        */
        onLinesAlreadyIntersect: function (icptX, icptY) {
            // console.log('Lines already meet at (' + icptX + ',' + icptY + ')');
            return true;
        },
        /**
        * Accepts a callback function that returns true or false
        *
        * Use this to validate the intersection points before connecting the lines.
        *
        * For example, you might not want to connect the lines if the intersection point is too far away,
        * or you might not want to connect the lines if the intersection point is to the left of the first points.
        * If so, set it to a function that returns false. It'll avoid the unnecessary operation of adding the
        * intersection point to the new line data when you don't need it.
        *
        * getLineIntersectionData() exits returning undefined if this function explicitly returns false
        * Otherwise proceeds as usual.
        *
        * @param icptX - intersection point X
        * @param icptY - intersection point Y
        */
        validateIntersection: function (icptX, icptY) {
            return true;
        }
    };
    // Validate whether the first two arguments are of the form:
    // [[x1, y1], [x2, y2], ... [xn, yn]]
    var _tmp_arr = [line1_data, line2_data];
    for (var i = 0; i < _tmp_arr.length; i++) {
        if (_tmp_arr[i] == null
        || Object.prototype.toString.call(_tmp_arr[i]) !== "[object Array]"
        || Object.prototype.toString.call(_tmp_arr[i][0]) !== "[object Array]"
        || Object.prototype.toString.call(_tmp_arr[i][1]) !== "[object Array]") {
            console.error('The first two arguments should each be of ' +
            'the form: [[x1, y1], [x2, y2], ... [xn, yn]]');
            return;
        }
    }
    if (line1_data.length <= 1 || line2_data.length <= 1) {
        console.error('Each line must have at least two point');
        return;
    }
    user_options = user_options || {};
    if (Object.prototype.toString.call(user_options) !== '[object Object]') {
        console.error('user_options argument must be an object');
        return;
    }
    for (var key in user_options) {
        if (opt.hasOwnProperty(key)) { // If the user given options contain any valid option, ...
            opt[key] = user_options[key]; // ..that option will be put in the opt object.
        }
    }
    // NOTE: Shallow copying. Lets do only insertion and not modify any inner arrays
    var line1 = line1_data.slice(),
    line2 = line2_data.slice();
    // Following math formula taken from http://en.wikipedia.org/wiki/Line-line_intersection#Mathematics
    // First and last points of line1
    var x1 = line1[0][0],
    y1 = line1[0][1],
    x2 = line1[line1.length - 1][0],
    y2 = line1[line1.length - 1][1];
    // First and last points of line2
    var x3 = line2[0][0],
    y3 = line2[0][1],
    x4 = line2[line2.length - 1][0],
    y4 = line2[line2.length - 1][1];
    var denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom == 0) {
        // denom == 0 means lines are parallel or coincident
        if (typeof opt.onParallel === 'function') {
            opt.onParallel();
        } else {
            console.error('onParallel must be a function');
        }
        return;
    }
    var xNumer = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
    yNumer = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
    icptX = xNumer / denom,
    icptY = yNumer / denom;
    if (icptX >= x1 && icptX <= x2 && icptX >= x3 && icptX <= x4) {
        // The two lines already meet (like X, > or <)
        if (typeof opt.onLinesAlreadyIntersect === 'function') {
            if (opt.onLinesAlreadyIntersect(icptX, icptY) === false) {
                return;
            }
        } else {
            console.error('onLinesAlreadyMeet must be a function');
        }
    }
    // Validate the intersection points before proceeding further
    if (typeof opt.validateIntersection === 'function') {
        if (opt.validateIntersection(icptX, icptY) === false) {
            return;
        }
    } else {
        console.error('validateIntersection must be a function');
    }
    var point_type = Object.prototype.toString.call(opt.icptPoint);
    if (point_type === '[object Array]') {
        opt.icptPoint = [icptX, icptY];
    } else if (point_type === '[object Object]') {
        opt.icptPoint.x = icptX;
        opt.icptPoint.y = icptY;
    } else {
        console.error('Invalid icptPoint');
        return;
    }
    // Inserting icptPoint into both lines
    var _lines = [line1, line2];
    nextLine:
        for (var idx = 0; idx < _lines.length; idx++) {
            var line = _lines[idx];
            // Check if point already exists
            for (var i = 0; i < line.length; i++) {
                if (line[i][0] == icptX && line[i][1] == icptY) {
                    line[i] = opt.icptPoint;
                    continue nextLine;
                }
            }
            var isXAscending = line[0][0] <= line[line.length - 1][0];
            var isYAscending = line[0][1] <= line[line.length - 1][1];
            // Otherwise push it
            line.push(opt.icptPoint);
            // and sort the array
            line.sort(function (a, b) {
                var ax = a[0] || a.x,
                ay = a[1] || a.y,
                bx = b[0] || b.x,
                by = b[1] || b.y;
                if (ax < bx) return isXAscending ? -1 : 1;
                if (ax > bx) return isXAscending ? 1 : -1;
                if (ay < by) return isYAscending ? -1 : 1;
                if (ay > by) return isYAscending ? 1 : -1;
                return 0;
            });
        }
    return {
        icptX: icptX, // The intersection point X
        icptY: icptY, // The intersection point Y
        line1_data: line1, // The new line1 data with intersection point added
        line2_data: line2 // The new line2 data with intersection point added
    };
}
/**
* Given any linear chart data of the form [[x1, y1], [x2, y2], ... [xn, yn]]
* this method will generate a straight trendline using linear regression.
*
* @returns an object containing the following properties
* data - new array containing the data for the straight trendline
* slope - slope of the trendline
* intercept - intercept of the trendline
*
*/
function getTrendlineData(data) {
    var regression = function (x, y) {
        var N = x.length;
        var slope;
        var intercept;
        var SX = 0;
        var SY = 0;
        var SXX = 0;
        var SXY = 0;
        var SYY = 0;
        var Y = y;
        var X = x;
        for (var i = 0; i < N; i++) {
            SX = SX + X[i];
            SY = SY + Y[i];
            SXY = SXY + X[i] * Y[i];
            SXX = SXX + X[i] * X[i];
            SYY = SYY + Y[i] * Y[i];
        }
        slope = (N * SXY - SX * SY) / (N * SXX - SX * SX);
        intercept = (SY - slope * SX) / N;
        return [slope, intercept];
    }
    var ret;
    var res;
    var x = [];
    var y = [];
    var ypred = [];
    for (i = 0; i < data.length; i++) {
        if (data[i] != null && Object.prototype.toString.call(data[i]) === '[object Array]') {
            if (data[i] != null && data[i][0] != null && data[i][1] != null) {
                x.push(data[i][0]);
                y.push(data[i][1]);
            }
        }
        else if (data[i] != null && typeof data[i] === 'number') { // If type of X axis is category
            x.push(i);
            y.push(data[i]);
        }
    }
    ret = regression(x, y);
    for (var i = 0; i < x.length; i++) {
        res = ret[0] * x[i] + ret[1];
        ypred.push([x[i], res]);
    }
    return {
        data: ypred,
        slope: ret[0],
        intercept: ret[1]
    };
}
