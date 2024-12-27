import React,{ useEffect, useState, useRef} from 'react';
import HighchartsReact from "highcharts-react-official";
import Highcharts from 'highcharts';
import ViolinPlot from './../components/plots/ViolinPlot';

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
    <ViolinPlot plotData = {data}/>
)};
export default Test;
