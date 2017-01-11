import './bower_components/d3/d3.js';


export default function heatmap(data, num_of_slices, elem, svg_id, elem_size, date_domain, bin_domain, frq_domain, all_buckets) {

    var margin = {top: 20, right: 90, bottom: 30, left: 50};
    var width = elem_size.width - margin.left - margin.right;
    var height = elem_size.height - margin.top - margin.bottom;

    var yStep = 1;

    var vertical_domain_length = bin_domain.max-bin_domain.min;
    var rect_size = Math.min(width/num_of_slices, height/vertical_domain_length);

    width = rect_size*num_of_slices;
    height = rect_size*vertical_domain_length;

    var svg = d3.select("svg#"+svg_id).attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom)
                .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //Move the origin of drawing



    // In getting log we added 1 to each frequency so we never encounter Log(0) situation
    var x_scale = d3.time.scale().range([0, width]).domain([date_domain.min, date_domain.max]);
    var y_scale = d3.scale.linear().range([height, 0]).domain([bin_domain.min, bin_domain.max]);
    var z_scale = d3.scale.linear().range(['white', 'darkred']).domain([Math.log(frq_domain.min+1), Math.log(frq_domain.max+1)]);


    // Define the div for the tooltip
    var tooltip_div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("opacity", 0);

    // Draw heat map tiles
    // x and y indicates upper left of the rect, hence the "+ yStep" in 'y' is needed to prevent first row from going out of the div.
    svg.selectAll(".tile")
        .data(data)
        .enter()
        .append("rect")
        .attr('x', d => x_scale(d.date))
        .attr('y', d => y_scale(d.bin + yStep))
        .attr("height", rect_size)
        .attr("width", rect_size)
        .style("fill", d => z_scale(Math.log(d.value+1)))
        .on("mouseover", function(d) {		
            tooltip_div.transition()
                .style("opacity", 1);
            tooltip_div	.html("</span> date: " + d.date + "<br/> bin: " + all_buckets[d.bin] + "<br/> value: " + d.value + "</span>")	
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 75) + "px");
            });

    // Add a call back function to hide tooltip_div when mouse goes out of our svg.
    svg.on("mouseout", () => tooltip_div.style("opacity", 0));
}
