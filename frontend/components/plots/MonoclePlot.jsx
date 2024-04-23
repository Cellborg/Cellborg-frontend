import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';

const MonoclePlot = ({ plotKey, bucket }) => {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    console.log('Key:', plotKey);
    console.log('Bucket:', bucket);
    const fetchPlotData = async () => {
      try {
        const data = await getPlotData(bucket, plotKey);
        setJsonData(data);
      } catch (err) {
        setError(`Error fetching plot data: ${err}`);
      }
    };
    if (plotKey && bucket) {
      fetchPlotData();
    }
  }, [plotKey, bucket]);

  if (!jsonData || !jsonData.data || !jsonData.edges) {
    return <div>Error: Invalid data format.</div>;
  }

  // umap cell points
  const cellTrace = {
    x: jsonData.data.map(d => d.data_dim_1),
    y: jsonData.data.map(d => d.data_dim_2),
    mode: 'markers',
    type: 'scatter',
    text: jsonData.data.map(d => d.sample_name),
    marker: {
      opacity: 0.8,
      size: 4,
      color: jsonData.data.map(d => d.cell_color),
      // https://plotly.com/javascript/colorscales/
      colorscale: 'Electric',
      colorbar: {
        title: 'Pseudotime',
      },
    }
  };
    const points = new Set();

    jsonData.edges.forEach(edge => {
        points.add(JSON.stringify({
            x: edge.source_prin_graph_dim_1,
            y: edge.source_prin_graph_dim_2
        }));
        points.add(JSON.stringify({
            x: edge.target_prin_graph_dim_1,
            y: edge.target_prin_graph_dim_2
        }));
    });

    const uniquePoints = Array.from(points).map(JSON.parse);

    // edge points
    const scatterData = {
        x: uniquePoints.map(p => p.x),
        y: uniquePoints.map(p => p.y),
        type: 'scatter',
        mode: 'markers',
        marker: {
            color: 'black',
            size: 6,
            line: {
                color: 'red',
                width: 1
            },
        },
        hoverinfo: 'x+y',
        hovertemplate: '<span class="clickable-point">%{x}, %{y}</span>',
    };

  // connecting line
  const edgeTraces = jsonData.edges.map(edge => ({
    x: [edge.source_prin_graph_dim_1, edge.target_prin_graph_dim_1],
    y: [edge.source_prin_graph_dim_2, edge.target_prin_graph_dim_2],
    mode: 'lines',
    type: 'scatter',
    line: {
      color: 'black'
    },
    hoverinfo: 'none'
  }));

  const layout = {
    title: 'Pseudotime Cell Velocity',
    showlegend: false,
    hovermode: 'closest',
    margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 5
    },
    xaxis: { showgrid: false, zeroline: false, showticklabels: false },
    yaxis: { showgrid: false, zeroline: false, showticklabels: false },
  };

  return (
        
        <Plot 
            className="w-full h-full"
            data={[cellTrace, scatterData, ...edgeTraces]} 
            layout={layout} 
            config={{ displaylogo: false }} 
        />
    );
};

MonoclePlot.defaultProps = {
  jsonData: {
    data: [],
    edges: []
  }
};

export default MonoclePlot;
