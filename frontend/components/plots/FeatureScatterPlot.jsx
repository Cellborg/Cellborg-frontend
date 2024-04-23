import React from 'react';
import Plot from 'react-plotly.js';

const FeatureScatterPlot = ({ plotData }) => {
  let trace1, trace2;
  if(plotData) {
    // Extract the values for "nCount_RNA" and "percent.mt" from the data object
    const nCountRNAValues = plotData.nCount_RNA;
    const percentMTValues = plotData['percent.mt'];
    const nFeatureRNAValues = plotData.nFeature_RNA;

    // Create a trace for the scatter plot
    trace1 = {
      type: 'scatter',
      mode: 'markers',
      x: nCountRNAValues,
      y: percentMTValues,
      marker: {
        size: 6,
        opacity: 0.5,
        color: '#1c2a46'
      },
    };
    trace2 = {
      type: 'scatter',
      mode: 'markers',
      x: nCountRNAValues,
      y: nFeatureRNAValues,
      marker: {
        size: 6,
        opacity: 0.5,
        color: '#1c2a46'
      },
    };
  }

  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="flex justify-center items-center border-4 rounded-sm p-4 bg-white overflow-auto h-full w-1/2">
        <Plot
        className="w-full h-full flex justify-center"
          data={[trace1]}
          layout={{
            xaxis: {
              title: 'nCount_RNA',
              showgrid: false
            },
            yaxis: {
              title: 'percent.mt',
              showgrid: false
            },
          }}
          config={{displaylogo: false}}
        />
      </div>
      <div className="flex justify-center items-center border-4 rounded-sm p-4 bg-white overflow-auto h-full w-1/2">
        <Plot
          className="w-full h-full flex justify-center"
          data={[trace2]}
          layout={{
            xaxis: {
              title: 'nCount_RNA',
            },
            yaxis: {
              title: 'nFeature_RNA',
            }
          }}
          config={{displaylogo: false}}
        />
      </div>
    </div>
  );
};

export default FeatureScatterPlot;
