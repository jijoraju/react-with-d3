import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CumulativeLineChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
            const margin = { top: 20, right: 20, bottom: 30, left: 50 },
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

            // Calculate cumulative total
            let cumulative = 0;
            const cumulativeData = sortedData.map(d => {
                cumulative += d.close;
                return { date: d.date, cumulative: cumulative };
            });

            const x = d3.scaleTime()
                .domain(d3.extent(cumulativeData, d => d.date))
                .range([0, width]);
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            const y = d3.scaleLinear()
                .domain([0, d3.max(cumulativeData, d => d.cumulative)])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.cumulative));

            svg.append("path")
                .datum(cumulativeData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line);

            // Tooltip
            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0);

            svg.selectAll('.dot')
                .data(cumulativeData)
                .enter().append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.date))
                .attr('cy', d => y(d.cumulative))
                .attr('r', 5)
                .attr('fill', 'steelblue')
                .on('mouseover', (event, d) => {
                    tooltip.transition().duration(200).style('opacity', 0.9);
                    tooltip.html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Cumulative Total: ${d.cumulative}`)
                        .style('left', `${event.pageX}px`)
                        .style('top', `${event.pageY - 28}px`);
                })
                .on('mouseout', () => {
                    tooltip.transition().duration(500).style('opacity', 0);
                });
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default CumulativeLineChart;
