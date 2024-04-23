import { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const DemoDotPlots = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        const fetchPlotData = async () => {
          try {
            const data = await fetch('/demo_dotplot.json');
            const jsonData = await data.json();
            console.log(jsonData);
            setData(jsonData);
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        fetchPlotData();
      }, []);

    let trace;
    let sizeLegendTraces;
    let layout;
    if (data) {

        const maxPctExp = Math.max(...data.map(row => row['pct.exp']));
        const scalingFactor = 20 / maxPctExp;
    
        trace = {
            x: data.map(row => row['features.plot']),
            y: data.map(row => row['id']),
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
            yaxis: { type: 'category', automargin: true},
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
        return (<Plot data={[trace, ...sizeLegendTraces]} layout={layout} />)
    } else {
        return(<div>Setting Dot Plot Data</div>)
    }
}
export default DemoDotPlots;
