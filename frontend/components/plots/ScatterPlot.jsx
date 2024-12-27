import { useEffect, useState } from 'react';
import { getPlotData } from '../utils/s3client.mjs';
import { useProjectContext } from '../utils/projectContext';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ScatterPlot = ({ plotKey, bucket }) => {
  const [plotData, setPlotData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);  // <-- State for our Highcharts options
  const { clusters, setClusters } = useProjectContext();

  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        const data = await getPlotData(bucket, plotKey);
        setPlotData(data);
        if (data && Object.keys(clusters).length === 0) {
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

  // Whenever `plotData` changes, generate our chart options:
  useEffect(() => {
    if (plotData) {
      // Convert the JSON object into an array
      const dataArray = Object.values(plotData);
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

      // Generate series dynamically
      const series = Object.keys(clusterData).map((cluster) => ({
        name: `Cluster ${cluster}`,
        id: cluster,
        data: clusterData[cluster],
        marker: {
          symbol: 'circle'
        }
      }));

      // Store the options in state
      setChartOptions({
        chart: {
          type: 'scatter',
          zooming: { type: 'xy' },
          boost: {
            enabled: true,
            useGPUTranslations: true,
            seriesThreshold: 1
          }
        },
        title: { text: 'Clustering of Cells' },
        xAxis: {
          title: { text: 'UMAP1' },
          min: xMin - 1,
          max: xMax + 1,
          gridLineWidth: 0,
          labels: { enabled: false },
          tickLength: 0,
          lineWidth: 1
        },
        yAxis: {
          title: { text: 'UMAP2' },
          min: yMin - 1,
          max: yMax + 1,
          gridLineWidth: 0,
          labels: { enabled: false },
          tickLength: 0,
          lineWidth: 1
        },
        legend: { enabled: true },
        plotOptions: {
          series: {
            turboThreshold: 10000
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
              hover: { marker: { enabled: true } }
            }
          }
        },
        tooltip: {
          formatter: function () {
            return this.series.name; 
          }
        },
        series
      });
    }
  }, [plotData]);

  return (
    <div className="w-full h-full bg-white rounded-lg">
      {chartOptions && (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      )}
    </div>
  );
};

export default ScatterPlot;
