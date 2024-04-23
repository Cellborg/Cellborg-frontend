import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';

const PCAGenePlot = ({plotKey, bucket}) => {

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

    const [sortedData, setSortedData] = useState([]);

    useEffect(() => {
        if (plotData) {
            const sortedByPC1 = [...plotData].sort((a, b) => Math.abs(b.PC_1) - Math.abs(a.PC_1));
            const sortedByPC2 = [...plotData].sort((a, b) => Math.abs(b.PC_2) - Math.abs(a.PC_2));
    
            setSortedData({
                PC1: sortedByPC1.slice(0, 30),
                PC2: sortedByPC2.slice(0, 30)
            });
        }
    }, [plotData]);


    return (
        <div>
            {plotData && (
            <><Plot
                    data={[
                        {
                            x: sortedData.PC1?.map(item => item.PC_1),
                            y: sortedData.PC1?.map(item => item.gene_name),
                            type: 'scatter',
                            mode: 'markers',
                            marker: { color: 'blue' },
                        }
                    ]}
                    layout={{ xaxis: { title: "PC1", showgrid: false }, yaxis: { showgrid: false } }}
                    config={{ displaylogo: false }} /><Plot
                        data={[
                            {
                                x: sortedData.PC2?.map(item => item.PC_2),
                                y: sortedData.PC2?.map(item => item.gene_name),
                                type: 'scatter',
                                mode: 'markers',
                                marker: { color: 'blue' },
                            }
                        ]}
                        layout={{ xaxis: { title: "PC2", showgrid: false }, yaxis: { showgrid: false } }}
                        config={{ displaylogo: false }} /></>)}
            {error && <p className="text-red-600">Error: {error}</p>}
        </div>
    );
}
export default PCAGenePlot;
