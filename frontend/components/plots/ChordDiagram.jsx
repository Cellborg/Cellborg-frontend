import React from 'react';
import Plot from 'react-plotly.js';

const ChordDiagram = ({ probSum, labels }) => {
    const theta = labels.map((_, i) => (i / labels.length) * 360);
    const colors = ['red', 'blue', 'green', 'purple', 'orange', 'cyan', 'magenta', 'yellow', 'grey'];
    
    const traces = [];
    
    for (let i = 0; i < probSum.length; i++) {
        for (let j = 0; j < probSum[i].length; j++) {
            if (probSum[i][j] > 0 && i !== j) {
                traces.push({
                    type: 'scatterpolar',
                    mode: 'lines',
                    line: { color: colors[i], width: Math.max(probSum[i][j] * 100, 2) },
                    theta: [theta[i], theta[j]],
                    r: [1.2, 1.2],
                    name: '',
                    hoverinfo: 'text',
                    text: `${labels[i]} to ${labels[j]}: ${probSum[i][j]}`,
                });
            }
            if (i === j && probSum[i][j] > 0) { // Creating self-connection spikes
                traces.push({
                    type: 'scatterpolar',
                    mode: 'lines',
                    line: { color: colors[i], width: Math.max(probSum[i][j] * 100, 2) },
                    theta: [theta[i], 0, theta[i]],
                    r: [1.2, 0, 1.2],
                    name: '',
                    hoverinfo: 'text',
                    text: `${labels[i]} to ${labels[j]}: ${probSum[i][j]}`,
                });
            }
        }
    }

    const layout = {
        showlegend: false,
        polar: {
            radialaxis: { visible: false },
            angularaxis: {
                visible: true,
                direction: "clockwise",
                tickvals: theta,
                ticktext: labels,
                tickfont: { size: 18 },
                showline: false,
                showticklabels: true,
                gridcolor: 'white',
                ticks: "",
            }
        }
    };
    
    return <Plot data={traces} layout={layout} />;
};

export default ChordDiagram;
