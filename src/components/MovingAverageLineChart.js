import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MovingAverageLineChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            d3.select(d3Container.current).selectAll("*").remove(); // Clear existing SVG content

            const margin = { top: 20, right: 20, bottom: 50, left: 60 },
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const svg = d3.select(d3Container.current)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            data.forEach(d => d.date = new Date(d.date));
            const sortedData = data.sort((a, b) => a.date - b.date);

            const x = d3.scaleTime()
                .domain(d3.extent(sortedData, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([350, d3.max(sortedData, d => d.close)])
                .range([height, 0]);

            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.close));

            const movingAverageLine = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.average));

            const movingAverageData = sortedData.map((val, index, arr) => {
                let start = Math.max(0, index - 4);
                let subset = arr.slice(start, index + 1);
                let average = d3.mean(subset, d => d.close);
                return { date: val.date, average: average };
            });

            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute')
                .style('background-color', 'white')
                .style('border', 'solid')
                .style('border-width', '1px')
                .style('border-radius', '5px')
                .style('padding', '5px');

            const drawLine = (data, lineGenerator, color) => {
                const path = svg.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", 1.5)
                    .attr("d", lineGenerator)
                    .attr("stroke-dasharray", function() {
                        const length = this.getTotalLength();
                        return `${length} ${length}`;
                    })
                    .attr("stroke-dashoffset", function() {
                        return this.getTotalLength();
                    });

                path.transition()
                    .duration(2000)
                    .attr("stroke-dashoffset", 0);
            };

            drawLine(sortedData, line, "steelblue");
            drawLine(movingAverageData, movingAverageLine, "orange");

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

            const drawDots = (data, color) => {
                svg.selectAll(`.dot-${color}`)
                    .data(data)
                    .enter().append("circle")
                    .attr("class", `dot-${color}`)
                    .attr("cx", d => x(d.date))
                    .attr("cy", d => y(d[color === 'orange' ? 'average' : 'close']))
                    .attr("r", 5)
                    .style("fill", color)
                    .style("opacity", 0)
                    .on("mouseover", function(event, d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>Value: ${d[color === 'orange' ? 'average' : 'close']}`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .transition().delay(2000).duration(500)
                    .style("opacity", 1);
            };


            drawDots(sortedData, "steelblue");
            drawDots(movingAverageData, "orange");
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default MovingAverageLineChart;
