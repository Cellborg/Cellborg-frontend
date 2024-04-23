import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const DemoGeneFeaturePlot = ({ gene }) => {
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        const data = await fetch(`/${gene}_featurePlot.json`);
        const jsonData = await data.json();
        console.log(jsonData)
        setPlotData(jsonData);
      } catch (err) {
        console.log(`Error fetching plot data: ${err}`);
      }
    };
      fetchPlotData();
  }, [gene]);

  const selectedGene = gene ? gene.toString() : "";
  let trace1;
  if(plotData) {
    const customColorScale = [
        [0, `rgba(128, 128, 128, 0.5)`],    // Expression level 0 mapped to gray
        [1, 'blue'],    // Expression level 1 mapped to blue
    ];    
    
      const expressionValues = plotData.map(data => data[selectedGene] || 0);
      const minExpression = Math.min(...expressionValues);
      const maxExpression = Math.max(...expressionValues);
      
      const normalizedColorValues = expressionValues.map(value =>
        (value - minExpression) / (maxExpression - minExpression)
      );  
    
      trace1 = {
          x: plotData.map(data => data.tSNE_1 || data.PCA_1 || data.UMAP_1),
          y: plotData.map(data => data.tSNE_2 || data.PCA_2 || data.UMAP_2),
          mode: 'markers',
          type: 'scatter',
          marker: {
            size: 2,
            color: normalizedColorValues, 
            colorscale: customColorScale, 
            colorbar: {
              title: 'Expression Level'
            }
          },
          text: plotData.map(data => data._row),
          hovertemplate: `<b>${selectedGene}</b><br>Expression Level: %{marker.color:.2f}`,
      };
    
  }

  return (
    <div className='w-full'>
            <Plot
              data={[trace1]}
              layout={{
                  title: selectedGene,
                  xaxis: {showgrid: false, zeroline: false, showticklabels: false},
                  yaxis: {showgrid: false, zeroline: false, showticklabels: false}
                }}

              config={{displaylogo: false}}
              responsive={true}

            />
    </div>
  );
};

export default DemoGeneFeaturePlot;
