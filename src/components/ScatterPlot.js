import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ data }) => {
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

            const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

            const x = d3.scaleTime()
                .domain(d3.extent(sortedData, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([350, d3.max(sortedData, d => d.close)])
                .range([height, 0])
                .nice();

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

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

            svg.selectAll(".dot")
                .data(sortedData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(d.date))
                .attr("cy", height)
                .attr("r", 5)
                .attr("fill", "steelblue")
                .on("mouseover", function(event, d) {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Close: ${d.close}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0))
                .transition()
                .duration(1000)
                .attr("cy", d => y(d.close));
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default ScatterPlot;
