import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { getPlotData } from "../utils/s3client.mjs";

const DotPlot = ({ plotKey, bucket, clusters }) => {
    const [data, setData] = useState(null);
    useEffect(() => {
        console.log('Key:', plotKey);
        console.log('Bucket:', bucket);
        const fetchPlotData = async () => {
          try {
            const data = await getPlotData(bucket, plotKey);
            setData(data);
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        if (plotKey && bucket) {
          fetchPlotData();
        }
      }, [plotKey, bucket]);

    let trace;
    let sizeLegendTraces;
    let layout;
    if (data) {

        const maxPctExp = Math.max(...data.map(row => row['pct.exp']));
        const scalingFactor = 20 / maxPctExp;
    
        trace = {
            x: data.map(row => row['features.plot']),
            y: data.map(row => clusters[row['id']] || row['id']),
            mode: 'markers',
            marker: {
                color: data.map(row => row['avg.exp.scaled']),
                size: data.map(row => row['pct.exp'] * scalingFactor),
                colorscale: [[0, 'rgba(210, 210, 210, 0.75)'], [1, 'green']],
                showscale: true,
                sizemode: 'diameter',
                colorbar: {
                    len: 0.5,
                    y: 0.2
                }
            },
            type: 'scatter',
            text: data.map(row => `Average Expression: ${row['avg.exp']}, Percent Expressed: ${row['pct.exp']}`),
            hoverinfo: 'text+x+y',
            showlegend: false
        };
    
        sizeLegendTraces = [0, 25, 50, 75, 100].map(pct => ({
            x: [null],
            y: [null],
            marker: { size: pct * scalingFactor, color: 'green' },
            name: `${pct}%`,
            mode: 'markers',
            hoverinfo: 'none',
            showlegend: true
        }));

        layout = {
            xaxis: { title: 'Features', showgrid: false },
            yaxis: { title: 'Identity', type: 'category'},
            legend: { orientation: 'v', title: { text: 'Percent Expressed' } },
            title: 'Dot Plot',
            annotations: [
                {
                    text: 'Average Expression',
                    xref: 'paper',
                    yref: 'paper',
                    x: 1.275,
                    y: 0.5,
                    showarrow: false,
                    font: {
                        size: 14,
                        color: 'black'
                    }
                }
            ],
        };
        return (<Plot className='w-full h-full' data={[trace, ...sizeLegendTraces]} layout={layout} />)
    } else {
        return(<div>Setting Dot Plot Data</div>)
    }
}
export default DotPlot;
