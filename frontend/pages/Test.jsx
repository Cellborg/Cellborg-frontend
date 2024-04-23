import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MutatingDots } from 'react-loader-spinner';

const DynamicNetworkPlot = dynamic(() => import('../components/plots/NetworkPlot'), {
    ssr: false,
});

const DynamicChordPlot = dynamic(() => import('../components/plots/ChordPlot'), {
    ssr: false,
});

const Heatmap = dynamic(() => import('../components/plots/PathwayHeatmap'), {
    ssr: false,
});

const BarPlot = dynamic(() => import('../components/plots/ContributionBarPlot'), {
    ssr: false,
});

const Test = () => {
    const [tab, setTab] = useState(null);
    const [selectedPlot, setSelectedPlot] = useState(null);
    const [loadPlot, setLoadPlot] = useState(false);

    const pathways = ["ICAM"];
    const handlePathwaySelect = (pathway) => {
        console.log(pathway);
    };

    const handleLoadPlotClick = () => {
        setTab(null);
        if (selectedPlot) {
            setLoadPlot(true);
        }
    };

    const renderPlot = () => {
        if (tab) {
            switch (tab) {
                case 'Net Count':
                    return <DynamicNetworkPlot s3key={'/netvisual_count.json'} />;
                case 'Net Weight':
                    return <DynamicNetworkPlot s3key={'/netvisual_weight.json'} />;
                default:
                    return null;
            }
        } else if (loadPlot) {
            switch (selectedPlot) {
                case 'Circle':
                    return "coming soon...";
                    //return <BarPlot dataUrl={'/pppp.json'} />;
                case 'Chord':
                    return <DynamicChordPlot s3key={'/icam_chord.json'} />;
                case 'Heatmap':
                    return <Heatmap s3key={'/icam_heatmap.json'} />;
                default:
                    return null;
            }
        }
    };

    return (
        <div className='w-full h-screen flex'>
            <div className='w-2/3'>
                <div className='p-4 border-b'>
                    <button
                        className={`border p-3 mr-4 ${tab === 'Net Count' ? 'text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setTab('Net Count')}
                    >
                        Net Count
                    </button>
                    <button
                        className={`border p-3 mr-4 ${tab === 'Net Weight' ? 'text-blue-500' : 'text-gray-500'}`}
                        onClick={() => setTab('Net Weight')}
                    >
                        Net Weight
                    </button>
                </div>
                <div className='ml-5 rounded-lg border border-blue p-1 bg-white' style={{ height: '85vh', width: '65vw', position: 'relative' }}>
                    {renderPlot()}
                </div>
            </div>
            <div className='w-1/4 ml-3 mt-5 p-4'>
                <div className='mb-4 mt-5'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='pathway'>
                        Select Pathway
                    </label>
                    <select
                        className='block w-full bg-white border border-gray-300 rounded py-2 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                        id='pathway'
                        onChange={(e) => handlePathwaySelect(e.target.value)}
                    >
                        {pathways.map(pathway => (
                            <option key={pathway} value={pathway}>{pathway}</option>
                        ))}
                    </select>
                </div>
                <div className='mb-4'>
                    <div className='flex items-center mb-2'>
                        <input type='radio' id='circle' name='plotType' value='Circle' onChange={(e) => setSelectedPlot(e.target.value)} className='mr-2' />
                        <label htmlFor='circle'>Circle</label>
                    </div>
                    <div className='flex items-center mb-2'>
                        <input type='radio' id='chord' name='plotType' value='Chord' onChange={(e) => setSelectedPlot(e.target.value)} className='mr-2' />
                        <label htmlFor='chord'>Chord</label>
                    </div>
                    <div className='flex items-center mb-2'>
                        <input type='radio' id='heatmap' name='plotType' value='Heatmap' onChange={(e) => setSelectedPlot(e.target.value)} className='mr-2' />
                        <label htmlFor='heatmap'>Heatmap</label>
                    </div>
                </div>
                <button
                    className='bg-blue-500 px-4 py-2 rounded border border-black'
                    onClick={handleLoadPlotClick}
                    disabled={!selectedPlot}
                >
                  Load Plot
                </button>
            </div>
        </div>
    );
};

export default Test;
