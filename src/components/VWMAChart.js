import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const VWMAChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            // Clear existing SVG content
            d3.select(d3Container.current).selectAll("*").remove();

            const margin = { top: 20, right: 20, bottom: 30, left: 50 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            data.forEach(d => {
                d.date = new Date(d.date);
                d.volume = +d.volume;
            });

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([350, d3.max(data, d => d.close)])
                .range([height, 0]);

            const calculateVWMA = (data, period = 5) => {
                return data.map((val, index) => {
                    let start = Math.max(0, index - period + 1);
                    let subset = data.slice(start, index + 1);
                    let vwma = d3.sum(subset, d => d.close * d.volume) / d3.sum(subset, d => d.volume);
                    return { date: val.date, vwma };
                });
            };

            const vwmaData = calculateVWMA(data);

            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.vwma));

            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background-color', 'white')
                .style('border', 'solid')
                .style('border-width', '1px')
                .style('border-radius', '5px')
                .style('padding', '5px');

            const path = svg.append("path")
                .datum(vwmaData)
                .attr("class", "line")
                .attr("d", line)
                .style("stroke", "purple")
                .style("fill", "none")
                .style("stroke-width", 1.5);

            const totalLength = path.node().getTotalLength();

            path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            svg.append("g")
                .call(d3.axisLeft(y));

            svg.selectAll(".dot")
                .data(vwmaData)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.vwma))
                .attr("r", 5)
                .style("fill", "purple")
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>VWMA: ${d.vwma.toFixed(2)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .style("opacity", 0)
                .transition()
                .duration(2000)
                .style("opacity", 1);
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default VWMAChart;
