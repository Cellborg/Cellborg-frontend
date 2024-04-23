import React, {useState, useEffect} from 'react'
import dynamic from 'next/dynamic';
import { getPlotData } from './utils/s3client.mjs';
import { MutatingDots } from 'react-loader-spinner';
import {datasetqcBucket} from '../constants.js';
const DynamicDoubletPlot = dynamic(() => import('./plots/DoubletPlot.jsx'), {
    ssr: false, 
});

const Doublets = ({user, project, dataset}) => {
    const [data, setData] = useState(null);
    const [isDataLoading,setIsDataLoading]=useState(false)
    function generateDoubletsPlotKey() {
        const doubletPlotKey = `${user}/${project}/${dataset}/plots/doubletplot.json`;
        return doubletPlotKey;
    }
    useEffect(() => {
        setIsDataLoading(true);
        const doubletPlotKey = `${user}/${project}/${dataset}/plots/doubletplot.json`;
        getPlotData(datasetqcBucket, doubletPlotKey)
        .then((plotData) => {
            setIsDataLoading(false);
            setData(plotData);
        })
        .catch((error) => {
            console.error('Error setting the doublet plot:', error);
        });
    }, [user, project, dataset]);

    async function loadDoubletPlot() {
        setIsDataLoading(true);
        const doubletPlotKey = generateDoubletsPlotKey();
        console.log("doubletPlotKey: ", doubletPlotKey);
        getPlotData(datasetqcBucket, doubletPlotKey)
        .then((plotData) => {
            setIsDataLoading(false);
            setData(plotData);
        })
        .catch((error) => {
            console.error('Error setting the QC plot:', error);
        });      
    }

  return (
    <>
        <div>Doublets</div>
        <div className='p-4 bg-slate-200 flex justify-center items-center' style={{height:'85vh', width:'100vw',position:'relative'}}>
            {
            isDataLoading?
                <MutatingDots 
                    height="100"
                    width="100"
                    color="#4ecda4"
                    secondaryColor= '#4ecda4'
                    radius='12.5'
                    ariaLabel="mutating-dots-loading"
                    wrapperStyle={{}}
                    wrapperClass="h-full flex items-center justify-center"
                    visible={true}
                />
                :
                <DynamicDoubletPlot data={data} />
            }
        </div>
        <div className='justify-center w-full h-1/8'>
            <button onClick={loadDoubletPlot} className='px-8 py-2 w-full h-50'>Load Doublet Plot</button>
        </div>
    </>
  )
};

export default Doublets;