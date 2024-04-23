import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';

const PCAPlot = ({plotKey, bucket}) => {
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState(null);

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
  }, [plotKey, bucket]);

  let trace1;
  if(plotData) {
    trace1 = {
        x: plotData.map(data => data[0]),
        y: plotData.map(data => data[1]),
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 5,
            opacity: 0.75
          },
    };
  }

  return (
    <div className="h-full w-full bg-white flex items-center justify-center border-4">
      {
        plotData && (
          <Plot
          className='w-full'
          data={[trace1]}
          layout={{
              title: "PCA Plot",
              width: '100%',
              margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
              },
              xaxis: {
                title: "PCA 1",
                showgrid: false
              },
              yaxis: {
                title: "PCA 2",
                showgrid: false
              },
            }}
            responsive={true}
            style={{ width: '100%', height: '100%' }}
            config={{displaylogo: false}}
          />
        )
      }
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
};

export default PCAPlot;
