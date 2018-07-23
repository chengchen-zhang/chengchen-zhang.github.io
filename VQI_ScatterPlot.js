function VQI_ScatterPlot(id) {
    var self = this;
    if (id === undefined) {
        alert("the input is missing!");
        return;
    }

    this.div_id = id;
    var dataset = [];
    var w = 500;
    var h = 300;
    var padding = 40;
    var graphCounter = 0;
    var selectedPersonIds = [];
    var selected = [];
    var coordinates = [0, 0];
    var xChange = 0;
    var yChange = 0;
    var selectionBoxSwitch = false;
    var k = 0;
    var cornerCoordinates = [];
    var selectedIds = [];
    var polyCounter = 0;
    var customPoly = false;
    var lineBox = false;
    var polyInGraphId = 'none';
    var trendBoxCorners = [];
    var aliasNames = [];
    var geneNames = []
    sampledataset = [
        "genenames	aa	bb	cc	dd",
        "ab	1	100	1	89",
        "bb	1	90	1	65",
        "cb	100	80	80	64",
        "db	89	65	58	34"
    ];

    this.createDataset = function(rawInput, geneOne, geneTwo, idColumn) {
        var sampleSize = rawInput.length - 1;
        var personNames = rawInput[0].split("\t");
        var g1 = false;
        var g2 = false;
        for (var i = 1; i < rawInput.length; i++) {
            var lineArray = rawInput[i].split("\t");
            if (lineArray[idColumn] == geneOne) {
                var indexGOne = i;
                g1 = true;
            }
            if (lineArray[idColumn] == geneTwo) {
                var indexGTwo = i;
                g2 = true;
            }
            if (g1 && g2)
                break;
        }

        var geneOneValues = rawInput[indexGOne].split("\t");
        var geneTwoValues = rawInput[indexGTwo].split("\t");
        //console.log(indexGTwo);
        //console.log(geneTwoValues[159]);
        var dataOutput = [];
        for (var i = (idColumn + 1); i < geneOneValues.length; i++) {

            if (i != 159) {
                if (geneOneValues[i] != "?" && geneTwoValues[i] != "?") {
                    if (~(isNaN(parseFloat(geneOneValues[i]))) && ~(isNaN(parseFloat(geneTwoValues[i])))) {
                        if (selectedPersonIds.length == 0) {
                            dataOutput.push([(parseFloat(geneOneValues[i])), (parseFloat(geneTwoValues[i])), personNames[i]]);
                        } else {
                            if (selectedPersonIds.indexOf(personNames[i]) > -1) {
                                dataOutput.push([(parseFloat(geneOneValues[i])), (parseFloat(geneTwoValues[i])), personNames[i]]);
                            }
                        }

                    }
                }
            }
        }
        //console.log(dataOutput);
        return dataOutput;
    }

    d3.select("#" + id)
        .append("body")
        .attr("id", "drop")

    d3.select("#drop")
        .append("div")
        .attr("id", "main" + id)

    d3.select("#main" + id)
        .style("min-height", "60px")
        .style("width", "700px")
        .style("border", "1px solid blue")
        .style("margin", "10px")
        .style("padding", "10px");


    d3.select("#main" + id)
        .append("input")
        .attr("type", "file")
        .attr("id", "rawInput");   

    d3.select("#main" + id)
        .append("datalist")
        .attr("id", "geneList");

    d3.select("#main" + id)
        .append("input")
        .attr("type", "text")
        .attr("id", "geneOne")
        .attr("list", "geneList");


    d3.select("#main" + id)
        .append("input")
        .attr("type", "text")
        .attr("id", "geneTwo")
        .attr("list", "geneList");
    

	function highLightInput(){
		console.log('highlightInput');
	}

	

    function downloadGraph(graphName) {
        Pablo('#' + graphName)

        .download('svg', 'graph.svg', function(result) {
            //console.log("graph Downloaded");
        });
    }

    function deleteGraph() {

        d3.select("#graph0").remove();
    }

    this.exportIds = function() {
        var Str = '';
        for (var i = 0; i < selected.length; i++) {
            (d3.select("#" + selected[i]).attr("id", function(d) {
                if (selectedPersonIds.indexOf(d[2]) == -1)
                    selectedPersonIds.push(d[2]);
                return d3.select("#" + selected[i]).attr("id");
            }));

        }
        for (var i = 0; i < selectedPersonIds.length; i++) {
            Str += selectedPersonIds[i];
            Str += "\n";
        }
        //console.log(Str);
        download("selectedIds.txt", Str);
    }

    this.clearPolygon = function() {
        for (var i = 0; i < polyCounter; i++) {
            d3.select("#polygon" + i).remove();
        }
        polyCounter = 0;
    }

    function clearPolygon2() {
        for (var i = 0; i < polyCounter; i++) {
            d3.select("#polygon" + i).remove();
        }
        polyCounter = 0;
    }


    function highlightList(samplePeople) {
        self.clearSelected();
        for (var i = 0; i < samplePeople.length; i++) {
            for (var k = 0; k < graphCounter; k++) {
                d3.select("#" + "circle" + samplePeople[i] + k)
                    .attr("fill", "red");
                selected.push("circle" + samplePeople[i] + k);
            }
        }
    }

    this.highlightSelectedinAllGraphs = function() {
        selectedPersonIds = [];
        for (var i = 0; i < selected.length; i++) {

            d3.select("#" + selected[i]).attr("id", function(d) {
                if (selectedPersonIds.indexOf(d[2]) == -1)
                    selectedPersonIds.push(d[2]);
                return d3.select("#" + selected[i]).attr("id");
            });

        }
        //console.log(selectedPersonIds);
        highlightList(selectedPersonIds);
    }

    this.connectSelected = function() {

        var svg = d3.select("#" + polyInGraphId);
        
        var polygonName = "polygon" + polyCounter;
        

        svg.selectAll("#" + polygonName)
            .data([cornerCoordinates])
            .enter().append("polygon")
            .attr("points", function(d) {
                return d.map(function(d) {
                    return [d[0], d[1]].join(",");
                }).join(" ");
            })
            .attr("stroke", "orange")
            .attr("stroke-dasharray", "4px")
            .attr("stroke-opacity", 1)
            .attr("fill", "transparent")
            .attr("id", polygonName);

        for (var i = 0; i < selectedIds.length; i++) {
            d3.select("#" + selectedIds[i]).remove();
        }
       
        svg.selectAll("circle")
            .filter(function(d, i) {
                var intersectionCounter = 0;
                var xx = d3.select(this).attr('cx');
                var yy = d3.select(this).attr('cy');
                for (var j = 0; j < cornerCoordinates.length - 1; j++) {
                    intersectionCounter += lineIntersects(xx, yy, 0, yy, cornerCoordinates[j][0], cornerCoordinates[j][1], cornerCoordinates[j + 1][0], cornerCoordinates[j + 1][1]);
                }
                intersectionCounter += lineIntersects(xx, yy, 0, yy, cornerCoordinates[cornerCoordinates.length - 1][0], cornerCoordinates[cornerCoordinates.length - 1][1], cornerCoordinates[0][0], cornerCoordinates[0][1]);
                if (intersectionCounter % 2 == 1) {
                 //   //console.log(d3.select(this).attr("id"));
                    selected.push(d3.select(this).attr("id"));
                    return true;

                } else {

                    return false;
                }
            })
            .attr('fill', 'red');
        cornerCoordinates = [];
        selectedIds = [];
        polyCounter++;
        customPoly = false;
        polyInGraphId = 'none';

    }

    function lineIntersects(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {

        var s1_x, s1_y, s2_x, s2_y;
        s1_x = p1_x - p0_x;
        s1_y = p1_y - p0_y;
        s2_x = p3_x - p2_x;
        s2_y = p3_y - p2_y;

        var s, t;
        s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            // Collision detected
            return 1;
        }

        return 0; // No collision
    }

    function getGeneNames() {
        var file = document.getElementById("geneInput").files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent) {


            // By lines
            var lines = this.result.split('\n');

            highlightList(lines);
        };
        reader.onerror = function(event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };
        reader.readAsText(file);
    }

    this.clearSelected = function() {
        //console.log('clearSelected');
        for (var i = 0; i < selected.length; i++) {
            d3.select("#" + selected[i])
                .attr("fill", "black");
        }
        selected = [];
        selectedPersonIds = [];
        makeList();
        self.clearPolygon();

    };


    var selectedPeople = d3.select("peopleNames")
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("font-size", "11px");


    function makeList() {
        selectedPeople.selectAll("text")
            .data(selectedPersonIds)
            .enter()
            .append("text")
            .text(function(d) {
                return d;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i) {
                return 40;
            })
            .attr("y", function(d, i) {
                return 40 + i * 12;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black");
    }


    this.getRawInput = function() {
        var file = document.getElementById("rawInput").files[0];
        var reader = new FileReader();
        reader.onload = function(progressEvent) {


            // By lines
            var lines = this.result.split('\n');
            var idsinColumn = 1;
            dataset = self.createDataset(lines, getGeneOneName(), getGeneTwoName(), idsinColumn);
            self.makeGraph(dataset);
        };
        reader.onerror = function(event) {
            console.error("File could not be read! Code " + event.target.error.code);
        };
        reader.readAsText(file);
    }

    function getGeneOneName() {
        var name = document.getElementById("geneOne").value;
        //console.log(aliasNames.indexOf(name));
        if (geneNames.indexOf(name) !== -1) {
            //console.log('hi');
            name = document.getElementById("geneOne").value;
        } else if (aliasNames.indexOf(name) !== -1) {
            //console.log(aliasNames[aliasNames.indexOf(name) - 1]);
            name = geneNames[aliasNames[aliasNames.indexOf(name) - 1]];


        } else {
            document.getElementById("geneOne").value;
        }
        //console.log(name);
        return name;
    }

    function getGeneTwoName() {
        var name = document.getElementById("geneTwo").value;
        //console.log(aliasNames.indexOf(name));
        if (geneNames.indexOf(name) !== -1) {
            //console.log('hi');
            name = document.getElementById("geneTwo").value;
        } else if (aliasNames.indexOf(name) !== -1) {
            //console.log(aliasNames[aliasNames.indexOf(name) - 1]);
            name = geneNames[aliasNames[aliasNames.indexOf(name) - 1]];


        } else {
            document.getElementById("geneTwo").value;
        }
        //console.log(name);
        return name;
    }

    function calculateRegression(dataset) {
        var n = dataset.length;
        var ySum = 0;
        for (var i = 0; i < dataset.length; i++)
            ySum += dataset[i][1];
        //console.log(ySum);
        var xSum = 0;
        for (var i = 0; i < dataset.length; i++)
            xSum += dataset[i][0];
        //console.log(xSum);
        var xSquaredSum = 0;
        for (var i = 0; i < dataset.length; i++)
            xSquaredSum += (dataset[i][0] * dataset[i][0]);
        //console.log(xSquaredSum);
        var ySquaredSum = 0;
        for (var i = 0; i < dataset.length; i++)
            ySquaredSum += (dataset[i][1] * dataset[i][1]);
        //console.log(xSquaredSum);
        var xySum = 0;
        for (var i = 0; i < dataset.length; i++)
            xySum += (dataset[i][0] * dataset[i][1]);
        //console.log(xySum);
        var a = (ySum * xSquaredSum - xSum * xySum) / (n * xSquaredSum - xSum * xSum);
        //console.log(a);
        var b = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
        //console.log(b);
        var c = (n * xySum - xSum * ySum) / Math.sqrt((n * xSquaredSum - xSum * xSum) * (n * ySquaredSum - ySum * ySum));
        //console.log(c * c);
        c = Math.round(c * 100) / 100;
        return [a, b, c];
    }

    function findRegPoint(ab, endPoint, startX) {
        var startPoint = ab[0] + startX * ab[1];
        //console.log(startPoint);
        var endPoint = ab[0] + endPoint * ab[1];

        return [startPoint, endPoint];
    }


    function customPolygon() {
        if (customPoly) {
            customPoly = false;
        } else
            customPoly = true;
    }



    this.makeGraph = function(dataset) {
        var rangeVal = d3.max(dataset, function(d) {
            return d[1];
        }) - d3.min(dataset, function(d) {
            return d[1];
        });
        var graphHeight = 220;
        var zoomOutRatio = -0.1;
        d3.select("#drop")
            .append("svg")
            .attr("height", h)
            .attr("width", w)
            .attr("id", "graph" + graphCounter)
            .attr("font-size", "11px")
            .on("click", function(evt) {
                if (d3.event.shiftKey && (polyInGraphId == d3.select(this).attr("id") || polyInGraphId == 'none')) {
                    var coordinates = [0, 0];
                    coordinates = d3.mouse(this);
                    var x = coordinates[0];
                    var y = coordinates[1];
                    cornerCoordinates.push([x, y]);
                    //console.log(x + " " + y);

                    svg
                        .append("circle")
                        .attr("fill", "orange")
                        .attr("cx", function(d) {
                            return x;
                        })
                        .attr("cy", function(d) {
                            return y;
                        })
                        .attr("r", function(d) {
                            return 3;
                        })
                        .attr("id", function(d) {
                            var name = "circle" + k;
                            polyInGraphId = d3.select(this.parentNode).attr("id");
                            selectedIds.push(name);
                            return name;
                        })
                    k++;
                }
            });;

        var svg = d3.select("#graph" + graphCounter);
		
		var xmin = d3.min(dataset, function(d) {
                return d[0];
            });
        var xmax = d3.max(dataset, function(d) {
                return d[0];
            })
        var ymin = d3.min(dataset, function(d) {
                return d[1];
            });
        var ymax = d3.max(dataset, function(d) {
                return d[1];
            });
    	
    	if(xmin > 0) {
        	xmin = xmax*zoomOutRatio; 
        }
        
        if (xmax < 0) {
        	xmax = xmin*zoomOutRatio;
        }
        
        
        if(ymin > 0) {
        	ymin = ymax*zoomOutRatio; 
        }
            
        if(ymax < 0) {
        	ymax = ymin*zoomOutRatio; 
        }
        
		
        var xScale = d3.scaleLinear()
            .domain([xmin, xmax])
            .range([padding, w - padding * 2]);
        var yScale = d3.scaleLinear()
            .domain([ymin,ymax])
            .range([h - padding, padding]);


        var rScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, function(d) {
                return d[1];
            })])
            .range([2, 5]);

        var ab = calculateRegression(dataset);
        var endPoint = d3.max(dataset, function(d) {
            return d[0];
        });
        endPoint = xmax;
        var startPoint = d3.min(dataset, function(d) {
            return d[0];
        });
        startPoint = xmin;
        var points = findRegPoint(ab, endPoint, startPoint);

        svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d[0]);
            })
            .attr("cy", function(d) {
                return yScale(d[1]);
            })
            .attr("r", function(d) {
                return 3;
            })
            .attr("id", function(d) {
                return "circle" + d[2] + graphCounter;
            })
            .on("mouseover", function(d) {
                d3.select(this)
                    .attr("fill", function(d) {
                        /*	for(var i = 0; i < graphCounter; i++) {
                        	if(d3.select("#circle" + d[2] + i).attr("id") !== null){
                        		d3.select("#circle" + d[2] + i)
                        		  .attr("fill","orange");
                        		}
                        	}*/

                        return "orange";
                    });
                d3.select("#label" + d3.select(this).attr("id"))
                    .text(d[2]);
                //console.log(d[2]);
            })
            .on("mouseout", function(d) {
                var pointId = d3.select(this).attr("id");
                if (selected.indexOf(pointId) > -1) {
                    d3.select(this)
                        .transition()
                        .duration(250)
                        .attr("fill", function(d) {
                            /*	for(var i = 0; i < graphCounter; i++) {
                            		if(d3.select("#circle" + d[2] + i).attr("id") !== null){
                            		var dupPointId = d3.select("#circle" + d[2] + i).attr("id");
                            		if(selected.indexOf(dupPointId) > -1) {
                            		d3.select("#circle" + d[2] + i)
                            		  .attr("fill","red");
                            		} else {
                            		d3.select("#circle" + d[2] + i)
                            		  .attr("fill","black");
                            		}}
                            	}*/

                            return "red";
                        });
                    d3.select("#label" + pointId)
                        .text('');
                } else {
                    d3.select(this)
                        .transition()
                        .duration(250)
                        .attr("fill", function(d) {
                            /* 	for(var i = 0; i < graphCounter; i++) {
                             	if(d3.select("#circle" + d[2] + i).attr("id") !== null){
                             		var dupPointId = d3.select("#circle" + d[2] + i).attr("id");
                             		if(selected.indexOf(dupPointId) > -1) {
                             		d3.select("#circle" + d[2] + i)
                             		  .attr("fill","red");
                             		} else {
                             		d3.select("#circle" + d[2] + i)
                             		  .attr("fill","black");
                             		}
                             		}
                             	}*/

                            return "black";
                        });
                    d3.select("#label" + pointId)
                        .text('');
                }
            })
            .on("click", function() {
                var pointId = d3.select(this).attr("id");
                var pointIndex = selected.indexOf(pointId);
                //console.log("CLICK");
                if (pointIndex > -1) {
                    //console.log("unselect");
                    selected.splice(pointIndex, 1);
                    d3.select(this).attr("fill", "black");
                } else {
                    //console.log("select");
                    selected.push(d3.select(this).attr("id"));
                    d3.select(this).attr("fill", "red");
                }
            });;

        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .attr("x", function(d) {
                return xScale(d[0]) + 5;
            })
            .attr("y", function(d) {
                return yScale(d[1]) - 5;
            })
            .attr("fill", "red")
            .attr("id", function(d) {
                return "label" + "circle" + d[2] + graphCounter;
            })
            .attr("font-size", "15px");

        var trendline = svg.selectAll(".trendline")
            .data(dataset);
		
		console.log(points);
		
        trendline.enter()
            .append("line")
            .attr("id", "theTrendgraph" + graphCounter)
            .attr("class", "trendline")
            .attr("x1", function(d) {
                return padding;
            })
            .attr("y1", function(d) {
                return yScale(points[0]);
            })
            .attr("x2", function(d) {
                return w - padding * 2;
            })
            .attr("y2", function(d) {
                return yScale(points[1]);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .on("mousedown", function() {
                lineBox = true;
            })
            .on("mouseup", function() {
                //console.log("mouselineUP");
            })
            .on("mouseover", function(d) {
                d3.select(this)
                    .attr("stroke", "orange");
            })
            .on("mouseout", function(d) {

                d3.select(this)
                    .transition()
                    .duration(250)
                    .attr("stroke", "black");

            });;

        var xAxis = d3.axisBottom(xScale)
            .ticks(5);
        var yAxis = d3.axisLeft(yScale)
            .ticks(5);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .attr("id","xBottomLine")
            .attr("opacity",0)
            .call(xAxis);
            
    	svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (yScale(0)) + ")")
            .attr("id","xZeroLine")
            .call(xAxis);
    	
        svg.append("g")
            .attr("class", "y axis")
            .attr("id","ySideLine")
            .attr("opacity",0)
            .attr("transform", "translate(40,0)")
            .call(yAxis);
        
    	svg.append("g")
            .attr("class", "y axis")
            .attr("id","yZeroLine")
            .attr("transform", "translate(" + (xScale(0)) + ",0)")
            .call(yAxis);

        svg.append("text") // text label for the x axis
            .attr("x", 240)
            .attr("y", 285)
            .style("text-anchor", "middle")
            .text(getGeneOneName());

        svg.append("text")

        .attr("y", 140)
            .attr("x", 20)

        .style("text-anchor", "middle")
            .text(getGeneTwoName());

        var rValue = Math.round(ab[2] * ab[2] * 100) / 100;

        svg.append("text")

        .attr("y", 140)
            .attr("x", 120)

        .style("text-anchor", "middle")
            .text("R^2: " + (rValue));

        var selectionBox = "selectionBox" + svg.attr("id");
        svg
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 0)
            .attr("width", 0)
            .attr("id", selectionBox)


        d3.select("#" + selectionBox)
            .attr("stroke", "orange")
            .attr("stroke-dasharray", "4px")
            .attr("stroke-opacity", 1)
            .attr("fill", "transparent");




        svg.on("mousedown", function() {
                //console.log('hi');
                d3.event.preventDefault();
                coordinates = d3.mouse(this);

                var xCo = coordinates[0];
                var yCo = coordinates[1];
                //console.log(d3.select(this).attr("id"));
                d3.select("#selectionBox" + d3.select(this).attr("id"))
                    .attr("x", xCo + 3)
                    .attr("y", yCo + 3);
                if (lineBox == false)
                    selectionBoxSwitch = true;
            })
            .on("mousemove", function() {
                d3.event.preventDefault();
                if (lineBox) {

                    var newCoordinates = [0, 0];
                    newCoordinates = d3.mouse(this);
                    var boxPadding = 1;
                    var x = newCoordinates[0];
                    var y = newCoordinates[1];
                    var svgId = d3.select(this).attr("id");
                    var trend = d3.select("#theTrend" + svgId);
                    var mb = findAB(trend.attr('x1'), trend.attr('y1'), trend.attr('x2'), trend.attr('y2'))

                    var distance = (x * mb[0] + mb[1] - y);
                    var negDist = -(x * mb[0] + mb[1] - y);

                    d3.select("#line1" + svgId)
                        .attr("x1", function(d) {

                            return trend.attr("x1") - boxPadding;
                        })
                        .attr("y1", function(d) {
                            // return y;
                            return trend.attr('y1') - distance;
                        })
                        .attr("x2", function(d) {

                            return parseInt(trend.attr('x2')) + boxPadding;
                        })
                        .attr("y2", function(d) {
                            // return y;
                            return trend.attr('y2') - distance;
                        })

                    .attr("stroke-width", 1);

                    d3.select("#line4" + svgId)
                        .attr("x1", function(d) {
                            //return x;
                            return trend.attr("x1") - boxPadding;
                        })
                        .attr("y1", function(d) {
                            // return y;
                            return trend.attr('y1') - negDist;
                        })
                        .attr("x2", function(d) {
                            // return 0;
                            return parseInt(trend.attr('x2')) + boxPadding;
                        })
                        .attr("y2", function(d) {
                            // return y;
                            return trend.attr('y2') - negDist;
                        })

                    .attr("stroke-width", 1);

                    d3.select("#line2" + svgId)
                        .attr("x1", function(d) {
                            //return x;
                            return trend.attr("x1") - boxPadding;
                        })
                        .attr("y1", function(d) {
                            // return y;
                            return trend.attr('y1') - distance;
                        })
                        .attr("x2", function(d) {
                            // return 0;
                            return trend.attr('x1') - boxPadding;
                        })
                        .attr("y2", function(d) {
                            // return y;
                            return trend.attr('y1') - negDist;
                        })

                    .attr("stroke-width", 1);

                    d3.select("#line3" + svgId)
                        .attr("x1", function(d) {
                            //return x;
                            return parseInt(trend.attr("x2")) + boxPadding;
                        })
                        .attr("y1", function(d) {
                            // return y;
                            return trend.attr('y2') - negDist;
                        })
                        .attr("x2", function(d) {
                            // return 0;
                            return parseInt(trend.attr('x2')) + boxPadding;
                        })
                        .attr("y2", function(d) {
                            // return y;
                            return trend.attr('y2') - distance;
                        })
                        .attr("stroke-width", 1);

                    d3.select("#residual" + svgId)
                        .text("Residual Value: " + parseInt(((distance) / graphHeight) * rangeVal * 1000) / 1000)
                        .attr("x", x - 70)
                        .attr("y", y - 8)
                        .attr("fill", "green")
                        .attr("opacity", 1)
                        .attr("font-size", "15px");
                }

                if (selectionBoxSwitch) {
                    var newCoordinates = [0, 0];
                    newCoordinates = d3.mouse(this);

                    var x = newCoordinates[0];
                    var y = newCoordinates[1];
                    xChange = x - coordinates[0];
                    yChange = y - coordinates[1];
                    if (xChange >= 0 && yChange >= 0) {
                        d3.select("#selectionBox" + d3.select(this).attr("id"))
                            .attr("x", coordinates[0])
                            .attr("y", coordinates[1])
                            .attr("width", xChange)
                            .attr("height", yChange);
                    } else if (xChange < 0 && yChange >= 0) {
                        d3.select("#selectionBox" + d3.select(this).attr("id"))
                            .attr("x", x)
                            .attr("y", coordinates[1])
                            .attr("width", Math.abs(x - coordinates[0]))
                            .attr("height", Math.abs(y - coordinates[1]));
                    } else if (xChange >= 0 && yChange < 0) {
                        d3.select("#selectionBox" + d3.select(this).attr("id"))
                            .attr("y", y)
                            .attr("x", coordinates[0])
                            .attr("width", Math.abs(x - coordinates[0]))
                            .attr("height", Math.abs(y - coordinates[1]));
                    } else if (xChange < 0 && yChange < 0) {
                        d3.select("#selectionBox" + d3.select(this).attr("id"))
                            .attr("y", y)
                            .attr("x", x)
                            .attr("width", Math.abs(x - coordinates[0]))
                            .attr("height", Math.abs(y - coordinates[1]));
                    }
                }


            })
            .on("mouseup", function() {

                if (lineBox == true) {
                    //console.log('lineboxup');
                    var trendBoxCorners = [];
                    var boxPadding = 1
                    var svgId = d3.select(this).attr("id");

                    var line1 = d3.select("#line1" + svgId);
                    var line2 = d3.select("#line4" + svgId);
                    var x1 = parseInt(line1.attr("x1"));
                    var y1 = parseInt(line1.attr("y1"));
                    var x2 = parseInt(line1.attr("x2"));
                    var y2 = parseInt(line1.attr("y2"));
                    var x3 = parseInt(line2.attr("x1"));
                    var y3 = parseInt(line2.attr("y1"));
                    var x4 = parseInt(line2.attr("x2"));
                    var y4 = parseInt(line2.attr("y2"));
                    trendBoxCorners = [
                        [x1, y1],
                        [x2, y2],
                        [x4, y4],
                        [x3, y3]
                    ];
                    //console.log(trendBoxCorners);
                    svg.selectAll("circle")
                        .filter(function(d, i) {
                            var intersectionCounter = 0;
                            var xx = d3.select(this).attr('cx');
                            var yy = d3.select(this).attr('cy');
                            for (var j = 0; j < trendBoxCorners.length - 1; j++) {
                                intersectionCounter += lineIntersects(xx, yy, 0, yy, trendBoxCorners[j][0], trendBoxCorners[j][1], trendBoxCorners[j + 1][0], trendBoxCorners[j + 1][1]);
                            }
                            intersectionCounter += lineIntersects(xx, yy, 0, yy, trendBoxCorners[trendBoxCorners.length - 1][0], trendBoxCorners[trendBoxCorners.length - 1][1], trendBoxCorners[0][0], trendBoxCorners[0][1]);
                            if (intersectionCounter == 1) {

                                selected.push(d3.select(this).attr("id"));
                                return true;

                            } else {

                                return false;
                            }
                        })
                        .attr('fill', 'red');
                    svg.selectAll(".trendSelect")
                        .transition(500)
                        .attr("stroke-width", 0);

                    d3.select("#residual" + svgId)
                        .transition(500)
                        .attr("opacity", 0);
                }

                if (selectionBoxSwitch == true) {
                    var xStart = parseFloat(d3.select("#selectionBox" + d3.select(this).attr("id")).attr("x"));
                    var xEnd = parseFloat(d3.select("#selectionBox" + d3.select(this).attr("id")).attr("x")) + Math.abs(xChange);
                    var yStart = parseFloat(d3.select("#selectionBox" + d3.select(this).attr("id")).attr("y"));
                    var yEnd = parseFloat(d3.select("#selectionBox" + d3.select(this).attr("id")).attr("y")) + Math.abs(yChange);
                    //console.log(xStart + " " + xEnd);
                    svg.selectAll("circle")
                        .filter(function(d, i) {
                            var xx = d3.select(this).attr('cx');
                            var yy = d3.select(this).attr('cy');

                            if ((xx >= xStart && xx <= xEnd) && (yy >= yStart && yy <= yEnd)) {
                                selected.push(d3.select(this).attr("id"));
                                return true;

                            } else {

                                return false;
                            }
                        })
                        .attr('fill', 'red');
                    var newCoordinates = [0, 0];
                    newCoordinates = d3.mouse(this);

                    var x = newCoordinates[0];
                    var y = newCoordinates[1];
                    d3.select("#selectionBox" + d3.select(this).attr("id"))
                        .transition(200)
                        .attr("x", x)
                        .attr("y", y)

                    .attr("width", 0)
                        .attr("height", 0);
                    xChange = 0;
                    yChange = 0;
                }
                selectionBoxSwitch = false;
                lineBox = false;
            });

        svg
            .append("line")
            .attr("class", "trendSelect")
            .attr("id", "line1graph" + graphCounter)
            .attr("x1", function(d) {
                return 0;
            })
            .attr("y1", function(d) {
                return 0;
            })
            .attr("x2", function(d) {
                return 0;
            })
            .attr("y2", function(d) {
                return 0;
            })
            .attr("stroke", "gray")
            .attr("stroke-width", 1)

        svg
            .append("line")
            .attr("class", "trendSelect")
            .attr("id", "line2graph" + graphCounter)
            .attr("x1", function(d) {
                return 0;
            })
            .attr("y1", function(d) {
                return 0;
            })
            .attr("x2", function(d) {
                return 0;
            })
            .attr("y2", function(d) {
                return 0;
            })
            .attr("stroke", "orange")
            .attr("stroke-width", 1)


        svg
            .append("line")
            .attr("class", "trendSelect")
            .attr("id", "line3graph" + graphCounter)
            .attr("x1", function(d) {
                return 0;
            })
            .attr("y1", function(d) {
                return 0;
            })
            .attr("x2", function(d) {
                return 0;
            })
            .attr("y2", function(d) {
                return 0;
            })
            .attr("stroke", "orange")
            .attr("stroke-width", 1);


        svg
            .append("line")
            .attr("class", "trendSelect")
            .attr("id", "line4graph" + graphCounter)
            .attr("x1", function(d) {
                return 0;
            })
            .attr("y1", function(d) {
                return 0;
            })
            .attr("x2", function(d) {
                return 0;
            })
            .attr("y2", function(d) {
                return 0;
            })
            .attr("stroke", "orange")
            .attr("stroke-width", 1)

        svg.selectAll(".trendSelect")
            .attr("stroke", "orange")
            .attr("stroke-dasharray", "4px")
            .attr("stroke-opacity", 1);

        svg.append("text")
            .attr("id", "residualgraph" + graphCounter);

        svg.append("line")
            .attr("id", "deleteLine1graph" + graphCounter)
            .attr("x1", 410)
            .attr("y1", 30)
            .attr("x2", 416)

        .attr("y2", 36)

        .attr("stroke", "orange")

        .attr("stroke-width", 2)

        ;

        svg.append("line")
            .attr("id", "deleteLine2graph" + graphCounter)
            .attr("x1", 410)
            .attr("y1", 36)
            .attr("x2", 416)

        .attr("y2", 30)

        .attr("stroke", "orange")

        .attr("stroke-width", 2);

        svg.append("rect")
            .attr("x", 408)
            .attr("y", 28)
            .attr("height", 10)
            .attr("width", 10)
            .on("mouseover", function(d) {
                d3.select("#deleteLine1" + svg.attr("id"))
                    .attr("stroke", "red");
                d3.select("#deleteLine2" + svg.attr("id"))
                    .attr("stroke", "red");
            })
            .on("mouseout", function(d) {
                d3.select("#deleteLine1" + svg.attr("id"))
                    .attr("stroke", "orange");
                d3.select("#deleteLine2" + svg.attr("id"))
                    .attr("stroke", "orange");
            })
            .attr("fill", "transparent")
            .on("click", function(d) {
                svg.remove();
            });

        svg.append("line")
            .attr("id", "downloadLine1graph" + graphCounter)
            .attr("x1", 400.5)
            .attr("y1", 36)
            .attr("x2", 400.5)

        .attr("y2", 30)

        .attr("stroke", "orange")

        .attr("stroke-width", 2);

        svg.append("line")
            .attr("id", "downloadLine2graph" + graphCounter)
            .attr("x1", 401)
            .attr("y1", 36)
            .attr("x2", 397)

        .attr("y2", 34)

        .attr("stroke", "orange")

        .attr("stroke-width", 2);

        svg.append("line")
            .attr("id", "downloadLine3graph" + graphCounter)
            .attr("x1", 400)
            .attr("y1", 36)
            .attr("x2", 404)

        .attr("y2", 34)

        .attr("stroke", "orange")

        .attr("stroke-width", 2);

        svg.append("rect")
            .attr("x", 396)
            .attr("y", 28)
            .attr("height", 10)
            .attr("width", 10)
            .on("mouseover", function(d) {
                d3.select("#downloadLine1" + svg.attr("id"))
                    .attr("stroke", "red");
                d3.select("#downloadLine2" + svg.attr("id"))
                    .attr("stroke", "red");
                d3.select("#downloadLine3" + svg.attr("id"))
                    .attr("stroke", "red");
            })
            .on("mouseout", function(d) {
                d3.select("#downloadLine1" + svg.attr("id"))
                    .attr("stroke", "orange");
                d3.select("#downloadLine2" + svg.attr("id"))
                    .attr("stroke", "orange");
                d3.select("#downloadLine3" + svg.attr("id"))
                    .attr("stroke", "orange");
            })
            .attr("fill", "transparent")
            .on("click", function(d) {
                for (var i = 1; i < 3; i++) {
                    d3.select("#downloadLine" + i + svg.attr("id"))
                        .attr("opacity", 0);
                    d3.select("#deleteLine" + i + svg.attr("id"))
                        .attr("opacity", 0);
                }
                d3.select("#downloadLine" + 3 + svg.attr("id"))
                    .attr("opacity", 0);
                downloadGraph(svg.attr("id"));
                for (var i = 1; i < 3; i++) {
                    d3.select("#downloadLine" + i + svg.attr("id"))
                        .attr("opacity", 1);
                    d3.select("#deleteLine" + i + svg.attr("id"))
                        .attr("opacity", 1);
                }
                d3.select("#downloadLine" + 3 + svg.attr("id"))
                    .attr("opacity", 1);
            });


        if (graphCounter == 0) {




            d3.select("#main" + id)
                .append("button")
                .text("Confirm")
                .on("click", self.getRawInput);



            d3.select("#main" + id)
                .append("button")
                .text("Create New Graph from Selected")
                .on("click", self.makeGraphFromSelected);


            d3.select("#main" + id)
                .append("button")
                .text("Clear Selected")
                .on('click', self.clearSelected);

            d3.select("#main" + id)
                .append("button")
                .text("Connect the Dots")
                .on("click", self.connectSelected);




            d3.select("#main" + id)
                .append("button")
                .text("Clear Polygons")
                .on("click", self.clearPolygon);


            d3.select("#main" + id)
                .append("button")
                .text("Export Ids")
                .on("click", self.exportIds);


            d3.select("#main" + id)
                .append("button")
                .text("Highlight Selected in All Graphs")
                .on("click", self.highlightSelectedinAllGraphs);
            
             d3.select("#main" + id)
       			 .append("input")
       			 .attr("type", "file")
       			 .attr("defaultValue","Choose Gene Ids")
       			 .attr("id", "geneIdInput");
       		
       		document.getElementById('geneIdInput').addEventListener('change', highLightInput);

        }
        graphCounter++;

    }

    function findDist(x0, y0, x1, y1, x2, y2) {
        var dist = (Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)) / Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));
        return dist;
    }

    function findAB(x1, y1, x2, y2) {
        var m = (y2 - y1) / (x2 - x1);
        var b = -1 * (x1 * m - y1);
        return [m, b];


    }

    this.makeGraphFromSelected = function() {
        selectedPersonIds = [];
        for (var i = 0; i < selected.length; i++) {
            (d3.select("#" + selected[i]).attr("id", function(d) {
                if (selectedPersonIds.indexOf(d[2]) == -1)
                    selectedPersonIds.push(d[2]);
                return d3.select("#" + selected[i]).attr("id");
            }));
        }
        self.getRawInput();
    }

    function download(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        } else {
            pom.click();
        }
    }

    if (window.FileReader) {
        addEventHandler(window, 'load', function() {
            //   var status = document.getElementById('status');
            var drop = document.getElementById('drop');
            //   var list = document.getElementById('list');

            function cancel(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            }

            // Tells the browser that we *can* drop on this target
            addEventHandler(drop, 'dragover', cancel);
            addEventHandler(drop, 'dragenter', cancel);
        });
    } else {
        document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
    }

    function addEventHandler(obj, evt, handler) {
        if (obj.addEventListener) {
            // W3C method
            obj.addEventListener(evt, handler, false);
        } else if (obj.attachEvent) {
            // IE method.
            obj.attachEvent('on' + evt, handler);
        } else {
            // Old school method.
            obj['on' + evt] = handler;
        }
    }


    addEventHandler(drop, 'drop', function(e) {
        e = e || window.event; // get window.event if e argument missing (in IE)   
        if (e.preventDefault) {
            e.preventDefault();
        } // stops the browser from redirecting off to the image.

        var dt = e.dataTransfer;
        var files = dt.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function(progressEvent) {


                // By lines
                var lines = this.result.split('\n');

                highlightList(lines);
            };
            reader.onerror = function(event) {
                console.error("File could not be read! Code " + event.target.error.code);
            };
            reader.readAsText(file);
        }
        return false;
    });

    var dataList = document.getElementById('geneList');
    var input = document.getElementById('geneOne');
    var input2 = document.getElementById('geneTwo');

    // Create a new XMLHttpRequest.
    var request = new XMLHttpRequest();

    // Handle state changes for the request.
    request.onreadystatechange = function(response) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                // Parse the JSON
                var jsonOptions = JSON.parse(request.responseText);

                // Loop over the JSON array.
                jsonOptions.forEach(function(item) {
                    // Create a new <option> element.
                    var option = document.createElement('option');
                    // Set the value using the item in the JSON array.
                    option.value = item;
                    // Add the <option> element to the <datalist>.
                    dataList.appendChild(option);
                });

                // Update the placeholder text.
                input.placeholder = "e.g. datalist";
                input2.placeholder = "e.g. datalist";
            } else {
                // An error occured :(
                input.placeholder = "Couldn't load datalist options :(";
                input2.placeholder = "Couldn't load datalist options :(";
            }
        }
    };

    // Update the placeholder text.
    input.placeholder = "Loading options...";
    input2.placeholder = "Loading options...";

    // Set up and make the request.
    request.open('GET', 'input.JSON', true);
    request.send();

    var getAliasNames = new XMLHttpRequest();

    // Handle state changes for the getAliasNames.
    getAliasNames.onreadystatechange = function(response) {
        if (getAliasNames.readyState === 4) {
            if (getAliasNames.status === 200) {
                // Parse the JSON
                var jsonOptions = JSON.parse(getAliasNames.responseText);

                // Loop over the JSON array.
                jsonOptions.forEach(function(item) {
                    //	//console.log(item);
                    aliasNames.push(item);


                });

            } else {

            }
        }
    };

    getAliasNames.open('GET', 'aliasNames.JSON', true);
    getAliasNames.send();

    var getGeneNames = new XMLHttpRequest();

    // Handle state changes for the getGeneNames.
    getGeneNames.onreadystatechange = function(response) {
        if (getGeneNames.readyState === 4) {
            if (getGeneNames.status === 200) {
                // Parse the JSON
                var jsonOptions = JSON.parse(getGeneNames.responseText);

                // Loop over the JSON array.
                jsonOptions.forEach(function(item) {
                    //	//console.log(item);
                    geneNames.push(item);


                });

            } else {

            }
        }
    };

    // Update the placeholder text.
    //input.placeholder = "Loading options...";

    // Set up and make the getGeneNames.
    getGeneNames.open('GET', 'geneNames.JSON', true);
    getGeneNames.send();
}
