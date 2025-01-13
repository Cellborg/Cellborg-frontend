import React,{ useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import PlotCarousel from '../components/PlotCarousel';
const ViolinPlot = dynamic(()=> import('./../components/plots/ViolinPlot'), {ssr: false});
const VlnPlots = dynamic(()=> import('./../components/plots/VlnPlots'), {ssr: false});
const Test=()=>{
const [viodata, setVioData] = useState(null);
const [vlndata, setVlnData] = useState(null);
const [plots, setPlots] = useState([])
useEffect(() => {
    // Fetch JSON data from the public folder
    fetch('/input.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            setVioData(data); // Save the data in state
             // Log it for debugging
        })
        .catch((error) => {
            console.error('Error loading JSON:', error);
        });
    fetch('/cell_data.json')
        .then((response)=>{
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data)=>{
            setVlnData(data);
            console.log('VLN Data', data)
        })
    setPlots([
        <div key={0} className='flex'>
            <ViolinPlot plotData={viodata} datamap={'pct_counts_mt'} div_id={'pct_counts_mt'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'total_counts'} div_id={'total_counts'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'n_genes'} div_id={'n_genes'} className='w-auto'/>
        </div>
        ]);
}, []);

return(
    <div>
        <div className='flex'>
            <ViolinPlot plotData={viodata} datamap={'pct_counts_mt'} div_id={'pct_counts_mt'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'total_counts'} div_id={'total_counts'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'n_genes'} div_id={'n_genes'} className='w-auto'/>
        </div>
        <div>
            <VlnPlots plotData={vlndata} />
        </div>
    </div>

)};
export default Test;
