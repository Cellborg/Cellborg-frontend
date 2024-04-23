import Plot from 'react-plotly.js';
import { useState } from 'react';

const DoubletPlot = ({data}) => {
    const [display, setDisplay] = useState('both'); // Default to displaying both
    let singletsData, doubletsData;
    if (data) {
        singletsData = {
            x: data.filter(d => d.class === 'Singlet').map(d => d.UMAP_1),
            y: data.filter(d => d.class === 'Singlet').map(d => d.UMAP_2),
            mode: 'markers',
            type: 'scatter',
            name: 'Singlet',
            marker: {
                color: '#1c2a66',
                size: 3,
                opacity: 0.7,
            },
            visible: (display === 'both' || display === 'singlets') ? true : 'legendonly'
        };
       doubletsData = {
            x: data.filter(d => d.class === 'Doublet').map(d => d.UMAP_1),
            y: data.filter(d => d.class === 'Doublet').map(d => d.UMAP_2),
            mode: 'markers',
            type: 'scatter',
            name: 'Doublet',
            marker: {
                color: 'red',
                size: 3,
                opacity: 0.8,
                line: { width: 1, color: 'red'},
            },
            visible: (display === 'both' || display === 'doublets') ? true : 'legendonly'
        };
    }
    const layout = {
        margin: {
            t: 0, //top margin
            l: 0, //left margin
            r: 0, //right margin
            b: 0 //bottom margin
            },
        xaxis: {
            title: 'UMAP 1',
            showgrid: false,
            zeroline: false,
            showticklabels: false,
        },
        yaxis: {
            title: 'UMAP 2',
            showgrid: false,
            zeroline: false,
            showticklabels: false,
        },
        legend: {
            y: 0.5,
            yref: 'paper',
            font: { family: 'Arial, sans-serif', size: 16, color: 'black' },
            showlegend: false
        }
    };

    return (
        <div className='w-full h-full flex justify-center border-4 bg-white'>
            <div className='w-full'>
                <Plot
                    className='w-full'
                    data={[singletsData, doubletsData]}
                    layout={layout}
                    config={{displaylogo: false}}
                />
                <div className='flex justify-center items-center'>
                    <label className='m-3 px-2'>
                        <input
                            type='radio'
                            value='both'
                            checked={display === 'both'}
                            onChange={() => setDisplay('both')}
                        />
                        Both
                    </label>

                    <label className='m-3 px-2'>
                        <input
                            type='radio'
                            value='singlets'
                            checked={display === 'singlets'}
                            onChange={() => setDisplay('singlets')}
                        />
                        Singlets
                    </label>

                    <label className='m-3 px-2'>
                        <input
                            type='radio'
                            value='doublets'
                            checked={display === 'doublets'}
                            onChange={() => setDisplay('doublets')}
                        />
                        Doublets
                    </label>
                </div>
            </div>
        </div>
    );
};

export default DoubletPlot;