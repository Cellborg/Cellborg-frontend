import React,{ useEffect, useState} from 'react';
import dynamic from 'next/dynamic';

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
        
}, []);
/**
 * Since this is a testing environment you cant select which genes you want because we are reading a static 
 * json file (means you cant change it since we would have to query a new adata obj to 
 * generate a new one). I just used the one we went over on call so it
 * is going to be those 4 genes
 */
const plotKey = '_cdanK3oQfctEqYKKYTQ_/4gYjQnv7kWhusWiPjMBol/gene_expression.json'
const datasetqcBucket = 'cellborg-beta-qcdataset-bucket'

//hence why this is empty and has no bearing on the chart
const genes=[];

return(
    <div>
        <div className='flex'>
            <ViolinPlot plotData={viodata} datamap={'pct_counts_mt'} div_id={'pct_counts_mt'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'total_counts'} div_id={'total_counts'} className='w-auto'/>
            <ViolinPlot plotData={viodata} datamap={'n_genes'} div_id={'n_genes'} className='w-auto'/>
        </div>
        <div>
            <VlnPlots plotKey={plotKey} bucket={datasetqcBucket} genes={genes} />
        </div>
    </div>

)};
export default Test;
