import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CandlestickChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            // Clear existing SVG content
            d3.select(d3Container.current).selectAll("*").remove();

            const margin = { top: 20, right: 50, bottom: 30, left: 50 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => d.date))
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
                .range([height, 0]);

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .transition().duration(1000)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            svg.append("g")
                .transition().duration(1000)
                .call(d3.axisLeft(y));

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px");

            const candlesticks = svg.selectAll(".candlestick")
                .data(data)
                .enter().append("g")
                .attr("class", "candlestick")
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`Date: ${d.date}<br>Open: ${d.open}<br>High: ${d.high}<br>Low: ${d.low}<br>Close: ${d.close}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            candlesticks.append("rect")
                .attr("x", d => x(d.date))
                .attr("y", height)
                .attr("width", x.bandwidth())
                .transition().duration(800)
                .attr("y", d => y(Math.max(d.open, d.close)))
                .attr("height", d => Math.abs(y(d.open) - y(d.close)))
                .attr("fill", d => d.open > d.close ? "red" : "green");

            candlesticks.append("line")
                .attr("x1", d => x(d.date) + x.bandwidth() / 2)
                .attr("x2", d => x(d.date) + x.bandwidth() / 2)
                .attr("y1", height)
                .attr("y2", height)
                .transition().duration(800)
                .attr("y1", d => y(d.high))
                .attr("y2", d => y(d.low))
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default CandlestickChart;
