import React, {useState} from 'react';
import { useProjectContext } from '../utils/projectContext';
import { loadCPlot } from '../utils/mongoClient.mjs';

export const ClusterPlotForm = ({ setIsDataLoading, setClusterPlotKey, token }) => {

    const [neighborValue, setNeighborValue] = useState(10);
    const [clusterValue, setClusterValue] = useState(0.5);
    const [dimensionValue, setDimensionValue] = useState(10);
    const { selectedProject, analysisId } = useProjectContext();
    const reductionTypes = [
        { label: 'UMAP', value: 'umap' },
        { label: 'TSNE', value: 'tsne' },
        { label: 'PCA', value: 'pca' },
      ];
    const [reduction, setReduction] = useState(reductionTypes[0].value);

    function generateClusterPlotKey(neighbors, clusters, dimensions, reduction) {
        const clusterPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/n=${neighbors}&c=${clusters}&d=${dimensions}&r=${reduction}.json`
        setClusterPlotKey(clusterPlotKey);
        return clusterPlotKey;
    }
    const handleReductionChange = (event) => {
        setReduction(event.target.value);
      };
    const handleNeighborsChange = (event) => {
        setNeighborValue(parseInt(event.target.value));
    };
    const handleClustersChange = (event) => {
        setClusterValue(parseFloat(event.target.value));
    };  
    const handleDimensionsChange = (event) => {
        setDimensionValue(parseInt(event.target.value));
    };
    
    async function loadClusterPlot(event) {
        event.preventDefault();
        setIsDataLoading(true)
        const data = {
            user: selectedProject.user,
            project: selectedProject.project_id,
            analysisId: analysisId,
            neighbors: neighborValue,
            clusters: clusterValue,
            dimensions: dimensionValue,
            reduction: reduction
        }
        const clusterPlotKey = generateClusterPlotKey(neighborValue, clusterValue, dimensionValue, reduction);
        console.log(data);
        console.log(clusterPlotKey, " does not exist... Beginning processing.");

        const loadPlot = async () => {
            const response = await loadCPlot(data, token);
            if (response) {
                setIsDataLoading(false)
                return response;
            };
        }
        loadPlot();
    }

  return (
    <div className='max-w-[1240px] mx-auto text-center py-24 font-onest'>
        <form onSubmit={loadClusterPlot}>
            <div>
                <div className='p-1'>
                    <p>Neighbors: {neighborValue}</p>
                    <input
                        type="range"
                        min={1}
                        max={25}
                        value={neighborValue}
                        onChange={handleNeighborsChange}
                        step={1}
                    />
                </div>
                <div className='p-1'>
                    <p>Clusters: {clusterValue}</p>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        value={clusterValue}
                        onChange={handleClustersChange}
                        step={0.05}
                    />
                </div>
                <div className='p-1'>
                    <p>Dimensions: {dimensionValue}</p>
                    <input
                        type="range"
                        min={1}
                        max={20}
                        value={dimensionValue}
                        onChange={handleDimensionsChange}
                        step={1}
                    />
                </div>
            </div>
            <div className='p-3 mb-5'>
                <label>
                    <select value={reduction} onChange={handleReductionChange}>
                    {reductionTypes.map((reductionType) => (
                        <option 
                            key={reductionType.value} 
                            value={reductionType.value}
                        >
                            {reductionType.label}
                        </option>
                    ))}
                    </select>
                </label>
            </div>
            <div className='justify-center'>
                <button type='submit' className='px-8 py-2 border border-blue rounded-lg text-black hover:bg-blue hover:text-white'>Load Cluster Plot</button>
            </div>
        </form>
    </div>
  )
};