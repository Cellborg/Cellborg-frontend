import Plot from 'react-plotly.js';
import { getPlotData } from '../utils/s3client.mjs';
import { useState, useEffect } from 'react';

const VlnPlots = ({plotKey, bucket, clusters}) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        console.log('Key:', plotKey);
        console.log('Bucket:', bucket);
        const fetchPlotData = async () => {
          try {
            const data = await getPlotData(bucket, plotKey);
            setData(data);
          } catch (err) {
            console.log(`Error fetching plot data: ${err}`);
          }
        };
        if (plotKey && bucket) {
          fetchPlotData();
        }
      }, [plotKey, bucket]);

    if(data) {
        const geneNames = Object.keys(data[0]).filter(key => key !== 'barcode' && key !== 'cluster_id' && key !== '_row');
        const uniqueClusterIds = [...new Set(data.map(item => item.cluster_id))].sort();
        return (
            <div style={{width: '100%', height: '100%', overflow: 'scroll' }}>
                {geneNames.map(gene => (
                    <Plot
                        className='w-full h-full'
                        key={gene}
                        data={[
                        {
                            type: 'violin',
                            y: data.map(item => item[gene]),
                            x: data.map(item => clusters[item.cluster_id] || item.cluster_id), // Use cluster names
                            box: { visible: true },
                            line: { color: 'green' },
                            name: gene,
                            points: 'all',
                            pointpos: 0,
                            jitter: 0.4,
                            scalemode: 'count',
                            width: 2,
                            marker: {size: 4}
                        }
                        ]}
                        layout={{
                          title: `Expression levels of ${gene}`,
                          xaxis: {
                              showgrid: false,
                              title: "Identity",
                              type: 'category',
                              categoryarray: uniqueClusterIds.map(id => clusters[id] || id)
                          },
                          yaxis: {showgrid: false, title: "Expression Level", range: [0, 'auto'], zeroline: false}
                      }}
                      
                    />
                ))}
            </div>
        )
    } else {
        return (<div>Setting Plot Data</div>)
    }
}

export default VlnPlots;
