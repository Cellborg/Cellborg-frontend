import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PathwayHeatmap = ({s3key}) => {
    const svgRef = useRef(null);
    const margin = {top: 60, right: 60, bottom: 30, left: 60};
    const width = 450 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
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
            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();
    
            const { rows, cols, data: matrix } = data;
            const rowSums = matrix.map(row => d3.sum(row.map(d => d !== "NA" ? Math.abs(d) : 0)));
            const colSums = matrix[0].map((_, i) => d3.sum(matrix.map(row => row[i] !== "NA" ? Math.abs(row[i]) : 0)));

            const x = d3.scaleBand()
                .range([0, width])
                .domain(cols)
                .padding(0.05);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSize(0))
                .select(".domain").remove();

            const y = d3.scaleBand()
                .range([0, height])
                .domain(rows)
                .padding(0.05);
            svg.append("g")
                .call(d3.axisLeft(y).tickSize(0))
                .select(".domain").remove();

            const maxVal = d3.max(matrix.flat().filter(d => d !== "NA"));
            const colorScale = d3.scaleSequential()
                .interpolator(d3.interpolateReds)
                .domain([0, maxVal]);
            
            const clusterColors = d3.scaleOrdinal(d3.schemeCategory10).domain(rows); // Using a 10-color scheme for now, can be adjusted
            
            svg.selectAll()
                .data(matrix, (d) => d)
                .enter()
                .selectAll('rect')
                .data((d, i) => d.map((value) => ({i, value})))
                .enter()
                .append('rect')
                .attr('x', (d, j) => x(cols[j]))
                .attr('y', (d) => y(rows[d.i]))
                .attr('width', x.bandwidth() - 2)  // Subtract 2 for padding
                .attr('height', y.bandwidth() - 2) // Subtract 2 for padding
                .style('fill', (d) => d.value === "NA" ? '#FAF9F6' : colorScale(d.value));


            // Add column and row sum bars
            const maxColSum = d3.max(colSums);
            const maxRowSum = d3.max(rowSums);

            const colScale = d3.scaleLinear()
                .domain([0, maxColSum])
                .range([0, margin.top - 10]);

            const rowBarScale = d3.scaleLinear()
                .domain([0, d3.max(rowSums)])
                .range([0, 40]); // Adjust the range to control the width of the bars

            const rowBarAxis = d3.axisRight(rowBarScale).ticks(3);
            svg.append('g')
                .attr('class', 'row-bar-scale')
                .attr('transform', `translate(${width + 20},${height/10 - 20}) rotate(-90)`)
                .call(rowBarAxis)
                .selectAll('text')
        

            // Change the gradient of the color bar to be vertical
            const defs = svg.append('defs');
            const linearGradient = defs.append('linearGradient')
                .attr('id', 'linear-gradient')
                .attr('x1', '0%')
                .attr('y1', '100%')
                .attr('x2', '0%')
                .attr('y2', '0%');

            linearGradient.selectAll('stop')
            .data([
                {offset: '0%', color: d3.interpolateReds(0)},
                {offset: '100%', color: d3.interpolateReds(1)}
            ])
            .enter().append('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);

            // Add labels to the gradient
            svg.append('text')
                .attr('x', width + 80)
                .attr('y', height / 3 - 10)
                .text(`${maxVal.toFixed(5)}`)
                .attr('font-size', '10px');
            
            svg.append('rect')
                .attr('x', width + 80)  // Adjusted the x positioning
                .attr('y', height / 3)
                .attr('width', 20)
                .attr('height', height / 3)
                .style('fill', 'url(#linear-gradient)');

            svg.append('text')
                .attr('x', width + 80)
                .attr('y', 2 * height / 3 + 20)
                .text('0')
                .attr('font-size', '10px');

            svg.selectAll('rect.rowSum')
                .data(rowSums)
                .enter()
                .append('rect')
                .attr('class', 'rowSum')
                .attr('y', (d, i) => y(rows[i]))
                .attr('x', width + 5) // Adjusted position here
                .attr('height', y.bandwidth())
                .attr('width', (d) => rowBarScale(d))
                .attr('fill', (d, i) => clusterColors(rows[i]));

            svg.selectAll('rect.colSum')
                .data(colSums)
                .enter()
                .append('rect')
                .attr('class', 'colSum')
                .attr('x', (d, i) => x(cols[i]))
                .attr('y', (d) => -colScale(d) - 5)
                .attr('width', x.bandwidth())
                .attr('height', (d) => colScale(d))
                .attr('fill', '#808080');

            svg.selectAll('.y-label-padding')
                .data(rows)
                .enter()
                .append('rect')
                .attr('class', 'y-label-padding')
                .attr('y', (d) => y(d) + y.bandwidth() / 2 - 18) // Centering the padding next to the label
                .attr('x', -2)
                .attr('height', 34)
                .attr('width', 3)
                .attr('fill', (d) => clusterColors(d));

            // Add colored padding next to x-axis labels (if needed)
            svg.selectAll('.x-label-padding')
                .data(cols)
                .enter()
                .append('rect')
                .attr('class', 'x-label-padding')
                .attr('x', (d) => x(d) + x.bandwidth() / 2 - 17) // Centering the padding next to the label
                .attr('y', height-3)
                .attr('height', 3)
                .attr('width', 32)
                .attr('fill', (d) => clusterColors(d)); // You can adjust this if columns have a different color scheme

        }
    }, [data, height, margin.top, width]);

    return (
        <svg ref={svgRef} viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`} className='mt-20 w-full h-full'>
            <g transform={`translate(${margin.left},${margin.top})`}></g>
        </svg>
    );
};

export default PathwayHeatmap;
