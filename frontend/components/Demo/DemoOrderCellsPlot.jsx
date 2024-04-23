import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';

const DemoOrderCellsPlot = ({setPsuedotime}) => {
    const [plotData, setPlotData] = useState(null);
    const [selectedPoints, setSelectedPoints] = useState(new Set());
    const allowedPoints = new Set([16, 42, 36]);
    useEffect(() => {
        const fetchPlotData = async () => {
          try {
            const data = await fetch('/orderCells_demo.json');
            setPlotData(await data.json());
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        fetchPlotData();

    }, []);

    const areSetsEqual = (set1, set2) => {
        if (set1.size !== set2.size) return false;
        for (let elem of set1) {
            if (!set2.has(elem)) return false; 
        }
        return true;
    };

    const handleLoadPsuedotime = () => {
        console.log(selectedPoints);
        console.log(allowedPoints);
        if (areSetsEqual(selectedPoints, allowedPoints)) {
            console.log("points have been selected... showing pseudotime plot");
            setPsuedotime(true);
        } else {
            console.log("Please select all the points");
        }
    }

    const generateAnnotations = () => {
        const annotations = [];
        const highlightIndices = new Set([16, 42, 36]);

        if (scatterData[1] && scatterData[1].x && scatterData[1].y) {
            scatterData[1].x.forEach((_, idx) => {
                if (highlightIndices.has(idx+1)) {
                    annotations.push({
                        x: scatterData[1].x[idx],
                        y: scatterData[1].y[idx] + 2,
                        xref: 'x',
                        yref: 'y',
                        text: '🔻', // Unicode red arrow
                        showarrow: false,
                        font: {
                            size: 20,
                            color: 'red'
                        },
                        hovertext: 'Click me!',
                        hoverinfo: 'text'
                    });
                }
            });
        }

        return annotations;
    };

    const handlePointClick = (data) => {
        console.log(data);
        const { curveNumber, pointNumber } = data.points[0];
        if (curveNumber === 1 && allowedPoints.has(pointNumber + 1)) { // Adjust this line
            setSelectedPoints(prevSelectedPoints => {
                const newSelectedPoints = new Set(prevSelectedPoints);
                const translatedPointNumber = pointNumber + 1; // Translate to 1-based index for R
                if (newSelectedPoints.has(translatedPointNumber)) {
                    newSelectedPoints.delete(translatedPointNumber);
                } else {
                    newSelectedPoints.add(translatedPointNumber);
                }
                return newSelectedPoints;
            });
        } else {
            console.log("Please choose the allowed points for this demo")
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
            hoverinfo: 'none'
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
                hoverinfo: 'none'
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
        hoverinfo: 'none',
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
        <div className='w-full h-full flex flex-col items-center overflow-visible'>
            <Plot
                className="w-full h-[120%] flex justify-center items-center rounded-lg" 
                data={scatterData}
                layout={{
                    title: 'Order Cells',
                    titlefont: {
                        family: 'Lora', 
                        size: 20,
                        color: 'black', 
                    },
                    xaxis: {showgrid: false, zeroline: false, showticklabels: false },
                    yaxis: {showgrid: false, zeroline: false, showticklabels: false },
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
                    annotations: plotData ? generateAnnotations() : [] 
                }}
                onClick={handlePointClick}
                config={{ displaylogo: false, displayModeBar: false }} 
            />
            <button 
                className='z-50 bg-blue hover:scale-110 hover:transition-y-1 delay-50 transition ease-in-out text-white font-bold py-2 px-4 rounded -mt-5 mb-5'
                onClick={handleLoadPsuedotime}
            >
                Load Psuedotime
            </button>
        </div>
    );
}

export default DemoOrderCellsPlot;