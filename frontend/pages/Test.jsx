import React,{ useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
const ViolinPlot = dynamic(()=> import('./../components/plots/ViolinPlot'), {ssr: false});
const VlnPlots = dynamic(()=> import('./../components/plots/VlnPlots'), {ssr: false});
const Test=()=>{
const [viodata, setVioData] = useState(null);
const [vlndata, setVlnData] = useState(null);

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
}, []);

return(
    <div>
        <div className="flex items-center">
            <ViolinPlot plotData = {viodata} datamap={'pct_counts_mt'} div_id={'pct_counts_mt'}/>
            <ViolinPlot plotData = {viodata} datamap={'total_counts'} div_id={'total_counts'}/>
            <ViolinPlot plotData = {viodata} datamap={'n_genes'} div_id={'n_genes'}/>
        </div>
        <div>
            <VlnPlots plotData={vlndata} />
        </div>
    </div>

)};
export default Test;
