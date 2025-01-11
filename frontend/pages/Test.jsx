import React,{ useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
const ViolinPlot = dynamic(()=> import('./../components/plots/ViolinPlot'), {ssr: false});
const VlnPlots = dynamic(()=> import('./../components/plots/VlnPlots'), {ssr: false});
const Test=()=>{
const [viodata, setVioData] = useState(null);
const [vlndata, setVlnData] = useState(null);

const [pct_count, setPctCount] = useState(null);
const[ngenes, setNGenes] = useState(null);
const [total_counts, setTotalCounts] = useState(null);
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
            setPctCount(Object.values(data).map(d => d.pct_counts_mt).sort((a, b) => a - b));
            setNGenes(Object.values(data).map(d => d.n_genes).sort((a, b) => a - b));
            setTotalCounts(Object.values(data).map(d => d.total_counts).sort((a, b) => a - b));
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
            <ViolinPlot vio_data = {pct_count} datamap={'pct_counts_mt'} div_id={'pct_counts_mt'}/>
            <ViolinPlot vio_data = {total_counts} datamap={'total_counts'} div_id={'total_counts'}/>
            <ViolinPlot vio_data = {ngenes} datamap={'n_genes'} div_id={'n_genes'}/>
        </div>
        <div>
            <VlnPlots plotData={vlndata} />
        </div>
    </div>

)};
export default Test;
