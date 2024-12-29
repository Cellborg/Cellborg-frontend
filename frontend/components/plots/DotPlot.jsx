import { useState, useEffect } from "react";
import { getPlotData } from "../utils/s3client.mjs";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const DotPlot = ({ plotKey, bucket}) => {
    const [data, setData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    /**
     * Get gene expression data from s3
     */
    useEffect(() => {
        console.log('Key:', plotKey);
        console.log('Bucket:', bucket);
        const fetchPlotData = async () => {
          try {
            const data = await getPlotData(bucket, plotKey);
            setData(data);
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        if (plotKey && bucket) {
          fetchPlotData();
        }
      }, [plotKey, bucket]);

    if (data) {
        const clusters = new Set();
        const genes = new Set();
        const metrics = {};

        // Process the JSON data
        function processData(data) {
            const clusters = new Set();
            const genes = new Set();
            const metrics = {};
        
            // Iterate through the cells in the dataset
            Object.values(data).forEach(cell => {
            const cluster = cell.cluster;
            clusters.add(cluster);
        
            // Loop through genes in the dataset
            Object.keys(cell).forEach(key => {
                if (key !== 'UMAP1' && key !== 'UMAP2' && key !== 'cluster') {
                genes.add(key);
        
                // Initialize metrics for the cluster and gene
                if (!metrics[cluster]) {
                    metrics[cluster] = {};
                }
                if (!metrics[cluster][key]) {
                    metrics[cluster][key] = { totalCells: 0, expressedCells: 0, totalExpression: 0 };
                }
        
                // Update metrics
                const value = parseFloat(cell[key]) || 0;
                metrics[cluster][key].totalCells += 1;
                if (value > 0) {
                    metrics[cluster][key].expressedCells += 1;
                    metrics[cluster][key].totalExpression += value;
                }
                }
            });
            });
        
            return {
            clusters: Array.from(clusters).map(Number).sort((a, b) => a - b),
            genes: Array.from(genes).sort(),
            metrics
            };
        }

        // Convert metrics to desired format
        function createMatrix(metrics, clusters, genes) {
            const matrix = [];
            clusters.forEach((cluster, xIndex) => {
            genes.forEach((gene, yIndex) => {
                const clusterMetrics = metrics[cluster] && metrics[cluster][gene];
                if (clusterMetrics) {
                const percentExpressed =
                    (clusterMetrics.expressedCells / clusterMetrics.totalCells) * 100;
                const avgExpression =
                    clusterMetrics.expressedCells > 0
                    ? clusterMetrics.totalExpression / clusterMetrics.expressedCells
                    : 0;
        
                matrix.push({
                    x: xIndex,
                    y: yIndex,
                    z: percentExpressed,
                    value: avgExpression
                });
                }
            });
            });
            return matrix;
        }
        try {
            const { clusters, genes, metrics } = processData(data);
            const matrix = createMatrix(metrics, clusters, genes);
        
            // Render Highcharts
            setChartOptions({
              chart: {
                type: 'bubble',
                plotBorderWidth: 1,
                zooming: {
                  type: 'xy'
                }
              },
        
              colorAxis: {
                min: 0,
                max: 3, // Adjust max based on your data
                stops: [
                  [0, '#FFFFFF'], // White for the lowest value
                  [0.5, '#007AFF'], // Intermediate color
                  [1, '#00008B'] // Dark blue for the highest value
                ],
                title: {
                  text: 'Avg Expression'
                }
              },
        
              title: {
                text: 'Single-cell RNAseq Gene Expression'
              },
        
              xAxis: {
                title: { text: 'Cluster' },
                categories: clusters.map(cluster => `Cluster ${cluster}`), // Use cluster names
                gridLineWidth: 1
              },
        
              yAxis: {
                title: { text: 'Gene Name' },
                categories: genes, // Use gene names
                startOnTick: false,
                endOnTick: false,
                gridLineWidth: 1
              },
        
              tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: 'Cluster: {point.xCategory}<br>Gene: {point.yCategory}<br>% Expressed: {point.z}%<br>Avg Expression: {point.value}'
              },
        
              series: [{
                name: 'Gene Expression',
                colorKey: 'value', // Links the color axis to the 'value' field
                data: matrix
              }]
            });
          } catch (error) {
            console.error('Error:', error);
          }

        return (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )
    } else {
        return(<div>Setting Dot Plot Data</div>)
    }
}
export default DotPlot;
