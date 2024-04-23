import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';

const OrderCellsPlot = ({ plotKey, bucket, setSelectedPoints,selectedPoints }) => {
    const [plotData, setPlotData] = useState(null);
    useEffect(() => {
        console.log('Key:', plotKey);
        console.log('Bucket:', bucket);
        const fetchPlotData = async () => {
          try {
            const data = await getPlotData(bucket, plotKey);
            setPlotData(data);
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        if (plotKey && bucket) {
          fetchPlotData();
        }
    }, [plotKey, bucket]);
    
    const handlePointClick = (data) => {
        console.log(data);
        const { curveNumber, pointNumber } = data.points[0];
        if (curveNumber === 1) {  // Ensure this is the correct curve number
            setSelectedPoints(prevSelectedPoints => {
                const newSelectedPoints = new Set(prevSelectedPoints);
                const translatedPointNumber = pointNumber + 1;  // Translate to 1-based index for R
                if (newSelectedPoints.has(translatedPointNumber)) {
                    newSelectedPoints.delete(translatedPointNumber);
                } else {
                    newSelectedPoints.add(translatedPointNumber);
                }
                return newSelectedPoints;
            });
        }
    };
    

    if (!plotData || !plotData.reduced_dims) return "Loading...";
    const scatterData = [
        {
            x: plotData.reduced_dims.map(obj => obj.V1),
            y: plotData.reduced_dims.map(obj => obj.V2),
            type: 'scatter',
            mode: 'markers',
            marker: { color: 'gray', size: 3, opacity: 0.6 },
            text: plotData.reduced_dims.map(obj => obj._row),
            hoverinfo: 'text+x+y',
        }
    ];
    if (plotData.keep && Array.isArray(plotData.keep)) { 
        const xValues = [];
        const yValues = [];
        plotData.keep.forEach(keepObj => {
            if (keepObj.prin_graph_dim_1 !== undefined && keepObj.prin_graph_dim_2 !== undefined) {
                xValues.push(keepObj.prin_graph_dim_1);
                yValues.push(keepObj.prin_graph_dim_2);
            }
        });

        if (xValues.length && yValues.length) {
            scatterData.push({
                x: xValues,
                y: yValues,
                type: 'scatter',
                mode: 'markers',
                marker: { color: [], size: 6 },
                hoverinfo: 'x+y',
                hovertemplate: '<span class="clickable-point">%{x}, %{y}</span>',
            });
        }
    }

    if (plotData.exclude && plotData.exclude.prin_graph_dim_1 && plotData.exclude.prin_graph_dim_2) {
        scatterData.push({
        x: plotData.exclude.prin_graph_dim_1,
        y: plotData.exclude.prin_graph_dim_2,
        type: 'scatter',
        mode: 'markers',
        marker: { color: 'red', size: 5 },
        hoverinfo: 'x+y',
        });
    }

    if (plotData.edge_df && Array.isArray(plotData.edge_df)) {
        plotData.edge_df.forEach(edge => {
            if (
                typeof edge.source_prin_graph_dim_1 === 'number' &&
                typeof edge.source_prin_graph_dim_2 === 'number' &&
                typeof edge.target_prin_graph_dim_1 === 'number' &&
                typeof edge.target_prin_graph_dim_2 === 'number'
            ) {
                scatterData.push({
                    x: [edge.source_prin_graph_dim_1, edge.target_prin_graph_dim_1],
                    y: [edge.source_prin_graph_dim_2, edge.target_prin_graph_dim_2],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color: 'black' },
                    hoverinfo: 'none',
                });
            }
        });
    }

    if (scatterData[1]) {
        scatterData[1].marker.color = scatterData[1].x.map((_, idx) => 
            selectedPoints.has(idx + 1) ? 'red' : 'black'  // Translate to 1-based index
        );
    }
return (
    
    <>
        <div className='w-full h-full flex'>
            <Plot
                className="w-full h-full flex justify-center items-center rounded-lg"
                data={scatterData}
                layout={{
                    title: 'Order Cells',
                    xaxis: { title: 'Component 1', showgrid: false, zeroline: false, showticklabels: false },
                    yaxis: { title: 'Component 2', showgrid: false, zeroline: false, showticklabels: false },
                    margin: {
                        l: 50,
                        r: 50,
                        b: 100,
                        t: 100,
                        pad: 5
                    },
                    showlegend: false,
                    hovermode: 'closest',
                    dragmode: 'select',
                }}
                onClick={handlePointClick}
                config={{ displaylogo: false }} 
            />
        </div>
    </>
    );
}

export default OrderCellsPlot;