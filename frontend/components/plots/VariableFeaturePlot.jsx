import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';

const VariableFeaturePlot = ({ plotKey, bucket}) => {
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

  let trace, layout;
  if(plotData) {
    trace = {
        type: 'scatter',
        mode: 'markers',
        x: plotData.map(item => item.Mean_Expression),
        y: plotData.map(item => item.Standardized_Variance),
        marker: {
          color: '#1c2a46',
          size: 2,
          opacity: 0.7,
        },
      };
      layout = {
        title: 'Variable Feature Plot',
        xaxis: {
          title: 'Average Expression',

          type: 'log', // Use 'log' for log scale if needed
          showgrid:false
        },
        yaxis: {
          title: 'Standardized Variance',
          showgrid:false
        },
        hovermode: 'closest'
      };

  }
    
  return (
    <div className="border-4 bg-white w-full h-full rounded-lg"> {/* Center both vertically and horizontally */}
      <div className="w-full h-full overflow-auto rounded-lg"> {/* Set the width and height */}
        {plotData && (<Plot className="flex justify-center items-center w-full h-full"data={[trace]} layout={layout} config={{displaylogo: false}}/>)}
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>
    </div>
  );
    };

    export default VariableFeaturePlot;