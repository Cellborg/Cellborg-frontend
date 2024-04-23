import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const SignalingHeatmap = ({ s3key }) => {
    const svgRef = useRef(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(s3key);
            const jsonData = await response.json();
            setData(jsonData[0]);
        }
        fetchData();
    }, [s3key]);

    useEffect(() => {
        if (data) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            const margin = { top: 10, right: 100, bottom: 50, left: 100 }; // Adjusted right margin for the colorbar position
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            const x = d3.scaleBand()
                .range([0, width])
                .domain(data.cols)
                .padding(0.05);

            const y = d3.scaleBand()
                .range([0, height])
                .domain(data.rows)
                .padding(0.05);

            const colorScale = d3.scaleSequential(d3.interpolateGreens);

            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .selectAll("rect")
                .data(data.matrix.flat())
                .enter()
                .append("rect")
                .attr("x", (d, i) => x(data.cols[i % data.cols.length]))
                .attr("y", (d, i) => y(data.rows[Math.floor(i / data.cols.length)]))
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .attr("fill", d => d === "NaN" ? "#FAF9F6" : colorScale(d));

            // Colored rectangle for each cluster (x-axis)
            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
                .selectAll("rect.cluster")
                .data(data.cols)
                .enter()
                .append("rect")
                .attr("class", "cluster")
                .attr("y", -3)  // Positioning it right above the x-axis
                .attr("x", d => x(d))
                .attr("height", 5)
                .attr("width", x.bandwidth())
                .attr("fill", (d, i) => d3.schemeSet1[i % 8]); // Adjust color scheme as needed


            // Adjusted axis to not display ticks and lines
            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
                .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .selectAll("line,path")
                .style("stroke", "none");

            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .call(d3.axisLeft(y).tickSize(0).tickPadding(5))
                .selectAll("line,path")
                .style("stroke", "none");

            // Adjusted color scale legend position and size
            const defs = svg.append("defs");
            const gradient = defs.append("linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");
            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", d3.interpolateGreens(0));
            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", d3.interpolateGreens(1));

            svg.append("rect")
                .attr("x", margin.left + width + 30)
                .attr("y", margin.top + height / 3)
                .attr("width", 15)
                .attr("height", height / 3)
                .style("fill", "url(#gradient)");

            svg.append("text")
                .attr("x", margin.left + width + 30)
                .attr("y", margin.top + height / 3 - 5)
                .text("Importance")
                .attr("text-anchor", "start")
                .style("font-size", "12px");

        }

    }, [data]);

    return (
        <svg ref={svgRef} width="750" height="500"></svg> 
    );
};

export default SignalingHeatmap;
