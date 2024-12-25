import React,{ useEffect, useState, useRef} from 'react';
import processViolin from '../utils/processViolin';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import highchartsMore from 'highcharts/highcharts-more';
if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts);
  highchartsMore(Highcharts);
}

const ViolinPlot = ({plotData}) => {
  const [chartOptions, setChartOptions]=useState(null);
  const minMax = useRef({min:0, max:10000});

  useEffect(()=>{
    if(plotData){
      // Extract pct_counts_mt values
      let pctCountsMt = Object.values(plotData).map(d => d.pct_counts_mt).sort((a, b) => a - b);
  
      // Default min and max
      minMax.min = Math.min(...pctCountsMt);
      minMax.max = Math.max(...pctCountsMt);
  
      // Function to create the violin data
      const step = 1;
      const precision = 0.00001;
      const width = 3;
      const violinData = processViolin(step, precision, width, pctCountsMt);
      console.log("Hrlo");
      console.log(violinData.results[0]);
  
      // Function to update chart with highlighted data
  
      function updateChart(min, max) {
        const dummy = violinData.results[0];
        console.log(dummy)
        chart.series[0].setData(dummy.filter(inner => inner[0] <= max), true); // Highlighted Range
      }

      setChartOptions({
        chart: {
            type: 'areasplinerange',
            inverted: true,
            events: {
                click: function (event) {
                    // Map the click x-coordinate to the data range
                    const clickedValue = Math.round(event.xAxis[0].value); // Get x value of the click
                    console.log(clickedValue);
                    minMax.max = clickedValue; // Set maxValue to clicked percentage
                    updateChart(parseFloat(0), minMax.max); // Update the chart
                }
            }
        },
        title: { text: '% Mitochondrial Reads (Interactive Violin Plot)' },
        xAxis: {
            reversed:false,
            title: { text: 'Value (%)' },
            min: minMax.min,
            max: minMax.max
        },
        yAxis: {
            title: { text: 'Density' },
            categories: ["% Counts"],
            startOnTick: false,
            endOnTick: false
        },
        series: [
            {
                name: 'Highlighted Range',
                color: 'rgba(255, 165, 0, 0.9)', // Highlighted range color
                data: violinData.results[0]
            },
            {
                name: 'Full Violin',
                color: 'rgba(200, 200, 200, 0.5)', // Gray background color
                data: violinData.results[0],
                enableMouseTracking: false,
                zIndex: -1
            }
        ]
      });
    }}, [plotData, minMax]);

  return (
    <div className="flex bg-slate-100 justify-center w-full h-full">
      <div className="h-full w-1/3 justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white overflow-auto"> 
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={chartOptions}
      />
        <div className='flex justify-center '>
          <label>Min: </label>
          <input
          type='number'
          className='mr-2'
          onChange={(e) => (minMax.min = parseFloat(e.target.value).toFixed(2))}
          />

          <label>Max: </label>
          <input
          type='number'
          className='mr-2'
          onChange={(e) => (minMax.max = parseFloat(e.target.value).toFixed(2))}
          />
        </div>
      </div>

      {/* <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={optionsTotalCounts}
      />
      </div>
      <div className="h-full w-1/3 flex justify-center items-center border-4 rounded-sm p-4 mx-2 bg-white  overflow-auto">
      <HighchartsReact className = "w-full h-full flex items-center justify-center"
        highcharts={Highcharts}
        options={optionsPCTCounts}
      />
      </div> */}
    </div>
  );
};

export default ViolinPlot;
