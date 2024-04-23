import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import protobuf from "protobufjs";
import { getBinaryPlotData } from '../utils/s3client.mjs';

const Heatmap = ({ plotKey, bucket, clusters }) => {
    const [heatmapPlotData, setHeatmapPlotData] = useState(null);
    const PAGE_SIZE = 100;  // number of genes to show at once
    const [page, setPage] = useState(0); 
    useEffect(() => {
    protobuf.load("/heatmap.proto", function (err, root) {
        if (err) throw err;
        console.log("Fetching binary heatmap data file...");
        getBinaryPlotData(bucket, plotKey)
          .then(buffer => {
            const ProtobufHeatmapData = root.lookupType("HeatmapData");
            const decodedData = ProtobufHeatmapData.decode(new Uint8Array(buffer));
            console.log(decodedData);
            const genes = decodedData.featureNames;

            // Extract unique clusters for x-axis, subtract 1 from each, and sort them
            const xLabels = [...new Set(decodedData.dataRows.map(row => row.cluster))].map(cluster => cluster).sort();

            const heatmapValues = genes.map((gene, geneIndex) => {
              return xLabels.map(cluster => {
                  const rowsForCluster = decodedData.dataRows.filter(row => row.cluster === cluster);
                  if (!rowsForCluster.length) {
                      console.warn(`No rows found for cluster ${cluster}`);
                      return null; // or some default value
                  }
                  return rowsForCluster[geneIndex]?.values[geneIndex] || null; // Using optional chaining
              });
            });
      
            const set_data = {
                xLabels,
                yLabels: genes,
                heatmapValues
            }
            setHeatmapPlotData(set_data);
          })
          .catch(err => console.error("Failed to fetch or decode data:", err));
        });
    }, [bucket, plotKey]);

    if (!heatmapPlotData) {
        return <div>Heatmap Analysis...</div>;
    } 
    const displayedData = {
      xLabels: heatmapPlotData.xLabels,
      yLabels: heatmapPlotData.yLabels.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
      heatmapValues: heatmapPlotData.heatmapValues.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    };
    return (
      <div className="w-full h-full flex justify-center items-center">


      <div style={{overflowY: 'scroll', maxHeight: '100%'}}>
        <Plot
            data={[
                {
                  z: displayedData.heatmapValues,
                  x: displayedData.xLabels,
                  y: displayedData.yLabels,
                  type: 'heatmap',
                  colorscale: "RdBu",
                  showscale: true,
                }
            ]}
            layout={{
                pad: { t: 50 },
                xaxis: {
                    showgrid: false,
                    zeroline: false,
                    showticklabels: true,
                    tickvals: heatmapPlotData.xLabels,
                    ticktext: Object.values(clusters),
                    title: 'Clusters',
                    side: 'top' // This moves the x-axis labels to the top
                },
                yaxis: {
                    showgrid: false,
                    zeroline: false,
                    showticklabels: true
                }
            }}
            config={{ displaylogo: false }}
        />
      </div>
          <div>
            <button onClick={() => setPage(prev => Math.max(0, prev - 1))}>Previous</button>
            <button onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(heatmapPlotData.yLabels.length / PAGE_SIZE) - 1))}>Next</button>
          </div>

      </div>
    );
};

export default Heatmap;
