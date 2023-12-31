import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            const margin = { top: 20, right: 20, bottom: 50, left: 60 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            // Clear SVG before redrawing
            d3.select(d3Container.current).selectAll("*").remove();

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            const y = d3.scaleLinear()
                .domain([350, d3.max(data, d => d.close)])
                .range([height, 0])
                .nice();
            svg.append("g")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
                .style("text-anchor", "middle")
                .text("Date");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 10)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Price");

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.close));

            const path = svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 1.5)
                .attr("d", line)
                .attr("stroke-dasharray", function() {
                    const length = this.getTotalLength();
                    return `${length} ${length}`;
                })
                .attr("stroke-dashoffset", function() {
                    return this.getTotalLength();
                })
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);

            svg.selectAll(".dot")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.close))
                .attr("r", 5)
                .attr("fill", "green")
                .on("mouseover", function(event, d) {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Close: ${d.close}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default LineChart;
