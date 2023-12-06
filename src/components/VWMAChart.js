import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SimplifiedCandlestickChart = ({ data }) => {
    const d3Container = useRef(null);

    useEffect(() => {
        if (data && d3Container.current) {
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
                .padding(0.3)
                .domain(data.map(d => d.date));

            const y = d3.scaleLinear()
                .range([height, 0])
                .domain([0, d3.max(data, d => d.close)]);

            svg.selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("x", d => x(d.date))
                .attr("y", d => y(d.close))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.close))
                .attr("fill", "steelblue");

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(y));
        }
    }, [data]);

    return <svg ref={d3Container} />;
};

export default SimplifiedCandlestickChart;
