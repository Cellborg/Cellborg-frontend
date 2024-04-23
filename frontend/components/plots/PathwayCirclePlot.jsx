import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const PathwayCirclePlot = ({ s3key }) => {
    const ref = useRef();
    const [data, setData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(s3key);
            const jsonData = await response.json();
            setData(jsonData);
        }
        fetchData();
    }, [s3key]);

    useEffect(() => {
        if (data) {
            const svg = d3.select(ref.current);
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const radius = Math.min(width, height) / 4; // Adjust as needed
            
            // Convert the data into nodes
            const nodes = data.rows.map((d, i) => {
                const angle = (i / data.rows.length) * 2 * Math.PI;
                return {
                    id: d,
                    group: i,
                    angle: angle, // store angle for arc calculations
                    x: width / 2 + radius * Math.cos(angle),
                    y: height / 2 + radius * Math.sin(angle)
                };
            });

            // Draw arcs
            const arcGenerator = d3.arc()
                .innerRadius(radius)
                .outerRadius(radius + 5); // Adjust for arc thickness

            svg.append("g")
                .selectAll("path")
                .data(data.data.flatMap((row, i) => 
                    row.map((value, j) => ({ 
                        source: nodes[i], 
                        target: nodes[j], 
                        value 
                    }))
                ))
                .filter(d => d.value !== 0)  // Remove any zero-value links
                .join("path")
                .attr("d", d => {
                    return arcGenerator({
                        startAngle: d.source.angle,
                        endAngle: d.target.angle
                    });
                })
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", d => Math.sqrt(d.value));

            // Draw nodes
            svg.append("g")
                .selectAll("circle")
                .data(nodes)
                .join("circle")
                .attr("r", 5)
                .attr("fill", d => d3.schemeCategory10[d.group])
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            // Draw node labels
            svg.append("g")
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("x", d => d.x)
                .attr("y", d => d.y - 10) // Adjust this value to position the label above the node
                .attr("text-anchor", "middle")
                .text(d => d.id);
        }
    }, [data]);

    return <svg ref={ref} width="800" height="800"></svg>;
};

export default PathwayCirclePlot;
