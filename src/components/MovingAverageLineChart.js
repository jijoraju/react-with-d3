import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MovingAverageLineChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            d3.select(d3Container.current).selectAll("*").remove();  // Clear existing SVG content

            const margin = { top: 20, right: 30, bottom: 30, left: 50 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // Parse date and sort data
            data.forEach(d => d.date = new Date(d.date));
            const sortedData = data.sort((a, b) => a.date - b.date);

            const x = d3.scaleTime()
                .domain(d3.extent(sortedData, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([350, d3.max(sortedData, d => d.close)])
                .range([height, 0]);

            // Line for close prices
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.close));

            // Moving average line
            const movingAverageLine = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.average));

            // Calculate moving average
            const movingAverageData = sortedData.map((val, index, arr) => {
                let start = Math.max(0, index - 4);
                let subset = arr.slice(start, index + 1);
                let average = d3.mean(subset, d => d.close);
                return { date: val.date, average: average };
            });

            // Tooltip setup
            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background-color', 'white')
                .style('border', 'solid')
                .style('border-width', '1px')
                .style('border-radius', '5px')
                .style('padding', '5px');

            // Add lines to the chart
            svg.append("path")
                .datum(sortedData)
                .attr("class", "line")
                .attr("d", line);

            svg.append("path")
                .datum(movingAverageData)
                .attr("class", "line moving-average")
                .attr("d", movingAverageLine)
                .style("stroke", "orange");

            // Axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            svg.append("g")
                .call(d3.axisLeft(y));

            // Adding points for tooltip on main line
            svg.selectAll(".dot-main")
                .data(sortedData)
                .enter().append("circle")
                .attr("class", "dot-main")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.close))
                .attr("r", 5)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Close: ${d.close.toFixed(2)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // Adding points for tooltip on moving average line
            svg.selectAll(".dot-ma")
                .data(movingAverageData)
                .enter().append("circle")
                .attr("class", "dot-ma")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.average))
                .attr("r", 5)
                .style("fill", "orange")
                .style("opacity", 0)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>Moving Avg: ${d.average.toFixed(2)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default MovingAverageLineChart;
