/**
 * Created by Adward on 16/3/5.
 * Referring the following libraries:
 * d3.js
 * jquery.js
 */

d3 = d3 || {};
(function(){
    "use strict";

    d3.createChartLayout = function(data, chartWrapFunc, blockWidth, options, optopt) {
        var crtLayout = $("<div class='col-lg-"+blockWidth+"'> \
                            <div class='ibox float-e-margins border-bottom'> \
                                <div class='ibox-title'> \
                                    <h5 class='m-b-xxs'>"+options['title-1']+" \
                                        <small>"+options['title-2']+"</small> \
                                    </h5> \
                                    <div class='ibox-tools'> \
                                        <a class='collapse-link'> \
                                            <i class='fa fa-chevron-down'></i> \
                                        </a> \
                                        <a class='dropdown-toggle' data-toggle='dropdown' href='#' aria-expanded='false'> \
                                            <i class='fa fa-wrench'></i> \
                                        </a> \
                                        <ul class='dropdown-menu dropdown-user'> \
                                            <li> \
                                                <a href='#'>Config option 1</a> \
                                            </li> \
                                            <li>\
                                                <a href='#'>Config option 2</a> \
                                            </li> \
                                        </ul> \
                                        <a class='close-link'> \
                                            <i class='fa fa-times'></i> \
                                        </a> \
                                    </div> \
                                </div> \
                                <div class='ibox-content text-center'> \
                                    <div class='p-sm ' id='"+options['id']+"'></div> \
                                </div> \
                            </div> \
                        </div>");
        var layoutCanvas = $("#chartLayout"),
            lastRow = layoutCanvas.children().last(),
            colWidthSum = 0;

        for (var i=0; i<lastRow.children().length; i++) {
            colWidthSum += parseInt(lastRow.children(i).attr("class").toString().split("-").pop());
        }
        if (colWidthSum + blockWidth > 12) {
            if (colWidthSum < 12) {
                lastRow.append($("<div class='col-lg-'"+(12-colWidthSum)+"></div>"));
            }
            layoutCanvas.append($("<div class='row'></div>"));
            lastRow = layoutCanvas.children().last();
        }
        lastRow.append(crtLayout);
        return chartWrapFunc(options["id"], data, optopt);
    };

    //e3Tools are some commonly-shared & densely-used code pieces in wrappers
    d3.e3Tools = {
        /*
            if given a color setting of two values, then return a linear range of colors;
            else if given more than two values, regard it as a predefined set of colors;
            else (when no color setting passed in optopt) return a default linear color setting. 
        */
        "colorSetter": function(colorRange, colorNum){
            if (colorRange != undefined) {
                if (colorRange.length > 2) {
                    return function(i) {
                        return colorRange[i % colorRange.length];
                    };
                } else {
                    return d3.scale.linear()
                        .domain([0, colorNum-1])
                        .range(colorRange);
                } 
            } else {
                return d3.scale.linear()
                    .domain([0, colorNum-1])
                    .range(["#ffffd0", "#1ab356"]);
            }
        },
    };

    d3.collapsibleTreeWrap = function(container_id, treeData, optopt){
        /*
         @param {string} container_id: id of this new stacked bar chart's container
         @param {Object} treeData: JSON Object that takes the following form:
         {
         "name": "root",
         "children": [
         {
         "name": "branch1",
         "children": [...]
         },
         {
         "name": "branch2",
         "children": [...]
         }
         ]
         }
         */
        var container = $("#"+container_id),
            w0 = container.width(),
            h0 = (container.height() != 0) ? container.height : w0 * 0.625,
            m = {left: 60, right: 50, top: 20, bottom: 20}, //margin
            w = w0 - m.left - m.right, //width
            h = h0 - m.top - m.bottom, //height
            i = 0,
            root;

        var tree = d3.layout.tree()
            .size([h, w]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var chart = d3.select("#"+container_id).append("svg:svg")
            .attr("width", w0)
            .attr("height", h0)
            .append("svg:g")
            .attr("transform", "translate(" + m.left + "," + m.top + ")");

        root = treeData;
        root.x0 = h / 2;
        root.y0 = 0;
        // Initialize the display to show a few nodes.
        root.children.forEach(function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        });
        update(root);

        function update(source) {
            var duration = d3.event && d3.event.altKey ? 5000 : 500;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            // Normalize for fixed-depth.
            var maxDepth = 1;
            nodes.forEach(function(d) {
                maxDepth = Math.max(maxDepth, d.depth);
                d.y = d.depth * w / (maxDepth+1);
            });

            // Update the nodes…
            var node = chart.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                //.attr("transform", function(d) { return "translate(" + source.y0  + "," + source.x0 + ")"; })
                .attr("transform", function(d) { return "translate(" + w + "," + source.x0 + ")"; })
                .on("click", function(d) {
                    toggle(d);
                    node.filter(function(_d, i) {
                        update(_d);
                    });
                });

            nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightforestgreen" : "#fff"; })
                .style({"cursor": "pointer", stroke: "forestgreen", "stroke-width": "1.5px"});

            nodeEnter.append("svg:text")
                .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                //.attr("y", function(d) { return d.y * 0.5;})
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style({"fill-opacity": 1e-6, "font-size": "14px"});

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 8)
                .style("fill", function(d) { return d._children ? "lightforestgreen" : "#fff"; })
                .style({"cursor": "pointer", stroke: "forestgreen", "stroke-width": "1.5px"});

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = chart.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                })
                .transition()
                .duration(duration)
                .attr("d", diagonal);
            link.style({stroke: "#ccc", "stroke-width": "1.5px", "fill": "none"})

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Toggle children.
        function toggle(d) {
            if (!d) return false;
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }

        return chart;
    };

    d3.treeMapWrap = function(container_id, treeMapData) {

        var container = $("#"+container_id),
            w = container.width(),
            h = (container.height() != 0) ? container.height() : w * 0.625,
            x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, h]),
            color = d3.scale.category20c(),
            root,
            node;

        var treemap = d3.layout.treemap()
            .round(false)
            .size([w, h])
            .sticky(true)
            .value(function (d) {
                return d.size;
            });

        var svg = d3.select("#"+container_id).append("div")
            .attr("class", "chart")
            .style("width", w + "px")
            .style("height", h + "px")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
            .attr("transform", "translate(.5,.5)");


        node = root = treeMapData;

        var nodes = treemap.nodes(root)
            .filter(function (d) {
                return !d.children;
            });

        var cell = svg.selectAll("g")
            .data(nodes)
            .enter().append("svg:g")
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .on("click", function (d) {
                return zoom(node == d.parent ? root : d.parent);
            });

        cell.append("svg:rect")
            .attr("width", function (d) {
                return d.dx - 1;
            })
            .attr("height", function (d) {
                return d.dy - 1;
            })
            .style("fill", function (d) {
                return color(d.parent.name);
            });

        cell.append("svg:text")
            .attr("x", function (d) {
                return d.dx / 2;
            })
            .attr("y", function (d) {
                return d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.name;
            })
            .style("opacity", function (d) {
                d.w = this.getComputedTextLength();
                return d.dx > d.w ? 1 : 0;
            });

        d3.select(window).on("click", function () {
            zoom(root);
        });

        d3.select("select").on("change", function () {
            treemap.value(this.value == "size" ? size : count).nodes(root);
            zoom(node);

        });

        function size(d) {
            return d.size;
        }

        function count(d) {
            return 1;
        }

        function zoom(d) {
            var kx = w / d.dx, ky = h / d.dy;
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            var t = svg.selectAll("g.cell").transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d) {
                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                });

            t.select("rect")
                .attr("width", function (d) {
                    return kx * d.dx - 1;
                })
                .attr("height", function (d) {
                    return ky * d.dy - 1;
                });

            t.select("text")
                .attr("x", function (d) {
                    return kx * d.dx / 2;
                })
                .attr("y", function (d) {
                    return ky * d.dy / 2;
                })
                .style("opacity", function (d) {
                    return kx * d.dx > d.w ? 1 : 0;
                });

            node = d;
            d3.event.stopPropagation();
        }

        return svg;
    };

    d3.sunburstWrap = function(container_id, sunburstData){
        /*
         @param {string} container_id: id of this new stacked bar chart's container
         @param {Object} treeData: JSON Object that takes the following form:
         {
         "name": "root",
         "children": [
         {
         "name": "branch1",
         "children": [
         {"name": "child1", "size": 123},
         {"name": "child2", "size": 126}
         ]
         },
         {
         "name": "branch2",
         "children": [
         {"name": "child3", "size": 1234},
         {"name": "child4", "size": 356},
         {"name": "child5", "size": 90}
         ]
         }
         ]
         }
         */
        var container = $("#"+container_id),
            width0 = container.width(),
            height0 = (container.height() != 0) ? container.height() : width0,
            margin = {left: 50, right: 50, top: 20, bottom: 20},
            width = width0 - margin.left - margin.right,
            height = height0 - margin.top - margin.bottom,
            radius = Math.min(width, height) / 2;

        var chartCanvas =
            $("<div class='row'> \
					<div class='col-lg-12'> \
						<div class='btn-group' id='mode-sel-"+container_id+"'></div> \
					</div> \
				</div>");
        container.append(chartCanvas);

        var modeSel = $("#mode-sel-"+container_id),
            modeNames = ['count', 'size'];

        for (var i=0; i<modeNames.length; i++) {
            var modeBtn = $("<button style='margin-right: 0%' class='label label-default'></button>");
            modeBtn.text(modeNames[i].toString());
            modeSel.append(modeBtn);
        }
        $(modeSel[0].children[0]).addClass("label-primary");

        d3.select("body").selectAll("#mode-sel-"+container_id+" button")
            .on('click', function change() {
                d3.select("body").selectAll("#mode-sel-"+container_id+" button")
                    .forEach(function(btn) {
                        $(btn).addClass("label-default");
                        $(btn).removeClass("label-primary");
                    });
                $(this).addClass("label-primary");

                var value = this.value === "count"
                    ? function() { return 1; }
                    : function(d) { /*console.log(d);*/ return d.size; };

                path
                    .data(partition.value(value).nodes)
                    .transition()
                    .duration(1000)
                    .attrTween("d", arcTweenData);
            });

        var x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var y = d3.scale.sqrt()
            .range([0, radius]);

        var color = d3.scale.category20c();

        var chart = d3.select("#"+container_id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

        var partition = d3.layout.partition()
            .sort(null)
            .value(function(d) { return 1; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

        // Keep track of the node that is currently being displayed as the root.
        var node = sunburstData;

        var toolTip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", container_id+"-tooltip")
            .style("display", "none");

        $("#"+container_id+"-tooltip")
            .css({
                "position": "absolute",
                "text-align": "center",
                "width": "12%",
                "height": "10%",
                "padding": "2vw",
                "font": "1.2vw sans-serif",
                border: "0px",
                "border-radius": "10px",
                color: "black",
                "box-shadow": "-3px 3px 15px #888888",
                "opacity": 0
            });

        var path = chart.datum(node).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
            .on("click", click)
            .on("mousemove", function(d) {
                //var mouseVal = d3.mouse(this);
                toolTip.style("display","none");
                toolTip
                    .html(d.name+":"+d.value)
                    .style("left", (d3.event.pageX+12) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .style("opacity", 1)
                    .style("display","block");
            })
            .on("mouseout",function(){toolTip.html(" ").style("display","none");})
            .each(stash);

        function click(d) {
            node = d;
            path.transition()
                .duration(1000)
                .attrTween("d", arcTweenZoom(d));
        }

        d3.select(self.frameElement).style("height", height + "px");

        // Setup for switching data: stash the old values for transition.
        function stash(d) {
            d.x0 = d.x;
            d.dx0 = d.dx;
        }

        // When switching data: interpolate the arcs in data space.
        function arcTweenData(a, i) {
            var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
            function tween(t) {
                var b = oi(t);
                a.x0 = b.x;
                a.dx0 = b.dx;
                return arc(b);
            }
            if (i == 0) {
                // If we are on the first arc, adjust the x domain to match the root node
                // at the current zoom level. (We only need to do this once.)
                var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
                return function(t) {
                    x.domain(xd(t));
                    return tween(t);
                };
            } else {
                return tween;
            }
        }

        // When zooming: interpolate the scales.
        function arcTweenZoom(d) {
            var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(y.domain(), [d.y, 1]),
                yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
            return function (d, i) {
                return i
                    ? function (t) {
                    return arc(d);
                }
                    : function (t) {
                    x.domain(xd(t));
                    y.domain(yd(t)).range(yr(t));
                    return arc(d);
                };
            };
        }

        return chart;
    };

    d3.donutWrap = function(container_id, data, optopt){
        /*
         @param {string} container_id: id of this new stacked bar chart's container
         @param {Object} data: JSON Object that has m rows & n cols
         @param {int} n: num of pie-pieces in donut
         @param {int} m: num of samples in data
         */
        var n = optopt["n"],
            m = optopt["m"];
        var container = $("#"+container_id),
            pie_width = container.width(),
            pie_height = (container.height() != 0) ? container.height() : pie_width * 0.8,
            margin = 10;
        var radius = 0.8 * pie_height / 2; //leave space for label texts
        var ctrlPanel1 =
            $("<div class='row'> \
					<div class='col-lg-12'> \
						<div id='donut-slider-"+container_id+"'></div> \
					</div> \
				</div> \
				<br/>");
        container.append(ctrlPanel1);

        $("#donut-slider-"+container_id).ionRangeSlider({
            min: 0,
            max: m - 1,
            type: 'single',
            step: 1,
            //postfix: " carats",
            prettify: false,
            hasGrid: true
        });

        var animateSlices = function(){
            curSampleN = parseInt($("#"+container_id + " .irs-single")[0].innerHTML);
            chart.switchSliceStatus(curSampleN);
        };
        $(".irs-line").on("click", animateSlices); // animateSlices() is illegal
        $(".irs-slider").on("mouseup", animateSlices);
        var curSampleN = 0;

        var chart = d3.select("#"+container_id).append("svg")
            .attr("width", pie_width + 2 * margin)
            .attr("height", pie_height + 2 * margin)
            .append("g")
            .attr("transform", "translate(" + (pie_width/2) + "," + (pie_height/2) + ")");

        var pieData = d3.range(n).map(function(label, i){
            return { label: data['labels'][i], value: data['datas'][curSampleN][i] };
        });

        var color = d3.e3Tools.colorSetter(optopt.color, n);
        
        chart.changeDonut = function(sampleN) {
            //console.log(this);
            //this.sampleN = sampleN;
            this.append("g")
                .attr("class", "slices");
            this.append("g")
                .attr("class", "labels");
            this.append("g")
                .attr("class", "lines");

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d.value; });

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.4);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

            var key = function(d){ return d.data.label; };

            /* ------- PIE SLICES -------*/
            var slice = this.select(".slices").selectAll("path.slice")
                .data(pie(pieData), key);

            slice
                .enter()
                .insert("path")
                .style("fill", function(d, i) { return color(i); })
                .attr("class", "slice");

            slice
                .transition().duration(400)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.exit()
                .remove();

            /* ------- TEXT LABELS -------*/
            var text = this.select(".labels").selectAll("text")
                .data(pie(pieData), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.data.label;
                });

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text.transition().duration(400)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate("+ pos +")";
                    };
                })
                .styleTween("text-anchor", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                });

            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = chart.select(".lines").selectAll("polyline")
                .data(pie(pieData), key);

            polyline.enter()
                .append("polyline");
            //after real svg have been binded to polyline, can we start to assign styles to it
            // & built-in style items need not to be between ""
            polyline
                .style({opacity: .3, stroke: "black", "stroke-width": "2px", fill: "none"});

            polyline.transition().duration(400)
                .attrTween("points", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        };

        chart.changeDonut(curSampleN); //first execution, generate vis of default sampleN

        var ctrlPanel2 = 
            $("<div class='row'> \
                    <div class='col-lg-12'> \
                        <table style='position:absolute;top:5px;right:5px;;font-size:smaller;color:#545454'> \
                            <tbody><tr id='feat-sel-"+container_id+"'> \
                            </tr></tbody> \
                        </table> \
                    </div> \
                </div>");
        container.append(ctrlPanel2);
        var featSel = $("#feat-sel-"+container_id);
        var showSlice = [];

        for (var i = 0; i < n; i ++) {
            showSlice[i] = true;
            var featBtn = 
                $("<td class='legendColorBox'> \
                        <div style='border:1px solid #ccc;padding:1px'> \
                            <div class='innerLegend' style='width:4px;height:0;border:5px solid "+color(i)+";overflow:hidden'></div> \
                        </div> \
                    </td>");
//            featBtn.text(data['labels'][i].toString());
            featBtn.on('click', function () {
                var sliceN = $(this).index();
//                var btn = $(featSel.children()[sliceN]);
                var btn = $(this).find(".innerLegend");
                if (btn.css("border") == "5px solid rgb(255, 255, 255)") {
                    btn.css("border", "5px solid " + color(sliceN));
                } else {
                    btn.css("border", "5px solid " + "#ffffff");
                }
                chart.switchSliceStatus(curSampleN, sliceN);
            } );
            featSel.append(featBtn);
        }

        chart.switchSliceStatus = function(sampleN, sliceN){
            if (sliceN != undefined) {
                showSlice[sliceN] = !showSlice[sliceN];
            }
            pieData = d3.range(n).map(function(label, i){
                return {label: data['labels'][i], value: data['datas'][sampleN][i]};
            });
            for (var i=showSlice.length; i>=0; i--) {
                //use inverse deletion order to prevent change of to-be-del-index
                if (!showSlice[i]) {
                    pieData.splice(i, 1);
                }
            }
            chart.changeDonut(sampleN);
        };
        return chart;
    };

    d3.stackedBarWrap = function(container_id, data, optopt){
        /*
         @param {string} container_id: id of this new stacked bar chart's container
         @param {Object} data: JSON Object that has m rows & n cols
         @param {int} optopt.n: num of layers in each stacked bar
         @param {int} optopt.m: num of stacked bars (horizontally)
         @param {int} optopt.color: color range or color set of each layers
         */
        var n = optopt["n"],
            m = optopt["m"],
            color = d3.e3Tools.colorSetter(optopt.color, n);
        var container = $("#"+container_id),
            bar_width = container.width(),
            bar_height = (container.height() != 0) ? container.height() : bar_width * 0.625,
            margin = {left: 20, right: 20, top: 20, bottom: 20};
        var chartCanvas =
            $("<div class='row'> \
					<div class='col-lg-12'> \
						<div class='btn-group' id='feat-sel-"+container_id+"'></div> \
					</div> \
			   </div>");
        container.append(chartCanvas);
        var featSel = $("#feat-sel-"+container_id);
        var showLayer = [];

        for (var i=0; i<n; i++) {
            showLayer[i] = true;
            var featBtn = $("<button class='label label-primary'></button>");
//            featBtn.attr("style", "background-color: " + color(i));
            featBtn.text(data['labels'][i].toString());
            featBtn.on('click', function () {
                var layerN = $(this).index();
                var btn = $(featSel.children()[layerN]);
                if (btn.hasClass("label-default")) {
                    btn.removeClass("label-default");
                    btn.addClass("label-primary");
                } else {
                    btn.removeClass("label-primary");
                    btn.addClass("label-default");
                }
                chart.switchLayerStatus(layerN);
            } );
            featSel.append(featBtn);
        }
        //bar_width -= margin.left + margin.right;
        //bar_height -= margin.top + margin.bottom;
        var stack = d3.layout.stack(),
            layers = stack(d3.range(n).map(function(idx) { return dataAdapter(idx, m, .1); })),
            yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
            yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

        var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangeRoundBands([0, bar_width], .08);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([bar_height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");

        var chart = d3.select("#"+container_id).append("svg")
            .attr("width", bar_width + margin.left + margin.right)
            .attr("height", bar_height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var layer = chart.selectAll(".layer")
            .data(layers)
            .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) { return color(i); });


        var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", bar_height)
            .attr("width", x.rangeBand())
            .attr("height", 0)
            .on("mouseout", function() { toolTip.style("display", "none"); } )
            .on("mouseover", function(d, i){
                function genTable(i) {
                    var tbl = $("<table class='table table-bordered'></table>"),
                        tbbody = $("<tbody></tbody>");
                    for (var j = 0; j < 3; j++) {
                        var trow = $("<tr></tr>");
                        if ($(featSel.children()[j]).hasClass("label-primary")) {
                            trow.attr("class", "success");
                        }
                        trow.append($("<td>"+ data.labels[j] +"</td>"));
                        trow.append($("<td>"+ data.datas[i][j].toString() +"</td>"));
                        tbbody.append(trow);
                    }
                    tbl.append(tbbody);
                    tbl.css("opacity", "0.8");
                    return tbl[0].outerHTML;
                }
                toolTip
                    .html(genTable(i))
                    .style("left", (d3.event.pageX+12) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .style("opacity", 1)
                    .style("display","block");
             });

        var toolTip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", container_id+"-tooltip")
            .style("display", "none");

        $("#"+ container_id +"-tooltip")
            .css({
                "position": "absolute",
                "text-align": "center",
                "width": "15%",
                "height": "20%",
                "padding": "1vw",
                "font": "1vw sans-serif",
                border: "0px",
                "border-radius": "10px",
                color: "black",
//                "box-shadow": "-3px 3px 15px #888888",
                "opacity": 1
            });

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + bar_height + ")")
            .call(xAxis);

        function transitionStacked() {
            y.domain([0, yStackMax]);
            rect.transition()
                .duration(200)
                .delay(function(d, i) { return i * 10; })
                .attr("y", function(d) { return y(d.y0 + d.y); })
                .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
                .transition()
                .attr("x", function(d) { return x(d.x); })
                .attr("width", x.rangeBand());
        }

        function transitionGrouped() {
           y.domain([0, yGroupMax]);
           rect.transition()
               .duration(200)
               .delay(function(d, i) { return i * 10; })
               .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
               .attr("width", x.rangeBand() / n)
               .transition()
               .attr("y", function(d) { return y(d.y); })
               .attr("height", function(d) { return bar_height - y(d.y); });
        }

        function dataAdapter(idx, n, o) {
            var a = [], i;
            for (i = 0; i < n; ++i) a[i] = i;
            return a.map(function(d, i) { return {x: i, y: (showLayer[idx] ? data['datas'][i][idx] : 0) }; });
        }

        if (optopt.grouped) { transitionGrouped(); }
        else { transitionStacked(); }

        chart.switchLayerStatus = function(layerN){
            if (showLayer[layerN]){
                showLayer[layerN] = false;
            } else {
                showLayer[layerN] = true;
            }
            layers = stack(d3.range(n).map(function(idx) { return dataAdapter(idx, m, .1); }));
            yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
            yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
            layer = chart.selectAll(".layer")
                .data(layers);

            rect = layer.selectAll("rect")
                .data(function(d) { return d; })
                .attr("x", function(d) { return x(d.x); })
                .attr("y", bar_height)
                .attr("width", x.rangeBand())
                .attr("height", 0);

            if (optopt.grouped) { transitionGrouped(); }
            else { transitionStacked(); }
        };

        //Data index binding
        chart.controls = function(chart_id, callback){
            var controllee = d3.select("#"+chart_id).select("svg").select("g");
            rect.on("click", function(d, i) { callback.call(controllee, i); } );
        };
        
        return chart;
    };



    d3.radarWrap = function(container_id, data, optopt) {
        var container = $("#"+container_id),
            width0 = container.width(),
            height0 = (container.height() != 0) ? container.height() : width0,
            margin = {left: 20, right: 20, top: 20, bottom: 20},
            width = width0 - margin.left - margin.right,
            height = height0 - margin.top - margin.bottom;

        var radarChartOptions = {
            w: width,
            h: height,
            margin: margin,
            maxValue: 0.5,
            levels: 5,
            roundStrokes: true,
            color: d3.scale.ordinal()
                .range(["#EDC951","#CC333F","#00A0B0"])
        };

        /////////////////////////////////////////////////////////
        /////////////// The Radar Chart Function ////////////////
        /////////////// Written by Nadieh Bremer ////////////////
        ////////////////// VisualCinnamon.com ///////////////////
        /////////// Inspired by the code of alangrafu ///////////
        /////////////////////////////////////////////////////////
        function RadarChart(id, data, options) {
            var cfg = {
                w: 600,				//Width of the circle
                h: 600,				//Height of the circle
                margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
                levels: 3,				//How many levels or inner circles should there be drawn
                maxValue: 0, 			//What is the value that the biggest circle will represent
                labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
                wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
                opacityArea: 0.35, 	//The opacity of the area of the blob
                dotRadius: 4, 			//The size of the colored circles of each blog
                opacityCircles: 0.1, 	//The opacity of the circles of each blob
                strokeWidth: 2, 		//The width of the stroke around each blob
                roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
                color: d3.scale.category10()	//Color function
            };

            //Put all of the options into a variable called cfg
            if('undefined' !== typeof options){
                for(var i in options){
                    if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
                }//for i
            }//if

            //If the supplied maxValue is smaller than the actual one, replace by the max in the data
            var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));

            var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
                total = allAxis.length,					//The number of different axes
                radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
                Format = d3.format('%'),			 	//Percentage formatting
                angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

            //Scale for the radius
            var rScale = d3.scale.linear()
                .range([0, radius])
                .domain([0, maxValue]);

            /////////////////////////////////////////////////////////
            //////////// Create the container SVG and g /////////////
            /////////////////////////////////////////////////////////

            //Remove whatever chart with the same id/class was present before
            d3.select("#"+id).select("svg").remove();

            //Initiate the radar chart SVG
            var svg = d3.select("#"+id).append("svg")
                .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
                .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
                .attr("class", "radar"+id);
            //Append a g element
            var g = svg.append("g")
                .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

            /////////////////////////////////////////////////////////
            ////////// Glow filter for some extra pizzazz ///////////
            /////////////////////////////////////////////////////////

            //Filter for the outside glow
            var filter = g.append('defs').append('filter').attr('id','glow'),
                feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
                feMerge = filter.append('feMerge'),
                feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
                feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

            /////////////////////////////////////////////////////////
            /////////////// Draw the Circular grid //////////////////
            /////////////////////////////////////////////////////////

            //Wrapper for the grid & axes
            var axisGrid = g.append("g").attr("class", "axisWrapper");

            //Draw the background circles
            axisGrid.selectAll(".levels")
                .data(d3.range(1,(cfg.levels+1)).reverse())
                .enter()
                .append("circle")
                .attr("class", "gridCircle")
                .attr("r", function(d, i){return radius/cfg.levels*d;})
                .style("fill", "#CDCDCD")
                .style("stroke", "#CDCDCD")
                .style("fill-opacity", cfg.opacityCircles)
                .style("filter" , "url(#glow)");

            //Text indicating at what % each level is
            axisGrid.selectAll(".axisLabel")
                .data(d3.range(1,(cfg.levels+1)).reverse())
                .enter().append("text")
                .attr("class", "axisLabel")
                .attr("x", 4)
                .attr("y", function(d){return -d*radius/cfg.levels;})
                .attr("dy", "0.4em")
                .style("font-size", "10px")
                .attr("fill", "#737373")
                .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

            /////////////////////////////////////////////////////////
            //////////////////// Draw the axes //////////////////////
            /////////////////////////////////////////////////////////

            //Create the straight lines radiating outward from the center
            var axis = axisGrid.selectAll(".axis")
                .data(allAxis)
                .enter()
                .append("g")
                .attr("class", "axis");
            //Append the lines
            axis.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
                .attr("class", "line")
                .style("stroke", "white")
                .style("stroke-width", "2px");

            //Append the labels at each axis
            axis.append("text")
                .attr("class", "legend")
                .style("font-size", "11px")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
                .text(function(d){return d})
                .call(wrap, cfg.wrapWidth);

            /////////////////////////////////////////////////////////
            ///////////// Draw the radar chart blobs ////////////////
            /////////////////////////////////////////////////////////

            //The radial line function
            var radarLine = d3.svg.line.radial()
                .interpolate("linear-closed")
                .radius(function(d) { return rScale(d.value); })
                .angle(function(d,i) {	return i*angleSlice; });

            if(cfg.roundStrokes) {
                radarLine.interpolate("cardinal-closed");
            }

            //Create a wrapper for the blobs
            var blobWrapper = g.selectAll(".radarWrapper")
                .data(data)
                .enter().append("g")
                .attr("class", "radarWrapper");

            //Append the backgrounds
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("d", function(d,i) { return radarLine(d); })
                .style("fill", function(d,i) { return cfg.color(i); })
                .style("fill-opacity", cfg.opacityArea)
                .on('mouseover', function (d,i){
                    //Dim all blobs
                    d3.selectAll(".radarArea")
                        .transition().duration(200)
                        .style("fill-opacity", 0.1);
                    //Bring back the hovered over blob
                    d3.select(this)
                        .transition().duration(200)
                        .style("fill-opacity", 0.7);
                })
                .on('mouseout', function(){
                    //Bring back all blobs
                    d3.selectAll(".radarArea")
                        .transition().duration(200)
                        .style("fill-opacity", cfg.opacityArea);
                });

            //Create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", function(d,i) { return radarLine(d); })
                .style("stroke-width", cfg.strokeWidth + "px")
                .style("stroke", function(d,i) { return cfg.color(i); })
                .style("fill", "none")
                .style("filter" , "url(#glow)");

            //Append the circles
            blobWrapper.selectAll(".radarCircle")
                .data(function(d,i) { return d; })
                .enter().append("circle")
                .attr("class", "radarCircle")
                .attr("r", cfg.dotRadius)
                .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
                .style("fill", function(d,i,j) { return cfg.color(j); })
                .style("fill-opacity", 0.8);

            /////////////////////////////////////////////////////////
            //////// Append invisible circles for tooltip ///////////
            /////////////////////////////////////////////////////////

            //Wrapper for the invisible circles on top
            var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
                .data(data)
                .enter().append("g")
                .attr("class", "radarCircleWrapper");

            //Append a set of invisible circles on top for the mouseover pop-up
            blobCircleWrapper.selectAll(".radarInvisibleCircle")
                .data(function(d,i) { return d; })
                .enter().append("circle")
                .attr("class", "radarInvisibleCircle")
                .attr("r", cfg.dotRadius*1.5)
                .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
                .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
                .style("fill", "none")
                .style("pointer-events", "all")
                .on("mouseover", function(d,i) {
                    var newX =  parseFloat(d3.select(this).attr('cx')) - 10,
                        newY =  parseFloat(d3.select(this).attr('cy')) - 10;
                    tooltip
                        .attr('x', newX)
                        .attr('y', newY)
                        .text(Format(d.value))
                        .transition().duration(200)
                        .style('opacity', 1);
                })
                .on("mouseout", function(){
                    tooltip.transition().duration(200)
                        .style("opacity", 0);
                });

            //Set up the small tooltip for when you hover over a circle
            var tooltip = g.append("text")
                .attr("class", "tooltip")
                .style("opacity", 0);

            /////////////////////////////////////////////////////////
            /////////////////// Helper Function /////////////////////
            /////////////////////////////////////////////////////////

            //Taken from http://bl.ocks.org/mbostock/7555321
            //Wraps SVG text
            function wrap(text, width) {
                text.each(function() {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.4, // ems
                        y = text.attr("y"),
                        x = text.attr("x"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }//wrap

            return svg;

        }//RadarChart

        //Call function to draw the Radar chart
        return RadarChart(container_id, data, radarChartOptions);
    };

    d3.streamGraphWrap = function(container_id, streamData, optopt){
        /*
         @param {string} container_id: id of this new stacked bar chart's container
         @param {Object} data: JSON Object that has:
         l * [n rows & m cols of Object{"x":..., "y":...}]
         @param {int} n: num of layers in stream
         @param {int} m: num of samples per layer
         @param {int} l: num of data samples (flow status)
         */
        var n = optopt['n'],
            m = optopt['m'],
            l = optopt['l'];
        var container = $("#"+container_id),
            width0 = container.width(),
            height0 = (container.height() != 0) ? container.height() : width0 * 0.625,
            margin = {left: 20, right: 20, top: 20, bottom: 20},
            width = width0 - margin.left - margin.right,
            height = height0 - margin.top - margin.bottom;

        var chartCanvas =
            $("<div class='row'> \
					<div class='col-lg-12'> \
						<div id='stream-slider-"+container_id+"'></div> \
					</div> \
			</div>");
        container.append(chartCanvas);

        $("#stream-slider-"+container_id).ionRangeSlider({
            min: 0,
            max: l - 1,
            type: 'single',
            step: 1,
            //postfix: " carats",
            prettify: false,
            hasGrid: true
        });

        $(".irs-line").on("click", transition); // transition() is illegal
        $(".irs-slider").on("mouseup", transition);

        var sampleN = 0,
            stack = d3.layout.stack().offset("wiggle"),
            layers = stack(streamData[sampleN]);

        //var jjson = d3.range(20).map(function() { return bumpLayer(200); });
        //console.log(JSON.stringify(jjson));

        var x = d3.scale.linear()
            .domain([0, m - 1])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, d3.max(layers, function(layer) {
                return d3.max(layer, function(d) { return d.y0 + d.y; });
            })])
            .range([height, 0]);

        var color = d3.scale.linear()
            .range(["#ffffd0", "#006666"]);

        var area = d3.svg.area()
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var chart = d3.select("#"+container_id).append("svg")
            .attr("width", width)
            .attr("height", height);

        chart.selectAll("path")
            .data(layers)
            .enter().append("path")
            .attr("d", area)
            .style("fill", function() { return color(Math.random()); });

        function transition() {
            sampleN = parseInt($("#"+container_id + " .irs-single")[0].innerHTML);
            chart.selectAll("path")
                .data(function() {
                    return stack(streamData[sampleN]);
                })
                .transition()
                .duration(500)
                .attr("d", area);
        }

        // Inspired by Lee Byron's test data generator.
        function bumpLayer(n) {

            function bump(a) {
                var x = 1 / (.1 + Math.random()),
                    y = 2 * Math.random() - .5,
                    z = 10 / (.1 + Math.random());
                for (var i = 0; i < n; i++) {
                    var w = (i / n - y) * z;
                    a[i] += x * Math.exp(-w * w);
                }
            }

            var a = [], i;
            for (i = 0; i < n; ++i) a[i] = 0;
            for (i = 0; i < 5; ++i) bump(a);
            return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
        }

        return chart;
    };

    /*
     The followings are flot charts wrappers.
     */

    d3.flotCommonWrap = function(container_id) {
        var parnt = $("#"+container_id).parent();
        parnt.empty();
        parnt.append($("<div class='flot-chart'> \
                            <div class='flot-chart-content' id='"+container_id+"'></div> \
                        </div>"));
    };

    d3.flotBarLineWrap = function(container_id, barData, optopt) {
        /*
         Sample of barData:
         {
         label: "bar",
         data: [
         [1, 34],
         [2, 25],
         [3, 19],
         [4, 34],
         [5, 32],
         [6, 44]
         ]
         }
         */
        //var xAxisLabels = [[1, 'a'], [2, 'b'], [3, 'c'], [4, 'b'], [5, 'e'], [6, 'f']];
        var xAxisLabels = barData["data"].map(function(d){ return [d[0], d[2]]; });
        d3.flotCommonWrap(container_id);
        var barOptions = {
            series: {
                bars: {
                    show: optopt.series.indexOf("bar") > -1,
                    barWidth: 0.6,
                    fill: true,
                    fillColor: {
                        colors: [{
                            opacity: 0.8
                        }, {
                            opacity: 0.8
                        }]
                    }
                },
                lines: {
                    show: optopt.series.indexOf("line") > -1,
                    lineWidth: 2,
                    fill: true,
                    fillColor: {
                        colors: [{
                            opacity: 0.0
                        }, {
                            opacity: 0.0
                        }]
                    }
                }
            },
            xaxis: {
                tickDecimals: 0,
                ticks: xAxisLabels[0][1] ? xAxisLabels : undefined
            },
            colors: [optopt.color],
            grid: {
                color: "#999999",
                hoverable: true,
                clickable: true,
                tickColor: "#D4D4D4",
                borderWidth: 0
            },
            legend: {
                show: false
            },
            tooltip: true,
            tooltipOpts: {
                content: "x: %x, y: %y"
            }
        };

        $.plot($("#"+container_id), [barData], barOptions);
    };

    d3.flotPieWrap = function(container_id, pieData, optopt) {
        d3.flotCommonWrap(container_id);
        var color,
            colorRange = optopt.color;

        if (colorRange.length > 2) {
            color = function(i) {
                return colorRange[i % colorRange.length];
            };
        } else {
            color = d3.scale.linear()
                .domain([0, pieData.length-1])
                .range(colorRange);
        }
        pieData.map(function(d, i){
            return {
                "label": d.label,
                "data": d.data,
                "color": color(i)
            };
        });
        var plotObj = $.plot($("#"+container_id), pieData, {
            series: {
                pie: {
                    show: true
                }
            },
            grid: {
                hoverable: true
            },
            colors: colorRange,
            tooltip: true,
            tooltipOpts: {
                content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
                shifts: {
                    x: 20,
                    y: 0
                },
                defaultTheme: false
            }
        });
    };

    d3.flotLineMultiWrap = function(container_id, lineData, optopt) {
        d3.flotCommonWrap(container_id);
        function euroFormatter(v, axis) {
            return v.toFixed(axis.tickDecimals) + "$";
        }

        function doPlot(position) {
            $.plot($("#" + container_id), lineData, {
                    xaxes: [{
                        mode: 'time'
                    }],
                    yaxes: [{
                        min: 0,
                        // align if we are to the right
                        alignTicksWithAxis: position == "right" ? 1 : null,
                        position: position
                        //tickFormatter: euroFormatter
                    }],
                    legend: {
                        position: 'sw'
                    },
                    colors: ["#1ab394"],
                    grid: {
                        color: "#999999",
                        clickable: true,
                        tickColor: "#D4D4D4",
                        borderWidth: 0,
                        hoverable: true //IMPORTANT! this is needed for tooltip to work,

                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: "%s for %x was %y",
                        xDateFormat: "%y-%0m-%0d",

                        onHover: function (flotItem, $tooltipEl) {
                            // console.log(flotItem, $tooltipEl);
                        }
                    }
                }
            );
        }
        //doPlot("right");
        doPlot("left");

        //$("button").click(function() {
        //    doPlot($(this).text());
        //});
    };

    d3.negBarWrap = function (container_id, barData, optopt) {
        var container = $("#"+container_id),
            margin = {top: 20, right: 20, bottom: 30, left: 20},
            width = container.width() - margin.left - margin.right,
            height = ((container.height() != 0) ? container.height() : container.width() * 0.625)
                - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.ordinal()
            .rangeRoundBands([0, height], 0.1);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickSize(0)
            .tickPadding(6);

        var svg = d3.select("#"+container_id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain(d3.extent(barData, function (d) {
            return d.value;
        })).nice();
        y.domain(barData.map(function (d) {
            return d.name;
        }));

        svg.selectAll(".bar")
            .data(barData)
            .enter().append("rect")
            .attr("class", function (d) {
                return "bar bar--" + (d.value < 0 ? "negative" : "positive");
            })
            .attr("x", function (d) {
                return x(Math.min(0, d.value));
            })
            .attr("y", function (d) {
                return y(d.name);
            })
            .attr("width", function (d) {
                return Math.abs(x(d.value) - x(0));
            })
            .attr("height", y.rangeBand())
            .style("fill", function(d) { return d.value < 0 ? "#79d2c0" : "#1ab394"});

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0) + ",0)")
            .call(yAxis);

        svg.selectAll(".axis").selectAll("path, line") //path or line
            .style({
                fill: "none",
                stroke: "#000",
                "shape-rendering": "crispEdges"
            });
        svg.selectAll(".axis").selectAll("text")
            .style("font", "10px sans-serif");


        function type(d) {
            d.value = +d.value;
            return d;
        }
        return svg;
    };

    d3.bubbleWrap = function (container_id, bubbleData, optopt) {
        var container = $("#"+container_id),
            diameter = (container.height() != 0)
                ? Math.min(container.width(), container.height()) : container.width(),
            format = d3.format(",d"),
            color = d3.scale.category20c();

        var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select("#"+container_id).append("svg")
            .attr("width", diameter)
            .attr("height", diameter)
            .attr("class", "bubble");

        var node = svg.selectAll(".node")
            .data(bubble.nodes(classes(bubbleData))
                .filter(function(d) { return !d.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.packageName); });

        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.className.substring(0, d.r / 3); });


        // Returns a flattened hierarchy containing all leaf nodes under the bubbleData.
        function classes(bubbleData) {
            var classes = [];

            function recurse(name, node) {
                if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
                else classes.push({packageName: name, className: node.name, value: node.size});
            }

            recurse(null, bubbleData);
            return {children: classes};
        }

        d3.select(self.frameElement).style("height", diameter + "px");
        return svg;
    };

    d3.chinaMapWrap = function (container_id, mapData, optopt) {

        var container = $("#"+container_id),
            width0 = container.width(),
            height0 = (container.height() >= width0 * 0.6) ? container.height() : width0 * 0.8,
            margin = {left: width0*0.1, right: 0, top: height0*0.25, bottom: height0*0.05},
            width = width0 - margin.left - margin.right,
            height = height0 - margin.top - margin.bottom,
            colorRange = optopt.color;

        var svg = d3.select("#"+container_id).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g");
        //.attr("transform", "translate("+(80)+","+(80)+")");

        var projection = d3.geo.mercator()
            .center([107, 31])
            .scale(height)
            .translate([width * 0.5, height * 0.65]);

        var toolTip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", container_id+"-tooltip")
            .style("display", "none");

        $("#"+container_id+"-tooltip")
            .css({
                "position": "absolute",
                "text-align": "center",
                "width": "12%",
                "height": "12%",
                "padding": "2vw",
                "font": "1.2vw sans-serif",
                border: "0px",
                "border-radius": "10px",
                color: "black",
                "box-shadow": "-3px 3px 15px #888888",
                "opacity": 1
            });

        var path = d3.geo.path()
            .projection(projection);

        //var color = d3.scale.category20();
        /*
        var color = function(i) {
            var colorRange = ["#ccc", "#bababa", "#79d2c0", "#1ab394"];
            return colorRange[i % colorRange.length];
        };
        */
        var color;
        if (colorRange.length > 2) {
            color = function(i) {
                return colorRange[i % colorRange.length];
            };
        } else {
            color = d3.scale.linear()
                .domain([0, parseInt(Math.log(optopt.max))])
                .range(colorRange);
        }   

        svg.selectAll("path")
            .data(mapData.features)
            .enter()
            .append("path")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", function (d, i) {
                var volume = parseInt(Math.log(optopt.data[d.properties.name] + 1));
                if (isNaN(volume)) volume = 0;
                return color(volume);
            })
            .attr("d", path)
            .on("mouseover", function (d, i) {
                d3.select(this)
                    .style("opacity", 0.4);
                //.attr("fill", "yellow");
            })
            .on("mouseout", function (d, i) {
                d3.select(this)
                    .style("opacity", 1);
                toolTip.style("display","none");
                //.attr("fill", color(i));
            })
            .on("mousemove", function(d) {
                //var mouseVal = d3.mouse(this);
                toolTip.style("display","none");
                toolTip
                    .html(d.properties.name + ": " + function(){
                        var tmp = optopt.data[d.properties.name];
                        if (tmp) return tmp;
                        else return 0;
                    }())
                    .style("left", (d3.event.pageX+12) + "px")
                    .style("top", (d3.event.pageY-10) + "px")
                    .style("opacity", 1)
                    .style("display","block");
            });

        //container.append($("<div class='label label-lg label-primary'>海外: "+optopt.data['海外']+"</div>"));



        svg.resize = function(nWidth) {
            toolTip.style("display","none");

            var curWidth = parseInt(container.attr("class").split("-").pop());
            container.attr("class", "col-lg-"+nWidth);
            width0 = container.width();
            height0 = width0 * 0.8;
            margin = {left: width0*0.1, right: 0, top: height0*0.25, bottom: height0*0.05};
            width = width0 - margin.left - margin.right;
            height = height0 - margin.top - margin.bottom;

            projection
                .scale(height)
                .translate([width * 0.5, height * 0.65]);

            path = d3.geo.path()
                .projection(projection);

            function transitionMap() {
                var changeSvgScale = function(){
                    d3.select("#"+container_id).select("svg")
                        .attr("width", width)
                        .attr("height", height);
                };
                if (nWidth > curWidth) {
                    changeSvgScale();
                } //putting changeSvgScale definition after this IF-clause is wrong
                svg.selectAll("path")
                    .transition()
                    .duration(300)
                    .attr("width", width)
                    .transition()
                    .attr("height", height)
                    .attr("d", path);
                //.attr("transform", "translate(" + (0) + "," + (0) + ")");

                if (nWidth < curWidth) {
                    setTimeout(changeSvgScale, 450);
                }
            }

            transitionMap();

            svg.on("mouseout",
                function(d) {
                    toolTip.style("display","none");
                }
            );

            return svg;
        };

        return svg;
    };

    d3.wordCloudWrap = function(container_id, cloudData, optopt){
        var container = $("#"+container_id),
            width0 = container.width(),
            height0 = (container.height() != 0) ? container.height() : width0 * 0.625,
            margin = {left: 50, right: 50, top: 50, bottom: 50},
            width = width0 - margin.left - margin.right,
            height = height0 - margin.top - margin.bottom;

        var fill = d3.scale.category20();
        var size = d3.scale.linear()
            .domain([cloudData['stat']['min'], cloudData['stat']['max']])
            .range([width * 0.04, width * 0.16]);

        cloudData = cloudData['words'].map(function(d) {
            return {text: d['name'], size: size(d['count']) };
        });

        var layout = d3.layout.cloud()
            .size([width, height]);

        while (true) {
            layout.words(cloudData)
                .padding(5)
                .font("Impact")
                .fontSize(function(d) { return d.size; })
                .on("end", function(){
                    draw(cloudData);
                });
            layout.start();
            if ($(".wordCloudText").length != cloudData.length) {
                container.children().remove();
            } else {
                break;
            }
        }

        var chart;

        function draw(words) {
            //console.log("in draw", words);
            chart = d3.select("#" + container_id).append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-weight", "900")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family", "Impact")
                .style("fill", function(d, i) { return fill(i); })
                .attr("class", "wordCloudText")
                .attr("text-anchor", "middle")
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
        }

        return chart;
    };

    d3.c3GaugeWrap = function(container_id, gaugeData, optopt){
        c3.generate({
                bindto: '#'+container_id,
                data:{
                    columns: [
                        [gaugeData.label, 100 * gaugeData.selfData / gaugeData.totalData]
                    ],
                    type: 'gauge'
                },
                color:{
                    pattern: optopt.color
                }
            });
        var c3GaugeArc = $("#"+container_id+" > svg > g > .c3-chart > .c3-chart-arcs");
        c3GaugeArc.find("g").find("text").html(gaugeData.selfData);
        c3GaugeArc.find(".c3-chart-arcs-gauge-max").html(gaugeData.totalData);
    };

})();