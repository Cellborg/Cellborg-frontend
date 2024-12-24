import {useEffect, useState} from 'react';
import { getPlotData, checkIfPlotDataExists } from '../utils/s3client.mjs';
import { useProjectContext } from '../utils/projectContext';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ScatterPlot = ({plotKey,bucket}) => {
    const [plotData, setPlotData] = useState(null);
    const { clusters, setClusters } = useProjectContext();
    
    useEffect(() => {
      console.log('Key:', plotKey);
      console.log('Bucket:', bucket);
      const fetchPlotData = async () => {
        try {
          const data = await getPlotData(bucket, plotKey);
          setPlotData(data);
          console.log("about to start iterating");
          console.log(clusters)
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

    let options;
    useEffect(()=>{
      if (plotData) {
        // Convert the JSON object into an array
        const dataArray = Object.values(plotData);
        console.log(dataArray);
  
        // Calculate global min and max for X and Y axes
        const xValues = dataArray.map(elm => elm.UMAP1);
        const yValues = dataArray.map(elm => elm.UMAP2);
  
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
  
  
        // Group data by cluster
        const clusterData = {};
        dataArray.forEach(elm => {
            if (!clusterData[elm.cluster]) {
                clusterData[elm.cluster] = [];
            }
            clusterData[elm.cluster].push([elm.UMAP1, elm.UMAP2]);
        });
  
        console.log(clusterData);
  
        // Generate series dynamically
        const series = Object.keys(clusterData).map((cluster, index) => ({
          name: `Cluster ${cluster}`,
          id: cluster,
          data: clusterData[cluster],
          marker: {
              symbol: 'circle'
          }
        }));
  
        // Create the Highcharts scatter plot
      options = {
        chart: {
            type: 'scatter',
            zooming: {
                type: 'xy'
            },
            boost: {
                enabled: true,
                useGPUTranslations: true,
                seriesThreshold: 1
            }
        },
        title: {
            text: 'Clustering of Cells'
        },
        xAxis: {
            title: {
                text: 'UMAP1'
            },
            min: xMin - 1, // Add padding for better visualization
            max: xMax + 1,
            gridLineWidth: 0,
            labels: {
                enabled: false
            },
            tickLength: 0,
            lineWidth: 1
        },
        yAxis: {
            title: {
                text: 'UMAP2'
            },
            min: yMin - 1,
            max: yMax + 1,
            gridLineWidth: 0,
            labels: {
                enabled: false
            },
            tickLength: 0,
            lineWidth: 1
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            series: {
                turboThreshold: 10000 // Disable threshold to allow large datasets
            },
            scatter: {
                marker: {
                    fillOpacity: 1,
                    radius: 2.5,
                    symbol: 'circle',
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: true
                        }
                    }
                }
            }
        },
        tooltip: {
            formatter: function () {
                return this.series.name; // Show only the cluster name
            }
        },
        series
    };
  }
    }, [plotData, options])

    return (
      <div className="w-full h-full bg-white rounded-lg">
        {plotData && (
          <HighchartsReact highcharts={Highcharts} options={options} />
        )}
      </div>
    );
};

export default ScatterPlot;
