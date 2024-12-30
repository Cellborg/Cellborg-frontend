import React, { useState, useEffect } from 'react';
import { getPlotData } from '../utils/s3client.mjs';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsColorAxis from 'highcharts/modules/coloraxis';
HighchartsMore(Highcharts);
HighchartsColorAxis(Highcharts);

const FeaturePlot = ({bucket, plotKey, gene }) => {
  const [plotData, setPlotData] = useState(null);
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    console.log('Key:', plotKey);
    console.log('Bucket:', bucket);
    const fetchPlotData = async () => {
      try {
        const data = await getPlotData(bucket, plotKey);
        setPlotData(data);
      } catch (err) {
        setError(`Error fetching plot data: ${err}`);
      }
    };
    if (plotKey && bucket) {
      fetchPlotData();
    }
  }, [user, project, analysis, bucket, gene]);

  useEffect(()=>{
    if(plotData) {
      const dataArray = Object.values(plotData);

      const clusters = {};
      const geneValues = [];

      dataArray.forEach(elm => {
        if (!clusters[elm["cluster"]]) {
            clusters[elm["cluster"]] = [];
        }
        clusters[elm.cluster].push([elm["UMAP1"], elm["UMAP2"], elm[gene]]);
        geneValues.push(elm[gene]); // Collect gene values
      });
      const minGene = Math.min(...geneValues);
      const maxGene = Math.max(...geneValues);

      const getColor = (value) => {
        const ratio = (value - minGene) / (maxGene - minGene);
        const green = Math.round(255 - ratio * 255 * 0.9); // Decrease green for lighter color
        const blue = Math.round(ratio * 255 * 0.5); // Increase blue for lighter color
        return `rgb(0, ${green}, ${blue})`; // Return RGB color
      };

      const series = Object.keys(clusters).map(cluster => ({
        name: `Cluster ${cluster}`,
        id: cluster,
        data: clusters[cluster].map((point, index) => ({
            x: point[0],
            y: point[1],
            color: getColor(point[2]), // Assign color based on gene
            value: point[2] // Store gene value for color axis
        })),
        marker: {
            symbol: 'circle'
        }
      }));
      setChartOptions({
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
            }
        },
        yAxis: {
            title: {
                text: 'UMAP2'
            }
        },
        colorAxis: {
            min: minGene,
            max: maxGene,
            minColor: '#00FF00', // Light green
            maxColor: '#0000FF', // Light blue
            stops: [
                [0, '#00FF00'], // Light green
                [1, '#0000FF']  // Light blue
            ],
            title: {
                text: `${gene} Value`
            }
        },
        tooltip: {
            formatter: function () {
                return `<strong>${this.series.name}</strong><br>
                        UMAP1: ${this.x}<br>
                        UMAP2: ${this.y}<br>
                        ${gene}: ${this.point.value}`; // Show gene value
            }
        },
        plotOptions: {
            series: {
                turboThreshold: 10000,
                states: {
                    hover: {
                        enabled: true,
                        marker: {
                            fillOpacity: 1 // Ensure hovered points are fully visible
                        },
                        // Highlight other points in the same cluster
                        events: {
                            mouseOver: function () {
                                const clusterId = this.options.id;
                                this.chart.series.forEach(series => {
                                    if (series.name === `Cluster ${clusterId}`) {
                                        series.data.forEach(point => {
                                            point.graphic.attr({
                                                fillOpacity: 1 // Highlight all points in the same cluster
                                            });
                                        });
                                    }
                                });
                            },
                            mouseOut: function () {
                                this.chart.series.forEach(series => {
                                    series.data.forEach(point => {
                                        point.graphic.attr({
                                            fillOpacity: 0.5 // Reset opacity
                                        });
                                    });
                                });
                            }
                        }
                    }
                }
            },
            scatter: {
                marker: {
                    fillOpacity: 0.5,
                    radius: 2.5,
                    symbol: 'circle'
                }
            }
        },
        series
      });
    }
  }, [plotData])

  return (
    <div className="flex justify-center items-center w-full h-full overflow-auto">
      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <div>Setting Feature Plot Data...</div>
      )} 
    </div>
  );
};

export default FeaturePlot;
