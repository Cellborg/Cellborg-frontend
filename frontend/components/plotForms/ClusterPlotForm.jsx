import React, {useState} from 'react';
import { useProjectContext } from '../utils/projectContext';
import { loadCPlot } from '../utils/mongoClient.mjs';

export const ClusterPlotForm = ({ setIsDataLoading, setClusterPlotKey, token }) => {

    const [resolutionValue, setResolutionValue] = useState(1);
    const { selectedProject} = useProjectContext();

    function generateClusterPlotKey(resolution) {
        const clusterPlotKey = `${selectedProject.user}/${selectedProject.project_id}/UMAP_CLUSTERING&res=${parseInt(resolution*100)}.json`
        setClusterPlotKey(clusterPlotKey);
        return clusterPlotKey;
    }
    const handleResolutionChange = (event) => {
        setResolutionValue(parseFloat(event.target.value));
    };
    
    async function loadClusterPlot(event) {
        event.preventDefault();
        setIsDataLoading(true) 
        const data = {
            user: selectedProject.user,
            project: selectedProject.project_id,
            resolution: resolutionValue
        }
        const clusterPlotKey = generateClusterPlotKey(resolutionValue);
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
                    <p>Resolution: {resolutionValue}</p>
                    <input
                        type="range"
                        min={0.01}
                        max={2}
                        value={resolutionValue}
                        onChange={handleResolutionChange}
                        step={0.01}
                    />
                </div>
            </div>
            <div className='justify-center'>
                <button type='submit' className='px-8 py-2 border border-blue rounded-lg text-black hover:bg-blue hover:text-white'>Load Cluster Plot</button>
            </div>
        </form>
    </div>
  )
};