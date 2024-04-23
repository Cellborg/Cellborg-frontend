import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ChordPlot = ({ s3key }) => {
    const svgRef = useRef(null);
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
        if(data) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
    
            const { rows, cols, data: matrix } = data;
            const width = 400;
            const height = 400;
    
            const outerRadius = Math.min(width, height) * 0.5 - 30;
            const innerRadius = outerRadius - 20;
    
            const chord = d3.chord()
                .padAngle(0.05)
                .sortSubgroups(d3.descending);
    
            const arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
    
            const ribbon = d3.ribbon()
                .radius(innerRadius);
    
            const color = d3.scaleOrdinal(d3.schemeCategory10);
    
            svg.attr("viewBox", [-width / 2, -height / 2, width, height]);
    
            const chords = chord(matrix);
    
            let angleOffset = 0;
            
            const drag = d3.drag()
                .on('drag', (event) => {
                    angleOffset += event.dx;
                    svg.attr('transform', `rotate(${angleOffset / 2})`);
                });
    
            svg.call(drag);
    
            const group = svg.append("g")
                .selectAll("g")
                .data(chords.groups)
                .join("g");
    
            group.append("path")
                .attr("fill", d => color(d.index))
                .attr("stroke", d => d3.rgb(color(d.index)).darker())
                .attr("opacity", 0.6)
                .attr("d", arc);
    
            group.append("text")
                .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
                .attr("dy", ".35em")
                .attr("transform", d => `
                    rotate(${(d.angle * 180 / Math.PI - 90)})
                    translate(${outerRadius + 10}) 
                    ${d.angle > Math.PI ? "rotate(180)" : ""}
                `)
                .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
                .text(d => rows[d.index]);
    
                const ribbons = svg.append("g")
                .attr("fill-opacity", 0.4)
                .selectAll("path")
                .data(chords)
                .join("path")
                .attr("stroke", d => d3.rgb(color(d.source.index)).darker())
                .attr("fill", d => color(d.source.index))
                .attr("d", ribbon)   
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('fill-opacity', 0.8);
                    const info = `${rows[d.source.index]} to ${cols[d.target.index]}: ${d.source.value}`;
                    svg.append("text")
                        .attr("x", 0)
                        .attr("y", -height / 2 + 20)
                        .attr("text-anchor", "middle")
                        .attr("id", "hover-info")
                        .text(info);
                })
                .on('mouseout', function() {
                    d3.select(this).attr('fill-opacity', 0.4);
                    svg.select("#hover-info").remove();
                });    
        }

    }, [data]);

    return (
        <svg ref={svgRef} className='w-1/2 h-1/2'></svg>
    );
};

export default ChordPlot;
