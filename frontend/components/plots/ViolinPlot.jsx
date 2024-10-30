import React from 'react';
import HighchartsReact from "highcharts-react-official";
import Highcharts from 'highcharts';

// Function to calculate 10% of the histogram's maximum height as variable B
function calculateVariableB(histogramData) {
  const maxYValue = Math.max(...histogramData.map(point => point[1]));
  return maxYValue * 0.1; // 10% of the max y-axis value
}

// Helper function to generate histogram data
function createHistogramData(data, binSize) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const bins = [];
  for (let i = min; i <= max; i += binSize) {
      const count = data.filter(value => value >= i && value < i + binSize).length;
      bins.push([i + binSize / 2, count]);
  }
  return bins;
}

// Function to add jitter below the x-axis with a maximum width of variable B
function addJitterBelowXAxis(data, yOffset, jitterWidth) {
  return data.map(value => [value, yOffset - (Math.random() * jitterWidth)]);
}

const ViolinPlot = ({plotData}) => {
  var optionsNGenes, optionsTotalCounts, optionsPCTCounts;

  if(plotData) {
    const n_genes_data = Object.values(data).map(metrics => metrics.n_genes);
    const total_counts_data = Object.values(data).map(metrics => metrics.total_counts);
    const pct_counts_mt_data = Object.values(data).map(metrics => metrics.pct_counts_mt);

    // Create histogram data with a bin size of your choice
    const n_genes_histogram = createHistogramData(n_genes_data, 50);
    const total_counts_histogram = createHistogramData(total_counts_data, 500);
    const pct_counts_mt_histogram = createHistogramData(pct_counts_mt_data, 0.5);

    // Calculate variable B (10% of histogram height) for each histogram
    const n_genes_variableB = calculateVariableB(n_genes_histogram);
    const total_counts_variableB = calculateVariableB(total_counts_histogram);
    const pct_counts_mt_variableB = calculateVariableB(pct_counts_mt_histogram);

    // Chart 1: Histogram and jittered scatter plot for n_genes
    optionsNGenes = {
      chart: {
        type: 'scatter'
      },
      title:{
        text: 'Number of Genes per Cell'
      },
      xAxis: { title: { text: 'n_genes' } },
      yAxis: { title: { text: 'Frequency' } },
      tooltip: {
        crosshairs: true, // Enables vertical line on hover
        formatter: function () {
            return 'X-axis Value: ' + this.x;
        }
    },
      series: [
        {
            type: 'column',
            name: 'n_genes Distribution',
            data: n_genes_histogram,
            color: 'rgba(124, 181, 236, 0.6)',
            pointPadding: 0,
            groupPadding: 0,
            pointPlacement: 'between'
        },
        {
            name: 'n_genes Scatter',
            type: 'scatter',
            data: addJitterBelowXAxis(n_genes_data, -n_genes_variableB, n_genes_variableB),
            color: 'rgba(124, 181, 236, 0.3)',
            marker: { radius: 2 }
        }
    ]
    }

  optionsTotalCounts = {
    chart: { type: 'scatter' },
    title: { text: 'Total Counts per Cell' },
    xAxis: { title: { text: 'total_counts' } },
    yAxis: { title: { text: 'Frequency' } },
    tooltip: {
        crosshairs: true, // Enables vertical line on hover
        formatter: function () {
            return 'X-axis Value: ' + this.x;
        }
    },
    series: [
        {
            type: 'column',
            name: 'total_counts Distribution',
            data: total_counts_histogram,
            color: 'rgba(144, 237, 125, 0.6)',
            pointPadding: 0,
            groupPadding: 0,
            pointPlacement: 'between'
        },
        {
            name: 'total_counts Scatter',
            type: 'scatter',
            data: addJitterBelowXAxis(total_counts_data, -total_counts_variableB, total_counts_variableB),
            color: 'rgba(144, 237, 125, 0.3)',
            marker: { radius: 2 }
        }
    ]
  }

  optionsPCTCounts = {
    chart: { type: 'scatter' },
    title: { text: 'Percentage of Mitochondrial Counts per Cell' },
    xAxis: { title: { text: 'pct_counts_mt (%)' } },
    yAxis: { title: { text: 'Frequency' } },
    tooltip: {
        crosshairs: true, // Enables vertical line on hover
        formatter: function () {
            return 'X-axis Value: ' + this.x;
        }
    },
    series: [
        {
            type: 'column',
            name: 'pct_counts_mt Distribution',
            data: pct_counts_mt_histogram,
            color: 'rgba(255, 188, 117, 0.6)',
            pointPadding: 0,
            groupPadding: 0,
            pointPlacement: 'between'
        },
        {
            name: 'pct_counts_mt Scatter',
            type: 'scatter',
            data: addJitterBelowXAxis(pct_counts_mt_data, -pct_counts_mt_variableB, pct_counts_mt_variableB),
            color: 'rgba(255, 188, 117, 0.3)',
            marker: { radius: 2 }
        }
    ]
  }}


  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white overflow-auto"> 
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={optionsNGenes}
      />
      </div>
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={optionsTotalCounts}
      />
      </div>
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={optionsPCTCounts}
      />
      </div>
    </div>
  );
};

export default ViolinPlot;
