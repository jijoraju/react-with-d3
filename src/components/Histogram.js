import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Histogram = ({ data }) => {
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

            const x = d3.scaleLinear()
                .domain([d3.min(data, d => d.close), d3.max(data, d => d.close)])
                .range([0, width])
                .nice();

            const histogram = d3.histogram()
                .value(d => d.close)
                .domain(x.domain())
                .thresholds(x.ticks(20));

            const bins = histogram(data);

            const y = d3.scaleLinear()
                .domain([0, d3.max(bins, d => d.length)])
                .range([height, 0])
                .nice();

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x));

            svg.append("g")
                .call(d3.axisLeft(y));

            svg.append("text")
                .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
                .style("text-anchor", "middle")
                .text("Range");

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 10)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Frequency");

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("rect")
                .data(bins)
                .enter().append("rect")
                .attr("x", d => x(d.x0))
                .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
                .attr("y", height)
                .attr("height", 0)
                .transition().duration(800)
                .attr("y", d => y(d.length))
                .attr("height", d => height - y(d.length))
                .style("fill", "#F5DEB3");

            svg.selectAll("rect")
                .on("mouseover", function(event, d) {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`Range: ${d.x0.toFixed(2)} to ${d.x1.toFixed(2)}<br>Frequency: ${d.length}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 20) + "px");
                })
                .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default Histogram;
