import React,{ useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
const ViolinPlot = dynamic(()=> import('./../components/plots/ViolinPlot'), {ssr: false});
const Test=()=>{
const [data, setData] = useState(null);
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
            setData(data); // Save the data in state
            console.log('JSON Data:', data); // Log it for debugging
        })
        .catch((error) => {
            console.error('Error loading JSON:', error);
        });
}, []);

return(
    <div className="flex items-center">
        <ViolinPlot plotData = {data} datamap={'pct_counts_mt'}/>
        <ViolinPlot plotData = {data} datamap={'total_counts'}/>
        <ViolinPlot plotData = {data} datamap={'n_genes'}/>
    </div>
)};
export default Test;
