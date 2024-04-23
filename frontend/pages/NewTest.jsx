import React from 'react';
import dynamic from 'next/dynamic';
  
const BarPlot = dynamic(() => import('../components/plots/ContributionBarPlot'), {
    ssr: false,
});
const Heatmap = dynamic(() => import('../components/plots/SignalingHeatmap'), {
    ssr: false,
});
const Test = () => {

    return (
        <div className='w-full h-screen mt-20 ml-20'>
            <BarPlot dataUrl={'/pppp.json'} />
            <Heatmap s3key={'/signal_heatmap.json'} />

        </div>
    );
};

export default Test;
