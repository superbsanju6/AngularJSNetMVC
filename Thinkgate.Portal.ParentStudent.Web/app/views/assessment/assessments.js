// Always use the IIFE approach, regardless of what you see as examples on the internet.  This is a very common mistake and many people are very used to the old way but
// THERE WRONG and that's dangerous.  Encapsulate the whole controller into a function to make sure it's killed / newed up because of it's scope, this can cause problems.

(function () {

    'use strict';
    var controllerId = 'assessments';
    angular.module('app').controller(controllerId, ['common', '$scope', '$location', 'datacontext', '$routeParams', '$rootScope', assessments]);

    function assessments(common, $scope, $location, datacontext, $routeParams, $rootScope) {

        /* common loggin functions I have written in logger, common, spinner, for directives */
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this; /* vm = this is shorthand reference for the controller and makes sure that it's local to controller and dies / get's 'newed' up with every instance. 
                        * Use "Controller as" model syntax approach for front-end, DO NOT use the older '$scope' for controllers. Also, never use anonymous functions 
                        * by using app.controller(assessments, ['common', '$scope', '$location', 'datacontext', '$routeParams', '$rootScope', function() {  } ]();
                        * That's a bad practice and will lead you into some serious problems if the application begins to grow bigger. ALWAYS USE -> 'IIFE' APPROACH - LOOK IT UP!!!                                                                                                                                }     
                        */


        //#region Common binding properties for the page
        /* common page labels */
        vm.page = {
            title: 'Student Assessments View | Proficiency and Scoring',
            subtitle: 'Assessment',
            subtitle1: 'Standards',
            subtitleA: 'Score',
            subtitleB: 'Proficiency',
            pageView: ''
        };

        /* common chart widget headers */
        vm.widgetchart = {
            header: 'Assessment Score Charts',
            footer: 'Scores by Date Taken'
        };
        vm.minDate = {};
        vm.maxDate = {};
        vm.titleDetail = 'History of Assessment Scores';
        vm.ScoreEmptyMessage = {};
        //#endregion

        //#region    Objects to bind to view model
        /* route param info for page views: -j. derrick williams */
        /************************************************************************************
        * Model for ScoreList - This page's objects will bind to this information           * 
        *************************************************************************************
        *           Id = assessmentScoreListList.Id,                                        * 
        *           StudentId = assessmentScoreListList.StudentId,                          * 
        *           Description = assessmentScoreListList.Description,                      *
        *           ScorePercent = assessmentScoreListList.ScorePercent,                    *
        *           ClassAverage = assessmentScoreListList.ClassAverage,                    *
        *           ScoredDate = assessmentScoreListList.ScoredDate,                        *
        *           SchoolYear = assessmentScoreListList.SchoolYear                         *
        ************************************************************************************/
        //#endregion

        //#region view model display properites    
        vm.student = {};
        vm.lookUp = {};

        /* proficiency info - will work same as scoreinfo */
        vm.proficiencyinfo = [];
        vm.scoringinfo = [];
        /* student assessment properites   */
        vm.scoreinfo = {};  /*- see description below:*/
        //#endregion

        /* proficiency and standard properties */
        vm.Proficiency = [];
        vm.Standards = [];

        /* score info is for d3.js linear graphs. It will contain a dynamic JSON array of subjects, each with a dynamic JSON array of scores and dates => 
        //#region  Example of how I want to setup the JSON objects into 2-level dynamic array. D3 works the best with JSON arrays
        { subjects: 
            [ 
              { subject: ''
                  { scores: 
                     [ 
                        { scoredDate: '', scorePercent: '' },
                        { scoredDate: '', scorePercent: '' },
                        { scoredDate: '', scorePercent: '' }
                     ]
                  }
              },
              { subject: ''
                  { scores: 
                     [ 
                        { scoredDate: '', scorePercent: '' },
                        { scoredDate: '', scorePercent: '' },
                        { scoredDate: '', scorePercent: '' }
                     ]
                  }
              }
           ]
        }   */
        //#endregion

        //#region check the Id parameter, set $rootScope properties, and activate controller 
        if ($routeParams.Id != ":Id") {
            $rootScope.studentId = $routeParams.Id == undefined ? $rootScope.studentId : $routeParams.Id;
        }

        //$rootScope.student = vm.student;
        $rootScope.student = $rootScope.CurrentStudent;

        /* activate controller */
        activate($rootScope.CurrentStudent, $routeParams.pageMode);
        //#endregion

        //#region   Page View Modes
        /* -j. derrick williams:
         * page view modes */
        /* this is the scoreMode view to show the table with all  */
        $scope.scoreMode = function () {
            $scope.scoreMode = true;
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = true;  // -jdw: changed to true to show everything statically
            $scope.proficiencyModeDetail = false;
        };

        $scope.proficiencyMode = function () {
            $scope.scoreMode = false;
            $scope.proficiencyMode = true;
            $scope.scoreModeDetail = false;
            $scope.proficiencyModeDetail = false;
        };

        $scope.scoreModeDetail = function () {
            $scope.scoreMode = true;  // -jdw: changed to true to show everything statically
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = true;
            $scope.proficiencyModeDetail = false;
        };

        $scope.proficiencyModeDetail = function () {
            $scope.scoreMode = false;
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = false;
            $scope.proficiencyModeDetail = true;
        };

        //#endregion

        //#region controller activation: common logging, promises, data calls */
        function activate(student, view) {

            //#region Old $rootScope.student properties parsed into: studentId, FirstName, LastName - depricated (We now pass the whole object, then break down it's properties
            //$rootScope.studentId = student.Id;
            //$rootScope.FirstName = student.FirstName;
            //$rootScope.LastName = student.LastName;
            //if (student) {
            //vm.student = {
            //    id: student.E3StudentId,
            //    FirstName: $rootScope.FirstName,
            //    LastName: $rootScope.LastName
            //};
            //vm.student = student;  this was the part that was salvaged below
            //vm.lookUp = vm.student.id;
            //}
            //#endregion

            if (student) {
                vm.student = student;
            }

            var promises = [getAssessmentScores(vm.student), getAssessmentStandard(vm.student), getAssessmentProficiency(vm.student)];//, getView(vm.student, view)];
            common.activateController(promises, controllerId)  // activate and log
                .then(function () {
                    if (view == 'scores') {
                        $scope.showScore();
                        $scope.showScoreDetail();
                    } else {
                        $scope.showProficiency();
                    }
                });
        };
        //#endregion

        //#region   $scope for ng-show directives/tags 
        /* ng-show value(s) for div "scoreMode" */
        $scope.showScore = function () {
            //vm.title = 'Assessments | Student Score View';
            vm.title = "Assessment Scores | Last 14 Days";
            vm.subTitle = "Monthly Progress";
            $scope.scoreMode = true;
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = true;
            $scope.proficiencyModeDetail = false;
            vm.page.pageView = 'Scores';
        };

        /* ng-show value(s) for div "proficiencyMode" */
        $scope.showProficiency = function () {
            vm.title = "Standards Proficiency";
            $scope.scoreMode = false;
            $scope.proficiencyMode = true;
            $scope.scoreModeDetail = false;
            $scope.proficiencyModeDetail = false;
            vm.page.pageView = 'Proficiency';
        };

        /* ng-show value(s) for div "proficiencyMode" */
        $scope.showScoreDetail = function () {
            //vm.title = "History of Student Score Details";
            $scope.scoreMode = true;
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = true;
            $scope.proficiencyModeDetail = false;
            // details shown by class with collapse and expand ability 
            buildTreeData();

        };

        $scope.showProficiencyDetail = function () {
            vm.title = "Standard Proficiency Details";
            $scope.scoreMode = false;
            $scope.proficiencyMode = false;
            $scope.scoreModeDetail = false;
            $scope.proficiencyModeDetail = true;
        };


        $scope.ChangeReport = function (reportForm, report, isCurriculum) {
            vm.SSRSFrameUrl = "Blank.html";
            if (isCurriculum)
                report.domain = undefined;
            if (!_.isUndefined(report.domain) && !_.isUndefined(report.class)) {
                var param = {
                    ClientID: vm.ClientId,
                    StudentID: vm.student.Id,
                    DomainID: report.domain.StandardID,
                    SchoolYear: vm.SchoolYear,
                    CurrCourseID: report.class.CourseId
                };
                vm.SSRSFrameUrl = datacontext.setAssessmentProficiencyReportURL(param);
            }
        }
        //#endregion

        /* method is used to grab courses for breakdown of Scores Detail */
        function buildTreeData() {
            try {
                vm.Courses = getCourses(vm.ScoresDetail);
            } catch (e) {

            }
        }

        /* get the students assessment scores */
        function getAssessmentScores(s) {
            vm.Scores = null;
            vm.ScoreEmptyMessage = null;
            return datacontext.getAssessmentScores(s).then(function (data) {

                /* this formats the date into a short date string using moment.js */
                for (var i = 0; i < data.length; i++) {
                    var theDate = moment(data[i].ScoredDate).format('MM/DD/YYYY');
                    data[i].Month = moment(data[i].ScoredDate).format('MMM YYYY');
                    data[i].YearMonth = moment(data[i].ScoredDate).format('YYYYMM');
                    /* this uses ScoredDate to see if it falls into the current schoolyear */
                    //if (dateInCurrentSchoolYear(theDate) == data[i].SchoolYear) {
                    data[i].ScoredDate = theDate;
                    // }
                }

                /* format the class avg into a whole number using underscore.js */
                /* format the score  into a whole number using underscore.js */
                for (var i = 0; i < data.length; i++) {
                    var theClassPercent = (data[i].ClassAverage * 100).toFixed(2);
                    data[i].ClassAverage = theClassPercent;
                    var theScorePercent = data[i].ScorePercent.toFixed(2);
                    data[i].ScorePercent = theScorePercent;
                }



                vm.Scores = _.groupBy(buildDetailScores(data), "Course"); // set vm.Scores object to the data returned from the service factory

                if (_.isEmpty(vm.Scores))
                    vm.ScoreEmptyMessage = "No data available.";

                //drawAssessmentCharts('Score Chart', 'ScoreChart_div', vm.Scores); // for d3.js charts
                // drawChart('Monthly Progress', 'ScoreChart_div', vm.Scores); // for google charts                
                vm.ScoresDetail = _.groupByMulti(data, ['Course', 'Month']);// set vm.ScoresDetail object: breaks down by class in build method. Uncomment the moment.js code for last 14 days only 

                /* drawChart('Detail Score Chart', 'ScoreTreeDetail_div', vm.ScoresDetail); // google charts - this was the original call for the details chart, now just one chart 09-24-2014*/
                drawChart('Monthly Progress', 'ScoreChart_div', data);
            });
        }

        /* used to show the scoreDetails view */
        function buildDetailScores(inData) {
            var outData = [];
            var fourteenDaysAgo = moment().day(-14);

            for (var i = 0; i < inData.length; i++) {
                var currentItemDate = moment(inData[i].ScoredDate);

                if (moment(currentItemDate).isAfter(fourteenDaysAgo)) {     // I only commented out the moment.js 14-day constraint so I could see the data,  It should be put back.
                    outData.push(inData[i]);
                }
            }
            return outData;
        }


        function getAssessmentStandard(s) {
            return datacontext.getAssessmentStandard(s).then(function (data) {
                vm.Standards = data;
                vm.ClientId = _.isEmpty(data) ? '' : _.first(data).ClientId;
                _.each(data, function (standard) {
                    // ellipse "Desc"  to show in dorpdown properlly
                    standard.DescElipse = standard.Desc.length >= 50 ? standard.Desc.substring(0, 49) + ' ...' : standard.Desc;
                })
            },
           function (errors) {
               // handle errors here
               //    //alert(errors);
           });
        }

        function getAssessmentProficiency(s) {
            vm.SSRSFrameUrl = "Blank.html";
            vm.Course = "NA";
            vm.Domain = "NA";
            $scope.report = [];
            return datacontext.getAssessmentProficiency(s).then(function (data) {
                vm.Proficiency = data;
                vm.SchoolYear = _.isEmpty(data) ? '' : _.first(data).SchoolYear;
            },
            function (errors) {
                // handle errors here
                //    //alert(errors);
            });
        }



        //function drawProficiencyChart(title, element, data) {
        //    var graphData = [];
        //    var standards = _.uniq(_.pluck(_.flatten(data), "Description"));    // series
        //    standards.splice(0, 0, "_Standards");
        //    var months = []; //_.uniq(_.pluck(_.flatten(data), "Month"));             // horizontal ticks

        //    var constMonth = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

        //    var count = data.length - 1;
        //    var maxYear = moment(data[count].ScoredDate).format('YYYY'); // last record has maxdate from the sorting done in the API view (orderBy => .Date)

        //    // pushing months into array for a year to showing on X-Axis of chart.
        //    for (var i = maxYear - 1; i <= maxYear ; i++)
        //        for (var j = 0 ; j < constMonth.length; j++) {
        //            if (months.indexOf(constMonth[j] + ' ' + i) == -1 && i < maxYear && j <= 4)
        //                months.push(constMonth[j] + ' ' + i);
        //            else if (maxYear == i && j > 4)
        //                months.push(constMonth[j] + ' ' + i);
        //        }

        //    // set up data structure for google chart/graph
        //    graphData.push(standards);  // set series to top row
        //    _.each(months, function (month, idx) {
        //        var monthSeries = [];
        //        monthSeries.push(month);
        //        for (var x = 1; x < standards.length; x++) {
        //            monthSeries.push(null);
        //        }
        //        graphData.push(monthSeries);
        //    });

        //    var groupedDataStandard = _.groupBy(data, "Description");
        //    _.each(groupedDataStandard, function (items, standardName) {
        //        var standardIdx = graphData[0].indexOf(standardName);
        //        var itemsByMonth = _.groupBy(items, "Month");
        //        _.each(itemsByMonth, function (itemsInMonth, monthName) {
        //            for (var x = 0; x < graphData.length; x++) {
        //                var monthIdx = graphData[x].indexOf(monthName);
        //                if (standardIdx >= 0 && monthIdx >= 0) {
        //                    for (var z = 0; z < itemsInMonth.length; z++) {
        //                        graphData[x][standardIdx] += itemsInMonth[z].ScorePercent;
        //                    }
        //                    graphData[x][standardIdx] = graphData[x][standardIdx] / itemsInMonth.length;
        //                }
        //            }
        //        });
        //    });


        //    // method is used to replace from null value to intersection value if null value exists between two numeric values  
        //    getContinousLineBetweenTwoCoordinates(graphData);

        //    var options = {
        //        legend: {
        //            position: 'bottom'
        //        },
        //        title: title,
        //        width: '100%',
        //        height: 540
        //        //curveType: 'function'
        //    };

        //    var googleData = google.visualization.arrayToDataTable(graphData);
        //    var chart = new google.visualization.LineChart(document.getElementById(element));
        //    chart.draw(googleData, options);
        //}

        /* using moment.js to get and format dates involved */
        function dateInCurrentSchoolYear(inDate) {

            try {
                var currentDate = moment().format('MM/DD/YYYY');
                var currentYear = moment(currentDate, 'MM/DD/YYYY').year();
                var current2DigitYear = currentYear.toString().substr(2, 2);

                if (moment().month() + 1 >= 8) {
                    //this year and next year
                    if (moment(inDate, 'MM/DD/YYYY').year() == currentYear || moment(inDate, 'MM/DD/YYYY').year() == currentYear + 1) {
                        return current2DigitYear + "-" + current2DigitYear + 1;
                    }

                } else {
                    //this year and last year
                    if (moment(inDate, 'MM/DD/YYYY').year() == currentYear || moment(inDate, 'MM/DD/YYYY').year() == currentYear - 1) {
                        return current2DigitYear - 1 + "-" + current2DigitYear;
                    }
                }
            } catch (e) {
                return "";
            }
            return "";
        }

        /* vm.setStudentId object resides on all html templates, get's set by the student tab click event setStudentId(student) */
        vm.setStudentId = setStudentId;

        /* set the current vm.student object from the html click(student) event on <li> tabs at the top of the partials for each student clicked */
        function setStudentId(student) {
            /* current code that sets the vm.student object's properties by 'student' object passed from html */
            vm.student = {
                Id: student.Id,
                FirstName: student.FirstName,
                LastName: student.LastName,
                ClientId: student.ClientId,
                CacheDB: student.CacheDB,
                ClientDB: student.ClientDB
            };

            /* once vm.student is set, set the rootScope for the current student for styling on <li> tabs */
            $rootScope.CurrentStudent = student;

            /* call the activate event, send the vm.student object and routeParams.pageMode which is the view that the page currently shows */
            activate(vm.student, $routeParams.pageMode);
            //activate($rootScope.CurrentStudent, $routeParams.pageMode);
        }

        /* get the view that has been clicked from the sidebar, Assessment Scores or Assessment Proficiency */
        function getView(student, view) {
            if (view == 'scores') {
                vm.title = 'Assessment Scores';
                $scope.scoreMode = true;
                $scope.proficiencyMode = false;
                $scope.scoreModeDetail = false;
                $scope.proficiencyModeDetail = false;
            } else if (view == 'proficiency') {
                vm.title = 'Standard Proficiency';
                $scope.scoreMode = false;
                $scope.proficiencyMode = true;
                $scope.scoreModeDetail = false;
                $scope.proficiencyModeDetail = false;
            }
        }


        /* -jdw:  This will get depricated as soon as all the d3.js chart logic is working
         * TODO: add resposive UI features to chart, using resize event. 
         * See this fiddle - http://jsfiddle.net/brandonthompson/cTkLh/ */
        function drawChart(title, divToPlaceChartIn, indata) {
            if (indata.length > 0) {
                var lineData = buildChartArray(indata);
                var chartData = formattingChartArray(indata);
                // method is used to replace from null value to intersection value if null value exists between two numeric values  
                getContinousLineBetweenTwoCoordinates(chartData);
                var data = google.visualization.arrayToDataTable(chartData);
                /* new code */
                var count = lineData.length - 1;
                //var dataView = new google.visualization.DataView(data);
                //dataView.setColumns([{ calc: function (data, row) { return data.getFormattedValue(row, 0); }, type : 'date' }, 1]);
                // define the x scale (horizontal)
                var mindate = new Date(lineData[1][0]),     // 2nd record because first is classes, and first spot is always the date (first date is lowest)
                    maxdate = new Date(lineData[count][0]); // last record has maxdate from the sorting done in the API view (orderBy => .Date)
                vm.minDate = moment(mindate).format('MM/DD/YYYY');
                vm.maxDate = moment(maxdate).format('MM/DD/YYYY');
                var options = {
                    title: title,
                    legend: {
                        position: 'right'
                    },
                    hAxis: {
                        slantedText: true
                    },
                    //hAxis: { ticks: [new Date(2014,9,1), new Date(2014,10,1), new Date(2014,11,1), new Date(2014,12,30)] },
                    interpolateNulls: true,
                    width: 1000,
                    height: 400
                };

                if (!_.isNull(document.getElementById(divToPlaceChartIn)))
                    var chart = new google.visualization.LineChart(document.getElementById(divToPlaceChartIn));

                if (!_.isUndefined(chart)) {
                    // Non-detail pages get chart click events
                    if (divToPlaceChartIn.toLowerCase().indexOf("detail") == -1) {
                        // Chart "onDblClick" handler
                        google.visualization.events.addListener(chart, 'dblclick', eval('selectHandler_' + divToPlaceChartIn));
                    }

                    chart.draw(data, options);
                }
            }
            else
                $('#' + divToPlaceChartIn).html("No data available.");

        }

        //#region d3.js chart setup
        function drawAssessmentCharts(title, divToPlaceChartIn, indata) {
            var lineData = buildChartArray(indata);
            vm.scoreinfo = buildJsonScoresBySubject(indata);

            //#region Settings to draw the svg container on the page
            // create the dimensions of the container
            var width = 1000,
                height = 400,
                padding = 100;

            // grab the area to draw in 
            var area = '#' + divToPlaceChartIn; // HTMLDivElement('widgetAssessmentScores'); //'#' + divToPlaceChartIn;

            var parseDate = d3.time.format("%b-%d-%y").parse;

            //The SVG Container
            var svgContainer = d3.select("section").append("svg")
                                                .attr("width", width)
                                                .attr("height", height);

            // define the y scale  (vertical)
            var yScale = d3.scale.linear()
                .domain([0, 100])    // values between 0 and 100 which are student scores
                .range([height - padding, padding]);   // map these to the chart height, less padding.  
            //REMEMBER: y axis range has the bigger number first because the y value of zero is at the top of chart and increases as you go down.

            // get our data

            //var lineData = buildChartArray(indata);
            //var groupedData = buildJsonScoresBySubject(indata);
            var count = lineData.length - 1;

            // define the x scale (horizontal)
            var mindate = new Date(lineData[1][0]), // 2nd record because first is classes, and first spot is always the date (first date is lowest)
                maxdate = new Date(lineData[count][0]); // last record has maxdate from the sorting done in the API view (orderBy => .Date)

            // define the x scale  (horizontal)
            var xScale = d3.time.scale()
	         .domain([mindate, maxdate])    // values from first record and last record and all in inbetween.
		    .range([padding, width - padding * 2]);



            // Scale the range of the data - want to try to use the d3.extent function if possible
            //xScale.domain(d3.extent(data, function (d) { return d.date; }));

            // define the y axis
            var yAxis = d3.svg.axis()
                .orient("left")
                .scale(yScale);

            // define the x axis
            var xAxis = d3.svg.axis()
                .orient("bottom")
                .scale(xScale)
                .ticks(count);

            // draw y axis with labels and move in from the size by the amount of padding
            svgContainer.append("g")
                .attr("transform", "translate(" + padding + ",0)")
                .call(yAxis);

            /* same as directly above, only using a predefined css class for styling */
            //// draw y axis with labels and move in from the size by the amount of padding
            //svgContainer.append("g")
            //    .attr("class", "axis")
            //    .attr("transform", "translate(" + padding + ",0)")
            //    .call(yAxis);


            /* draw x axis with labels and move to the bottom of the chart area */
            /*  ***This one is assuming there is a css styling for xaxis, I have it in region above */
            svgContainer.append("g")
                .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
                .attr("transform", "translate(0," + (height - padding) + ")")
                .call(xAxis);

            // now rotate text on x axis
            // first move the text left so no longer centered on the tick
            // then rotate up to get 45 degrees.
            svgContainer.selectAll(".xaxis text")  // select all the text elements for the x axis - this is in css styling and text is also defined
               .attr("transform", function (d) {
                   return "translate(" + this.getBBox().height * -2 + "," + this.getBBox().height + ")rotate(-45)";
               });

            // now add titles to the axes
            svgContainer.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + (padding / 2) + "," + (height / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .text("Scores");

            svgContainer.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (width / 2) + "," + (height - (padding / 3)) + ")")  // centre below axis
            .text("Scores Dates");
            //#endregion

            //#region Provide formatted data for the lines to be drawn

            /* draw the lines */
            //#region My Loop this week end (09/06-07, trying to grab the data via a 3 level loop for comparing the classes.  I just created a buildJsonScoresBySubject routine
            //for (var subject = 1; subject < lineData[0].length; subject++) {
            //    var dates = [];  // x
            //    var scores = [];  // y
            //    for (var i = 1; i < lineData.length; i++) {
            //        dates.push(lineData[i][0].toString());
            //        for (var j = 1; j < lineData[i].length; j++) { // might want to use subject for 2nd level instead of j
            //            if (lineData[i][j] != null) {
            //                scores.push(lineData[i][j]);
            //            }
            //        }
            //    }
            //}
            //#endregion

            /* this grabs the dates without a doubt, without using the buildChartData routine, that only worked well for Google charts. */
            //for (var i = 1; i < lineData.length; i++) {

            //for (var j = 1; j < lineData[i].length; j++) {
            //    scores.push(lineData[i][j]);
            //}

            //}

            /* setup the x.y data using the scales I set above for range and domain */
            //var x = d3.scale.linear()
            //    .domain(d3.extent(dates))
            //    .range(xScale.range)
            //var y = d3.scale.linear()
            //    .domain(d3.extent(scores))
            //    .range(yScale.range)

            // accessor line
            //var lineFunction = d3.svg.line()
            //                        .x(function (d) { return d.x; })
            //                        .y(function (d) { return d.y; })
            //                        .interpolate("linear")

            /* this actually draws the line onto the chart.  Will have to be put into a loop until I figure out some more d3.js */
            //svgContainer.append("path")
            //    .attr("d", lineFunction(lineData))
            //    .style({
            //        fill: "none",
            //        stroke: "#000"
            //    });
            //#endregion

            //#region original tries as creating a linear graph.  some of the code might come in useful so I left it for now.
            //Create the Scale we will use for the Axis
            //var axisScale = d3.scale.linear()
            //                         .domain([0, 100])
            //                         .range([0, 400]);


            ////The line SVG Path we draw
            //var lineGraph = svgContainer.append("path")
            //                            .attr("d", lineFunction(lineData))
            //                            .attr("stroke", "blue")
            //                            .attr("stroke-width", 2)
            //                            .attr("fill", "none");
            //#endregion

            //#region Example of finding the date in json object to for calculating the min/max dates dymancially


            //var subjects = getSubjects(indata);
            //subjects.unshift("ScoredDate"); //unshift adds to front of array

            //var arrayData = [];
            //arrayData.push(subjects);

            //for (var i = 0; i < indata.length; i++) {

            //    var arrayItem = indata[i];
            //    var dataRow = [];

            //    dataRow.push(arrayItem.ScoredDate);

            //    for (var j = 1; j < subjects.length; j++) {
            //        if (j == subjects.indexOf(arrayItem.Subject)) {
            //            dataRow.push(arrayItem.ScorePercent);
            //        } else {
            //            dataRow.push(null);
            //        }
            //    }

            //    arrayData.push(dataRow);
            //}
            //return arrayData;


            //#endregion


            //#region  A 'for' loop for grabbing coordinates.
            // our coordinate holders
            //var x = [];
            //var y = [];

            //for (var i = 0; i < lineData.length; i++) {
            //    //if lineData[i].valueOf()
            //    //var linePts = 
            //    var temp_x, temp_y;
            //    var temp_x = lineData[i].ScoredDate;
            //    var temp_y = lineData[i].ScorePercent;
            //if (temp_x >= max_x) { max_x = temp_x; }
            //if (temp_y >= max_y) { max_y = temp_y; }
        }
        //    //Make an SVG Container
        //    var svgContainer = d3.select(area).append("svg")
        //                                        .attr("width", 750)
        //                                        .attr("height", 350);



        //    var lineGraph = svgContainer.append("path")
        //    .attr("d", lineFunction(lineData))
        //    .attr("stroke", "blue")
        //    .attr("stroke-width", 2)
        //    .attr("fill", "none");


        //#endregion       

        //#region First shot at d3 chart
        /* create our x and y axes, set domain and range for minimum and maximum values on graph */
        //var area = '#' + divToPlaceChartIn;
        //var vis = d3.select(area),
        //    WIDTH = 750,
        //    HEIGHT = 350,
        //    MARGINS = {
        //        top: 20,
        //        right: 20,
        //        bottom: 20,
        //        left: 50
        //    },   /* x range  */
        //    xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
        //        return d.x;
        //    }), d3.max(lineData, function(d) {
        //        return d.x;

        //    }),
        //    yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
        //       return d.y;
        //    }), d3.max(lineData, function(d) {
        //        return d.y;
        //    }), d3.max(lineData, function(d) {
        //        return d.y;
        //    })]),
        //    xAxis = d3.svg.axis()
        //        .scale(xRange)
        //        .tickSize(5)
        //        .tickSubdivide(true),
        //    yAxis = d3.svg.axis()
        //        .scale(yRange)
        //        .tickSize(5)
        //        .orient('left')
        //        .tickSubdivide(true)]);

        //vis.append('svg:g')
        //    .attr('class', 'x axis')
        //    .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
        //    .call(xAxis);

        //vis.append('svg:g')
        //    .attr('class', 'y axis')
        //    .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
        //    .call(yAxis);

        ///* use d3.svg.line() to draw our line graph */
        //var lineFunc = d3.svg.line()
        //    .x(function (d) {
        //        return xRange(d.x);
        //    })
        //    .y(function (d) {
        //        return yRange(d.y);
        //    })
        //    .interpolate('linear');

        ///* set the d attribute of the SVG path to the coordinates returned from the line function */
        //vis.append('svg:path')
        //    .attr('d', lineFunc(lineData))
        //    .attr('stroke', 'blue')
        //    .attr('stroke-width', 2)
        //    .attr('fill', 'none');
        //#endregion

        //#region Chaining method examples.  That is how d3 works, especially with asyncronous programming

        // using a chain method for attributes  
        //svg.select("rect")  
        //   .attr("width", 700)
        //   .attr("height", 300)
        //   .style("fill")

        ////grab the data  
        //d3.select("body").selectAll("p")
        //  .data(indata)
        //  .enter()
        //  .append("p")
        //  .text("New paragraph!");

        //#endregion

    }
    //#endregion

    /* get all the subjects listed for each student for other functionality dealing with charts and proficiency */
    function getSubjects(indata) {
        var subjectArray = [];

        for (var i = 0; i < indata.length; i++) {

            var arrayItem = indata[i];

            if (subjectArray.indexOf(arrayItem.Course) < 0) {
                subjectArray.push(arrayItem.Course);
            }
        }
        return subjectArray;
    };


    /* get all the courses that go with the subjects for the current student for charting and detail views */
    function getCourses(indata) {

        var courseArray = [];
        if (!_.isUndefined(indata) && !_.isNull(indata))
            for (var i = 0; i < indata.length; i++) {

                var arrayItem = indata[i];

                if (courseArray.indexOf(arrayItem.Course) < 0) {
                    courseArray.push(arrayItem.Course);
                }
            }
        return courseArray;
    };

    /* get formatted data for chart  */
    /* this formats the date into a Months string using moment.js */
    function formattingChartArray(data) {

        var graphData = [];
        var months = []; // horizontal ticks

        var constMonth = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

        var count = data.length - 1;
        if (count > 0) {
            var maxYear = moment(data[count].ScoredDate).format('YYYY'); // last record has maxdate from the sorting done in the API view (orderBy => .Date)           
        }
        else {
            var maxYear = moment(data[count].ScoredDate).add(1, 'years').format('YYYY');
            if (moment(data[count].ScoredDate).format('M') < 8)
                maxYear = maxYear - 1;
        }

        // pushing months into array for a year to showing on X-Axis of chart.
        for (var i = maxYear - 1; i <= maxYear ; i++)
            for (var j = 0 ; j < constMonth.length; j++) {
                if (months.indexOf(constMonth[j] + ' ' + i) == -1 && i < maxYear && j <= 4)
                    months.push(constMonth[j] + ' ' + i);
                else if (maxYear == i && j > 4)
                    months.push(constMonth[j] + ' ' + i);
            }


        var subjects = getSubjects(data);
        subjects.unshift("Months"); // unshift adds to front of array

        // set up data structure for google chart/graph
        graphData.push(subjects);  // set series to top row
        _.each(months, function (month, idx) {
            var monthSeries = [];
            monthSeries.push(month);
            for (var x = 1; x < subjects.length; x++) {
                monthSeries.push(null);
            }
            graphData.push(monthSeries);
        });


        var groupedDataSubjects = _.groupBy(data, "Course");
        _.each(groupedDataSubjects, function (items, subjectName) {
            var subjectIdx = graphData[0].indexOf(subjectName);
            var itemsByMonth = _.groupBy(items, "Month");
            _.each(itemsByMonth, function (itemsInMonth, monthName) {
                for (var x = 0; x < graphData.length; x++) {
                    var monthIdx = graphData[x].indexOf(monthName);
                    if (subjectIdx >= 0 && monthIdx >= 0) {
                        for (var z = 0; z < itemsInMonth.length; z++) {
                            if (graphData[x][subjectIdx] === null) {
                                graphData[x][subjectIdx] = noNaN(parseFloat(itemsInMonth[z].ScorePercent));
                            }
                            else {
                                graphData[x][subjectIdx] = noNaN(parseFloat(graphData[x][subjectIdx])) + noNaN(parseFloat(itemsInMonth[z].ScorePercent));
                            }
                        }
                        graphData[x][subjectIdx] = noNaN(parseFloat(graphData[x][subjectIdx])) / itemsInMonth.length;
                    }
                }
            });
        });

        return graphData;

    }

    function noNaN(n) {
        return isNaN(n) ? 0 : n;
    }

    /* builds the json objects for the student */
    function buildChartArray(indata) {

        var subjects = getSubjects(indata);
        subjects.unshift("ScoredDate"); // unshift adds to front of array

        var arrayData = [];
        arrayData.push(subjects);

        for (var i = 0; i < indata.length; i++) {

            var arrayItem = indata[i];
            var dataRow = [];

            dataRow.push(arrayItem.ScoredDate);

            for (var j = 1; j < subjects.length; j++) {
                if (j == subjects.indexOf(arrayItem.Course)) {
                    dataRow.push(arrayItem.ScorePercent);
                } else {
                    dataRow.push(null);
                }
            }

            arrayData.push(dataRow);
        }
        return arrayData;
    };


    /* build json object for D3 linedata: array of json objects sorted by date, then grouped by subject, 
     * each containing the scores for that subject and will feed data for each subject's scorePercent and date */
    function buildJsonScoresBySubject(indata) {
        /* from here to arrayData.push(subjects) mimics buildChartArray(indata) routine */
        var subjects = getSubjects(indata);
        //subjects.unshift("ScoredDate"); // unshift adds to front of array

        //var arrayData = [];
        //arrayData.push(subjects);

        //#region studentSubject Object
        //for (var i = 0; i < indata.length; i++) {
        //    var arrayItem = indata[i];
        //    /* json object properties */
        //    var studentSubjectScores = {
        //        studentId: '@',
        //        subjects: [               // first-level JSON object array:  the subjects the student takes
        //            {
        //                subject: '@',
        //                scores: [         // second-level JSON object array: the dates and scores for the current subject in array
        //                    {
        //                        scoreDate: '@',
        //                        scorePercent: '@'
        //                    }
        //                ]
        //            }
        //        ]
        //    };

        //    dataRow.push(arrayItem.ScoredDate);

        //    for (var j = 1; j < subjects.length; j++) {
        //        if (j == subjects.indexOf(arrayItem.Subject)) {
        //            dataRow.push(arrayItem.ScorePercent);
        //        } else {
        //            dataRow.push(null);
        //        }
        //    }

        //    arrayData.push(dataRow);
        //}
        //return arrayData;
        //#endregion

        //#region Same code as what's is buildChartArray
        /*for (var i = 0; i < indata.length; i++) {
    
            var arrayItem = indata[i];
            var dataRow = [];
            var subject = arrayItem.Subject;
    
    
    
    
            for (var j = 1; j < subjects.length; j++) {
                var subject = subjects.indexOf(arrayItem.Subject)
                while (j == subjects.indexOf(arrayItem.Subject)) {
                    dataRow.push(arrayItem.ScoredDate);
                    dataRow.push(arrayItem.ScorePercent);
                }
            }
        }*/
        //#endregion

        /* define arrays to store values in to sync scores with class */
        var classes = [];
        var scoresDates = [];
        var scorePercents = [];
        var records = [];
        /* define object with properties for student w/ JSON containing dynamic array of subjects, inside of that property, a dynamic array 
         * of the dates/scores for that subject */
        var x = 1;


        //#region buildChartArray data to get the subjects, put them in holder to use for looping through original json objects
        /* new code */
        //var data = buildChartArray[indata];  // I want the chart array for the data, but I want to iterate through the json data the array was made out of
        //var subjectHolder = []; // making array to hold all the classes that are in the first array block of data
        //for (i = 1; i < data[0].length; i++) {
        //    subjectHolder.push(data[0][i])
        //}
        /* end new code */
        //#endregion
        var counter = 0;
        for (var sbj in indata) {

            if (indata.hasOwnProperty(sbj)) {
                //#region some looping with conditions I tried
                //for (var j = 1; j < subjects.length; j++) {
                //    if (j == subjects.indexOf(arrayItem.Subject)) {
                //        var subjectName = indata[j].Subject;

                //        var scoreDate = indata[counter].ScoredDate;
                //        var score = data[counter].ScorePercent;
                //        alert('Customer Name = ' + subjectName + ' .. ScoreDate = ' + scoreDate + '..Score..=' + score);
                //        subjectNames.push(subjectName);

                //    } else {
                //        dataRow.push(null);
                //    }
                //}
                //#endregion

                var subjectName = indata[counter].Subject;
                //var subName = indata[counter].Subject;
                var scoreDate = indata[counter].ScoredDate;
                var score = indata[counter].ScorePercent;
                //#region Using subject[] array and loops through all json objects grouping by subjects and collecting the score data and score for each class
                /*  new code to set on subject and get values*/
                // this is taking array of all subjects defined above, looping for each subject through entire json array(indata) and creates a tree structure
                //for (subj = 0; subj < subjectHolder.length; subj++) {
                //    for (j = 1; j < indata.length; j++) {
                //        if (subjectHolder[subj] == subjectName) {
                //            var subName = indata[counter].Subject;
                //            var scoreDate = indata[counter].ScoredDate;
                //            var score = indata[counter].ScorePercent;
                //        }

                //    }

                //}
                /* end new code */
                //#endregion

                //alert("Class Name = " + subjectName + " .. Score Date = " + scoreDate + '..Score: .. ' + score);
                //                {"employees":[
                //{"firstName":"John", "lastName":"Doe"}, 
                //{"firstName":"Anna", "lastName":"Smith"},
                //{"firstName":"Peter", "lastName":"Jones"}
                //                ]}
                //var objects = [{
                //    subject: subjectName,
                //    scores: [
                //        {
                //            scoredDate: scoreDate,
                //            scoredPct: score
                //        }
                //    ]
                //}]
                var objects = {
                    subject: subjectName,
                    scores: [
                            scoreDate,
                            score
                    ]
                }
                //vm.scoringinfo = JSON.parse(objects);
                records.push(JSON.stringify(objects));
                classes.push(subjectName);

                scoresDates.push(scoreDate);

                scorePercents.push(score);
                counter++;
            }



        }
        var sort_by = function (field, reverse, primer) {

            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = [-1, 1][+ !!reverse];

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }
        var sortedRecords = [];
        records.sort(sort_by('subject', false, function (a) {
            return a.toUpperCase()
        }));
        /* for debugging purposes */
        //alert("Subjects Array = " + classes + " .. Dates Array = " + scoresDates + "All Scores:.." + scorePercents);
    };

    // method to replace from null value to intersection value if null value exists between two numeric values  
    function getContinousLineBetweenTwoCoordinates(graphData) {
        // logic to replace from null value to intersection value if null value exists between two numeric values  
        /*[["_Standards", "CCSSAB.07.MA.MA.7.CCSS.Math.Cont.7.SP.C.8b"],
         *["Aug 2013", null],
         *["Sep 2013", 1.05],
         *["Oct 2013", 2.05],
         *["Nov 2013", null], -> this value needs to be changed with blow logic
         *["Dec 2013", null], -> this value needs to be changed with blow logic
         *["Jan 2014", 2.54],
         *["Feb 2014", 0],
         *["Mar 2014", 1.07],
         *["Apr 2014", 0],
         *["May 2014", 0],
         *["Jun 2014", 1.1836666666666666],
         *["Jul 2014", null]]
         */
        if (!_.isUndefined(graphData[0])) {
            for (var col = 1; col < graphData[0].length; col++)
                for (var row = 1; row < graphData.length; row++) {
                    if (_.isNull(graphData[row][col])) {

                        var colArray = _.pluck(graphData, col).slice(1);

                        //line 1 coordinates
                        var x1 = row - 1,
                            y1 = graphData[row - 1][col],
                            y2 = _.first(_.compact(_.rest(colArray, row))),
                            x2 = _.indexOf(_.rest(colArray, row), y2) + row + 1, // find indexof from rest array values.
                            line1 = [[x1, y1], [x2, y2]];

                        // line 2 coordinates 
                        var x3 = row,
                            y3 = 0,
                            x4 = x3,
                            y4 = _.max(colArray), // max value of the column
                            line2 = [[x3, y3], [x4, y4]];


                        /* here line_intersection.js javascript library is used to get intersect coordinates
                        * method  getLineIntersectionData(line1_data , line2_data) is used.
                        * @param line1_data - Mandatory argument that contains the data of line1 of the form
                        * [[x1, y1], [x2, y2], ... [xn, yn]]
                        *
                        * @param line2_data - Mandatory argument that contains the data of line2 of the form
                        * [[x1, y1], [x2, y2], ... [xn, yn]]
                        */
                        graphData[row][col] = getLineIntersectionData(line1, line2).icptY; // replace null value with intersection value.
                    }
                }
        }
    }

})();

_.mixin({
    groupByMulti: function (obj, values, context) {
        if (!values.length)
            return obj;
        var byFirst = _.groupBy(obj, values[0], context),
            rest = values.slice(1);
        for (var prop in byFirst) {
            byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
        }
        return byFirst;
    }
});

/* handlers for the chart click events to show details */
function selectHandler_ScoreChart_div() {
    var scope = angular.element($('#assmt')).scope();

    scope.$apply(function () {
        scope.showScoreDetail();
    });
}

function selectHandler_ProficiencyChart_div() {
    var scope = angular.element($('#assmt')).scope();

    scope.$apply(function () {
        scope.showProficiencyDetail();
    });
}
