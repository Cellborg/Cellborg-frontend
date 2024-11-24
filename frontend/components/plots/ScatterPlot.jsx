import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import { getPlotData, checkIfPlotDataExists } from '../utils/s3client.mjs';
import { useProjectContext } from '../utils/projectContext';

const ScatterPlot = ({plotKey,bucket}) => {
    const [plotData, setPlotData] = useState(null);
    const { clusters, setClusters } = useProjectContext();
    const COLORS = [
        '#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', 
        '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6',
        '#ff6347', '#8dd3c7', '#ffffb3', '#bebada', '#fb8072',
        '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'
    ];
    useEffect(() => {
      console.log('Key:', plotKey);
      console.log('Bucket:', bucket);
      const fetchPlotData = async () => {
        try {
          const data = await getPlotData(bucket, plotKey);
          setPlotData(data);
          console.log("about to start iterating");
          if (data && Object.keys(clusters).length === 0) {
            console.log("inside if statement");
            console.log(clusters);
            console.log(Object.keys(clusters).length);
            console.log(data.total_clusters);
            const clusterData = {};
            for (let i = 0; i < data.total_clusters; i++) {
              clusterData[`${i}`] = `${i}`;
            }
            setClusters(clusterData);
        }
        } catch (err) {
          console.log(`Error fetching plot data: ${err}`);
        }
      };
      if (plotKey && bucket) {
        fetchPlotData();
      }
    }, [plotKey, bucket, clusters, setClusters]);

    let traces = [];
    if (plotData) {
        const totalClusters = plotData.total_clusters;
        const clusterCounts = plotData.clusterCounts;  
        const plotclusters = plotData.cluster;
        const xCoordinates = plotData.X;
        const yCoordinates = plotData.Y;

        for (let i = 0; i < totalClusters; i++) {
            const clusterIndices = plotclusters.map((cluster, index) => cluster === i+1 ? index : null).filter(index => index !== null);
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
                name: `Cluster ${clusters[`${i}`]} (${clusterCounts[i]} cells)`,
                legendgroup: `Cluster ${clusters[`${i}`]}`,  
                showlegend: true,  // Show this trace in the legend
                marker: {
                    color: COLORS[i % COLORS.length],
                    size: 10,  
                },
            });
        }
        console.log(traces);
    }
    return (
      <div className="w-full h-full bg-white rounded-lg">
        {plotData && (
          <Plot
            className='w-full h-full'
            data={traces}
            layout={{
              title: 'UMAP Clustering',
              xaxis: {
                title: "UMAP1",
                zeroline: false,
                showgrid: false,
                showticklabels: false,
                showline: false,
                range: [Math.min(...plotData.X), Math.max(...plotData.X)],
                fixedrange: true
              },
              yaxis: {
                title: "UMAP2",
                zeroline: false,
                showgrid: false,
                showticklabels: false,
                showline: false,
                range: [Math.min(...plotData.Y), Math.max(...plotData.Y)],
                fixedrange: true
              }
            }}
            config={{ displaylogo: false }}
          />
        )}
      </div>
    );
};

export default ScatterPlot;
