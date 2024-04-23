import React from 'react';
import Plot from 'react-plotly.js';

const ViolinPlot = ({plotData}) => {
  var trace1, trace2, trace3, layout;

  if(plotData) {
    const nFeatureRNAValues = plotData.nFeature_RNA;
    const nCountRNAValues = plotData.nCount_RNA;
    const percentMTValues = plotData['percent.mt'];
    trace1 = {
      type: 'violin',
      x0: 'nFeature_RNA',
      y: nFeatureRNAValues, // "nFeature_RNA" values as the y-axis values
      points: 'outliers', // Show individual points for each feature
      jitter: 0.5, // Adjust the jitter of points to avoid overlap
      meanline: {
        visible: true
      },
      opacity: 0.7,
      marker:{
        color: '#1c2a46'
      }
    }
    trace2 = {
      type: 'violin',
      x0: 'nCount_RNA',
      y: nCountRNAValues, // "nFeature_RNA" values as the y-axis values
      points: 'outliers', // Show individual points for each feature
      jitter: 0.5, // Adjust the jitter of points to avoid overlap
      meanline: {
        visible: true
      },
      opacity: 0.6,
      marker:{
        color: '#1c2a46'
      }
    }
    trace3 = {
      type: 'violin',
      x0: 'percent.mt',
      y: percentMTValues, // "nFeature_RNA" values as the y-axis values
      points: 'outliers', // Show individual points for each feature
      jitter: 0.5, // Adjust the jitter of points to avoid overlap
      meanline: {
        visible: true
      },
      opacity: 0.6,
      marker:{
        color: '#1c2a46'
      }
    }
    layout = {
      title: "QC Violin Plots",
      yaxis: {
        zeroline: false,
        showgrid: false
      },
      xaxis: {
        showgrid: false
      }
    }

  }
  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white overflow-auto"> 
        <Plot className="w-full h-full flex items-center justify-center"data={[trace1]} layout={layout} config={{displaylogo: false}}/>
      </div>
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
        <Plot className=" w-full  h-full flex items-center justify-center"data={[trace2]} layout={layout} config={{displaylogo: false}}/>
      </div>
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
        <Plot className=" w-full h-full flex items-center justify-center"data={[trace3]} layout={layout} config={{displaylogo: false}}/>
      </div>
    </div>
  );
};

export default ViolinPlot;
