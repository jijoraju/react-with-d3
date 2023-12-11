import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

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

            const x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => new Date(d.date)))
                .padding(0.2);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            const y = d3.scaleLinear()
                .domain([350, d3.max(data, d => d.close)])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
                .style("text-anchor", "middle")
                .text("Date");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 15)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Price");


            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            const bars = svg.selectAll(".bar")
                .data(sortedData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(new Date(d.date)))
                .attr("y", height)
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", "#69b3a2");

            bars.transition()
                .duration(800)
                .attr("y", d => y(d.close))
                .attr("height", d => height - y(d.close));

            bars.on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(new Date(d.date))}<br>Close: ${d.close}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr("fill", "orange");
            })
                .on("mouseout", (event, d) => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr("fill", "#69b3a2");
                });
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default BarChart;
