import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getPlotData } from '../utils/s3client.mjs';

const VlnRow = dynamic(()=> import('./VlnRow'), {ssr: false});
const VlnPlots = ({ plotKey, bucket, genes }) => {
  const [genesExp, setGeneExp] = useState({});
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    console.log('Key:', plotKey);
    console.log('Bucket:', bucket);
    const fetchPlotData = async () => {
      try {
        const data = await getPlotData(bucket, plotKey);
        setPlotData(data);
      } catch (err) {
        setError(`Error fetching plot data: ${err}`);
      }
    };
    if (plotKey && bucket) {
      fetchPlotData();
    }
  }, [bucket, plotKey, genes]);//want it to change whenever the gene passed in changes since bucket and key won't

  useEffect(() => {
    if (typeof plotData !== 'object' || plotData === null) {
      console.error('plotData is not an object:', plotData);
      return;
    }

    let geneExp = {};
    // Process plotData to clusters by gene
    Object.entries(plotData).forEach(([key, value]) => {
      let cluster = value.cluster;
      Object.keys(value).forEach((gene) => {
      if (gene !== 'UMAP1' && gene !== 'UMAP2' && gene !== 'cluster') {
        if (!geneExp[gene]) {
        geneExp[gene] = {};
        }
        if(!geneExp[gene][cluster]) {
          geneExp[gene][cluster] = [];
        }
        geneExp[gene][cluster].push(value[gene]);
      }

      });
    });

    console.log('GENE HERE', geneExp);

    /**
     * geneExp is not a dict of genes with
     * clusters as keys and expression of gene is that clusters as a list
     */
    setGeneExp(geneExp);


  }, [plotData]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>
      <div className='grid grid-cols-1'>
        {Object.entries(genesExp).map(([geneName, geneDict]) =>
          <div key={`${geneName}`}>
            <VlnRow row_data={geneDict} datamap={`${geneName}`} div_id={`${geneName}`}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default VlnPlots;
