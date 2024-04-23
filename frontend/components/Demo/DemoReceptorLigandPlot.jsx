import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const NetworkPlot = () => {
    const svgRef = useRef(null);
    const [data, setData] = useState(null);
    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/netvisual_count.json');
            const jsonData = await response.json();
            setData(jsonData);
        }
        fetchData();
    }, []);

    function wrapText(text, width) {
        let lineCount = 0; // Keep track of the number of lines created
      
        text.each(function() {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.1, // ems
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy") || 0),
              tspan = text.text(null)
                          .append("tspan")
                          .attr("x", 10)
                          .attr("y", y)
                          .attr("dy", dy + "em");
      
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan")
                          .attr("x", 10)
                          .attr("y", y)
                          .attr("dy", ++lineNumber * lineHeight + dy + "em")
                          .text(word);
            }
          }
          lineCount = lineNumber; // Update the line count
        });
      
        return lineCount; // Return the number of lines created
      }
      

    useEffect(() => {
        if (data) {
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
 
            const { values, rownames, colnames } = data;
            const nodes = rownames;
            const matrix = values;

            const width = 550;
            const height = 550;

            const infoCircleRadius = 60;
            const infoCircleX = width + 300; // Adjust as needed
            const infoCircleY = height - 300; // Adjust as needed

            svg.append("circle")
                .attr("id", "infoCircle")        
                .attr("cx", infoCircleX)
                .attr("cy", infoCircleY)
                .attr("r", infoCircleRadius)
                .attr("fill", "#e0e0e0")
                .attr("stroke", "black")
                .attr("stroke-width", "1");
            
            const lineScale = d3.scaleLinear()
                .domain([0, d3.max(matrix.flat())])
                .range([1, 15]);

            const links = [];
            matrix.forEach((row, i) => {
                row.forEach((value, j) => {
                    if (value > 0) {
                        links.push({
                            source: nodes[i],
                            target: nodes[j],
                            value
                        });
                    }
                });
            });
            const colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain([0, nodes.length - 1]);

            const nodeData = nodes.map(node => ({ id: node }));
            const nodeDegrees = Array(nodes.length).fill(0);
            links.forEach(link => {
              const targetIndex = nodes.indexOf(link.target);
              nodeDegrees[targetIndex]++;
            });

            const nodeSizeScale = d3.scaleSqrt()
                .domain([0, d3.max(nodeDegrees)])
                .range([1, 15]);

            const circleRadius = Math.min(width, height) * 0.8;
            nodeData.forEach((node, i) => {
                const angle = (i / nodeData.length) * 2 * Math.PI;
                node.x = width / 2 + circleRadius * Math.cos(angle);
                node.y = height / 2 + circleRadius * Math.sin(angle);
            });
            const radialForce = d3.forceRadial(circleRadius, width / 2, height / 2);


            const simulation = d3.forceSimulation(nodeData)
                .force("link", d3.forceLink(links).id(d => d.id).distance(200))
                .force("charge", d3.forceManyBody().strength(-555))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("radial", radialForce);

            const linkElements = svg.append("g")
                .selectAll("path")
                .data(links)
                .enter()
                .append("path")
                .attr('fill', 'none')
                .attr('stroke', d => colorScale(nodes.indexOf(d.source.id)))
                .attr('stroke-width', d => lineScale(d.value));

            const nodeElements = svg.append("g")
                .selectAll("circle")
                .data(nodeData)
                .enter()
                .append("circle")
                .attr('r', d => nodeSizeScale(nodeDegrees[nodes.indexOf(d.id)]))
                .attr('fill', d => colorScale(nodes.indexOf(d.id)))
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("click", (event, d) => {
                    if (isInsideInfoCircle(d)) {
                        d.fx = null;
                        d.fy = null;
                        simulation.alphaTarget(0.3).restart();
                        svg.selectAll(".infoBox").remove();
                        d3.select("#infoCircle").attr("stroke", "black").attr("stroke-width", "1");
                        d3.select("#infoCircleText").attr("visibility", "visible");
                    }
                });

            const labelOffset = 50;
            const textElements = svg.append("g")
                .selectAll("text")
                .data(nodeData)
                .enter()
                .append("text")
                .attr('dy', '0.35em')  // Adjust for better vertical alignment
                .attr('text-anchor', 'middle')
                .text(d => d.id)
                .attr("x", d => {
                    const angle = Math.atan2(d.y - height / 2, d.x - width / 2);
                    return d.x + Math.cos(angle) * labelOffset;
                })
                .attr("y", d => {
                    const angle = Math.atan2(d.y - height / 2, d.x - width / 2);
                    return d.y + Math.sin(angle) * labelOffset;
                });

            svg.append("text")
                .attr("id", "infoCircleText")
                .attr("x", infoCircleX)
                .attr("y", infoCircleY)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("Drag here");

            simulation.on("tick", () => {
                linkElements.attr("d", d => {
                  if (d.source === d.target) {
                    // Calculate the direction of the self-loop
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const dx = d.source.x - centerX;
                    const dy = d.source.y - centerY;
                    const angle = Math.atan2(dy, dx);
                    
                    // Calculate the starting and ending points for the bezier curve
                    const nodeRadius = nodeSizeScale(nodeDegrees[nodes.indexOf(d.source.id)]);
                    const outwardOffset = nodeRadius * 4;  // Adjust to make the loop's distance from the node larger
                    const controlOffset = nodeRadius * 4;  // Adjust to make the loop wider
                    const xStart = d.source.x;
                    const yStart = d.source.y;
                    const xControl = d.source.x + controlOffset * Math.cos(angle + Math.PI / 5);
                    const yControl = d.source.y + controlOffset * Math.sin(angle + Math.PI / 5);
                    const xEnd = d.source.x + outwardOffset * Math.cos(angle);
                    const yEnd = d.source.y + outwardOffset * Math.sin(angle);
                    
                    // Create the self-loop using a bezier curve
                    return `M${xStart},${yStart}Q${xControl},${yControl} ${xEnd},${yEnd}T${xStart},${yStart}`; 
                }
                 else {
                      const dx = d.target.x - d.source.x;
                      const dy = d.target.y - d.source.y;
                      const dr = Math.sqrt(dx * dx + dy * dy) * 1.25;  // Increase the curvature of the link
                      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
                    }
                });

                nodeElements
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                textElements
                    .attr("x", d => {
                        const angle = Math.atan2(d.y - height / 2, d.x - width / 2);
                        return d.x + Math.cos(angle - Math.PI / 6) * labelOffset;
                    })
                    .attr("y", d => {
                        const angle = Math.atan2(d.y - height / 2, d.x - width / 2);
                        return d.y + Math.sin(angle - Math.PI / 6) * labelOffset;
                    });
            });

            function dragstarted(event, d) {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            
            }

            function dragged(event, d) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            
                if (isInsideInfoCircle(d)) {
                    d3.select("#infoCircle")
                      .attr("stroke", "#ff0000")  // Red color for the stroke
                      .attr("stroke-width", "5"); // Make the stroke a bit wider
                    d3.select("#infoCircleText").attr("visibility", "hidden");
                } else {
                    d3.select("#infoCircle")
                      .attr("stroke", "black")    // Original color
                      .attr("stroke-width", "1"); // Original width
                    d3.select("#infoCircleText").attr("visibility", "visible");
                    svg.selectAll(".infoBox").remove();
                }
            }
            
            function isInsideInfoCircle(node) {
                const dx = node.x - infoCircleX;
                const dy = node.y - infoCircleY;
                return Math.sqrt(dx * dx + dy * dy) <= infoCircleRadius;
            }

            function dragended(event, d) {
                if (isInsideInfoCircle(d)) {
                    d.fx = infoCircleX;
                    d.fy = infoCircleY;
                    displayNodeInfo(d);
                } else {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                    d3.select("#infoCircleText").attr("visibility", "visible");
                    svg.selectAll(".infoBox").remove();
                }
            }
            
            function displayNodeInfo(node) {
                const infoBoxWidth = 250;
                const infoBoxHeight = 300;
                const infoBoxX = infoCircleX - infoBoxWidth / 6 - 20;
                const infoBoxY = infoCircleY + infoCircleRadius - 20;
            
                // Remove any existing info boxes
                svg.selectAll(".infoBox").remove();
            
                // Create a new info box
                const infoBox = svg.append("g")
                    .attr("class", "infoBox")
                    .attr("transform", `translate(${infoBoxX}, ${infoBoxY})`);
            
                infoBox.append("rect")
                    .attr("width", infoBoxWidth)
                    .attr("height", infoBoxHeight)
                    .attr("fill", "white")
                    .attr("stroke", "black");
            
                infoBox.append("text")
                    .attr("x", 10)
                    .attr("y", 30)
                    .text(`${node.id} Connections`);
                
                    const outgoingLinks = links.filter(link => link.source === node);
                    const incomingLinks = links.filter(link => link.target === node);
                
                    let yOffset = 50; 
                
                    // Display outgoing connections
                    if (outgoingLinks.length > 0) {
                        const outgoingText = infoBox.append("text")
                            .attr("x", 10)
                            .attr("y", yOffset)
                            .attr("font-weight", "bold")
                            .text("Outgoing:");
                        yOffset += 20;
                
                        const outgoingNodesText = infoBox.append("text")
                            .attr("x", 10)
                            .attr("y", yOffset)
                            .text(`-> ${outgoingLinks.map(link => link.target.id).join(", ")}`);
                        
                        const outgoingLines = wrapText(outgoingNodesText, infoBoxWidth - 20); // Apply wrapping to this text element
                        yOffset += (outgoingLines + 1) * 20; // Adjust yOffset by the number of lines created
                    }
                
                    // Additional space between sections
                    yOffset += 10;

                    // Display incoming connections
                    if (incomingLinks.length > 0) {
                        const incomingText = infoBox.append("text")
                            .attr("x", 10)
                            .attr("y", yOffset)
                            .attr("font-weight", "bold")
                            .text("Incoming:");
                        yOffset += 20;

                        const incomingNodesText = infoBox.append("text")
                            .attr("x", 10)
                            .attr("y", yOffset)
                            .text(`<- ${incomingLinks.map(link => link.source.id).join(", ")}`);
                        
                        const incomingLines = wrapText(incomingNodesText, infoBoxWidth - 20); // Apply wrapping to this text element
                        yOffset += (incomingLines + 1) * 20; // Adjust yOffset by the number of lines created
                    }

                infoBox.selectAll("text")
                    .call(wrapText, infoBoxWidth - 20);  // Adjust the second parameter as needed

            }
            
        }
    }, [data]);

    return (
        <svg ref={svgRef} className='w-full h-full overflow-visible ml-5'></svg>
    );
};

export default NetworkPlot;
