import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const DemoScatterPlot = () => {
    const [plotData, setPlotData] = useState(null);
    const COLORS = [
        '#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', 
        '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6',
        '#ff6347', '#8dd3c7', '#ffffb3', '#bebada', '#fb8072',
        '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'
    ];
    useEffect(() => {
        const fetchData = async () => {
            if (!plotData) {
                console.log("Fetching data");
                try {
                    const response = await fetch('/wot.json');
                    if (response.ok) {
                        setPlotData(await response.json());
                    } else {
                        console.error("Failed to fetch data:", response.statusText);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchData();
    }, [plotData]);

    let traces = [];
    if (plotData) {
        const totalClusters = plotData.total_clusters;
        const clusterCounts = plotData.clusterCounts;  
        const clusters = plotData.cluster;
        const xCoordinates = plotData.X;
        const yCoordinates = plotData.Y;

        for (let i = 0; i < totalClusters; i++) {
            const clusterIndices = clusters.map((cluster, index) => cluster === i+1 ? index : null).filter(index => index !== null);
            const xCluster = clusterIndices.map(index => xCoordinates[index]);
            const yCluster = clusterIndices.map(index => yCoordinates[index]);

            traces.push({
                type: 'scatter',
                mode: 'markers',
                x: xCluster,
                y: yCluster,
                name: `Cluster ${i}`, 
                legendgroup: `Cluster ${i}`,
                showlegend: false,  // Hide this trace in the legend
                marker: {
                    color: COLORS[i % COLORS.length],
                    size: 3,
                    opacity: 0.8,
                },
            });

            // Legend-only trace
            traces.push({
                type: 'scatter',
                mode: 'markers',
                x: [null],  // null values so it doesn't appear on the plot
                y: [null],
                name: `Cluster ${i}`,
                legendgroup: `Cluster ${i}`,  
                showlegend: false,  // Show this trace in the legend
                marker: {
                    color: COLORS[i % COLORS.length],
                    size: 10,  
                },
            });
        }
        console.log(traces);
    }
    return (
        <>
            {plotData && (
                <Plot
                    className='w-full h-full'
                    data={traces}
                    layout={{
                        title: 'UMAP Clustering',
                        titlefont: {
                            family: 'Lora', 
                            size: 20,
                            color: 'black', 
                        },
                        xaxis: {
                            zeroline: false,
                            showgrid: false,
                            showticklabels: false,
                            showline: false,
                            range: [Math.min(...plotData.X), Math.max(...plotData.X)],
                            fixedrange: true
                        },
                        yaxis: {
                            zeroline: false,
                            showgrid: false,
                            showticklabels: false,
                            showline: false,
                            range: [Math.min(...plotData.Y), Math.max(...plotData.Y)],
                            fixedrange: true
                        }
                    }}
                    config={{ displaylogo: false, displayModeBar: false}}
                />
            )}
        </>
    );
    
};

export default DemoScatterPlot;
