import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ContributionBarPlot = ({ dataUrl }) => {
    const svgRef = useRef(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(dataUrl);
            const jsonData = await response.json();
            setData(jsonData);
        }
        fetchData();
    }, [dataUrl]);

    useEffect(() => {
        if (data.length) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            const margin = { top: 40, right: 60, bottom: 40, left: 150 }; 
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            const barGap = 15; 

            const y = d3.scaleBand()
                .range([0, height])
                .padding(0.4);
            
            const x = d3.scaleLinear()
                .range([0, width - barGap]);

            y.domain(data.map(d => d.name));
            x.domain([0, d3.max(data, d => d.contribution)]);

            const g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("y", 0)
                .attr("x", -10) 
                .attr("dy", ".35em")
                .attr("text-anchor", "end");
                
            const bars = g.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("y", d => y(d.name))
                .attr("x", barGap) 
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.contribution))
                .attr("fill", "#69b3a2");

            // Add data labels at the end of bars
            bars.each(function(d) {
                g.append("text")
                    .attr("y", y(d.name) + y.bandwidth() / 2)
                    .attr("x", x(d.contribution) + barGap + 5)  
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .attr("font-size", "12px")
                    .text(d.contribution);
            });

            // Add title at the top
            svg.append("text")
                .attr("x", width / 2 + margin.left)
                .attr("y", margin.top / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .text("Contribution of each L-R pair");

            // Add subtitle at the bottom
            svg.append("text")
                .attr("x", width / 2 + margin.left)
                .attr("y", height + margin.top + margin.bottom / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "14px")
                .text("Relative Contribution"); 
        }
    }, [data]);

    return (
        <svg ref={svgRef} width={600} height={400}></svg>
    );
};

export default ContributionBarPlot;
