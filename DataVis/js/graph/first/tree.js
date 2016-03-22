/**
 * Created by zhangbobell on 14-12-10.
 */
define('tree', ['d3'], function(d3){

    function draw(selector, data){
        var dataMap = data.reduce(function(map, node) {
            map[node.name] = node;
            return map;
        }, {});

        var treeData = [];
        data.forEach(function(node) {
            // add to parent
            var parent = dataMap[node.parent];
            if (parent) {
                // create child array if it doesn't exist
                (parent.children || (parent.children = []))
                    // add node to child array
                    .push(node);
            } else {
                // parent is null or missing
                treeData.push(node);
            }
        });

        // ************** Generate the tree diagram	 *****************
        var margin = {top: 80, right: 120, bottom: 20, left: 480},
            width = 960 - margin.right - margin.left,
            height = 500 - margin.top - margin.bottom;

        var i = 0,
            duration = 750,
            root;

        var tree = d3.layout.tree()
            .size([height, width])
            .nodeSize([1, 1])
            .separation(function(a, b) {return a.parent == b.parent ? 100 : 100; });

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.x, d.y]; });

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select('body').append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        root = treeData[0];
        root.x0 = height / 2;
        root.y0 = 0;

        update(root);

        d3.select(self.frameElement).style("height", "500px");

        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 120; });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
                .on("click", click)
                .on("mouseover", function(d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);

                    div.html(d.prevTag + "：" + _per(d.prevValue) + "<br/>"  + d.curTag +"：" + _per(d.curValue))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY-42) + "px");
                })
                .on("mouseout", function(d) {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });;

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeEnter.append("text")
                .attr("y", function(d) { return d.children || d._children ? -40 : 40; })
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1e-6);

            nodeEnter.append("text")
                .attr("y", function(d) { return d.children || d._children ? -20 : 20; })
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function(d) { return _per(d.curValue); })
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 10)
                .style("fill", function(d) {
                    if (d._children) {
                        return "lightsteelblue"
                    } else {
                        if ((Math.abs(d.curValue) < Math.abs(d.prevValue) && d.isNormal) || (Math.abs(d.curValue) > Math.abs(d.prevValue) && !d.isNormal)) {
                            return "#f00";
                        } else {
                            return "#0f0";
                        }
                    }
                });

            nodeUpdate.selectAll("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.selectAll("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

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

// Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }

        function _per(d) {
            if (d < 1 && d != 0) {
                return Math.round(d * 10000) / 100 + '%';
            } else if (Math.round(d) != d) {
                return Math.round(d * 100) / 100;
            } else {
                return d;
            }
        }

    }

    return {
        draw: draw
    };

});