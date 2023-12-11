import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AreaChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            const margin = { top: 20, right: 20, bottom: 50, left: 50 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            // Clear SVG before redrawing
            d3.select(d3Container.current).selectAll("*").remove();

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

            const x = d3.scaleTime()
                .domain(d3.extent(sortedData, d => d.date))
                .range([0, width]);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            const y = d3.scaleLinear()
                .domain([350, d3.max(sortedData, d => d.close)])
                .range([height, 0])
                .nice();
            svg.append("g")
                .call(d3.axisLeft(y));

            const areaGenerator = d3.area()
                .x(d => x(d.date))
                .y0(height)
                .y1(d => y(d.close));

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.append("path")
                .datum(sortedData)
                .attr("fill", "lightgreen")
                .attr("stroke", "none")
                .attr("d", areaGenerator)
                .attr("opacity", 0)
                .transition()
                .duration(1000)
                .attr("opacity", 1);

            svg.append("text")
                .attr("transform", `translate(${width / 2}, ${height + 40})`)
                .style("text-anchor", "middle")
                .text("Date");


            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Price");

            const dots = svg.selectAll(".dot")
                .data(sortedData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(d.date))
                .attr("cy", height)
                .attr("r", 0)
                .attr("fill", "red");

            dots.transition()
                .duration(1000)
                .attr("cy", d => y(d.close))
                .attr("r", 5);

            dots.on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Close: ${d.close}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
                d3.select(this).transition().duration(100).attr("r", 7);
            })
                .on("mouseout", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                    d3.select(this).transition().duration(100).attr("r", 5);
                });
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default AreaChart;
