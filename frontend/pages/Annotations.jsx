import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GeneNamesList from '../components/GeneNamesList';
import { motion } from 'framer-motion';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import {MutatingDots} from 'react-loader-spinner';
import { loadDotPlot, loadVlnPlots, annotateClusters, loadGeneFeaturePlot, conductGeneExpression } from '../components/utils/mongoClient.mjs'
import { getPlotData } from '../components/utils/s3client.mjs';
import { useProjectContext } from '../components/utils/projectContext';
import { datasetclusterBucket, DOTPLOT_BUCKET, VLN_PLOTS_BUCKET, genefeatBucket, projectGeneNameBucket, datasetqcBucket } from '../constants';
import SocketComponent from '../components/SocketComponent';
import { NextButton } from '../components/NextButton';
import { getToken } from '../components/utils/security.mjs';
import PagesNavbar from '../components/PagesNavbar';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';
import { socketio } from '../constants';
import io from 'socket.io-client';

const ClusteringPlot = dynamic(() => import('../components/plots/ScatterPlot'), {ssr: false});
const ViolinPlot = dynamic(() => import('../components/plots/VlnPlots'), {ssr: false});
const FeaturePlot = dynamic(() => import('../components/plots/FeaturePlot'), {ssr: false});
const DotPlot = dynamic(() => import('../components/plots/DotPlot'), {ssr: false});

const AnnotationInput = React.memo(({ index, value, onChange }) => {
    return (
        <div className="mb-2">
            <label className="px-5">{`Cluster ${index}:`}</label>
            <input 
                type="text" 
                className="border border-gray-300 p-2 flex-grow" 
                placeholder={`Cluster ${index}`} 
                value={value}
                onChange={e => onChange(index, e.target.value)}
            />
        </div>
    );
});

const Annotations = ({data: session, token, resolution}) => {
    const [activeTab, setActiveTab] = useState('cluster');
    const [geneFeature, setGeneFeature] = useState("");
    const [genes, setGenes] = useState([]);
    const [selectedPlotType, setSelectedPlotType] = useState(null);
    const [loadedPlot, setLoadedPlot] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [annotationsLoaded, setAnnotationsLoaded] = useState(true);
    const {selectedProject, analysisId, clusters, setClusters, geneList, setGeneList} = useProjectContext();
    const [geneNames, setGeneNames] = useState(null);
    const [ready, setReady] = useState(false);
    const [annotations, setAnnotations] = useState(clusters);
    const [showForm,setShowForm]=useState(false);

    /**
     * Already pull gene names on adata init during loading
     */
    /*useEffect(() => {
        const geneNamesKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/geneNames.json`
        getPlotData(projectGeneNameBucket, geneNamesKey)
        .then((data) => {
            setGeneNames(data.geneNames);
        })
        .catch((error) => {
            console.error('Error setting the gene names:', error);
        });
      }, [selectedProject, analysisId]);*/

    /**
     * Listen for gene expression finishing so frontend can pull data from s3
     */
    useEffect(()=>{
    const socket = io(socketio);
    socket.emit('RegisterConnection', selectedProject.user);

    socket.on('PA_Gene_Expression_Complete', async (data)=>{
        const {user, project, stage} = data;
        console.log('gene expression has finished and sns reached frontend');
        setReady(true);
    })
    }, [])

    const clusterPlotKey = `${selectedProject.user}/${selectedProject.project_id}/UMAP_CLUSTERING&res=${resolution}.json`
    const dotPlotKey = `${selectedProject.user}/${selectedProject.project_id}/gene_expression.json`
    const featurePlotkey = `${selectedProject.user}/${selectedProject.project_id}/gene_expression.json`
    const vlnPlotsKey = `${selectedProject.user}/${selectedProject.project_id}/vlnplots.json`

    const handleSaveAnnotations = async() => {
        console.log("Annotations: ", annotations);

        // Ensure no empty annotations. If empty, set back to its index.
        const correctedAnnotations = Object.keys(annotations).reduce((acc, key) => {
            acc[key] = annotations[key] || key;
            return acc;
        }, {});
    
        console.log("Saving annotations: ", correctedAnnotations);
        setAnnotationsLoaded(false);
        try {
            const res = await annotateClusters(
                selectedProject.user, 
                selectedProject.project_id, 
                correctedAnnotations, 
                token
            );
            setClusters(correctedAnnotations);
    
        } catch (error) {
            console.log("error annotating the clusters:" , error);
            setAnnotationsLoaded(true); //to stop the animation from continuing if error
        }
    }

    const handleAnnotationChange = useCallback((index, value) => {
        setAnnotations(prevAnnotations => ({ ...prevAnnotations, [index]: value }));
    }, []);

    const annotationInputs = useMemo(() => {
        return Object.keys(annotations).map(index => (
            <AnnotationInput 
                key={index} 
                index={index} 
                value={annotations[index] || ''} 
                onChange={handleAnnotationChange}
            />
        ));
    }, [annotations, handleAnnotationChange]);
    

    const handleItemSelect = (item) => {
        console.log(`Gene Selected: ${item}`);
        if (!genes.includes(item)) {
            setGenes(prevGenes => [...prevGenes, item]);
        }
    };

    const handleItemRemove = (itemToRemove) => {
        setGenes(prevGenes => prevGenes.filter(item => item !== itemToRemove));
    };
    const handleLoadPlot = async() => {
        console.log('Loading', selectedPlotType, 'for:', genes);
        setLoadedPlot(selectedPlotType);
        //setIsLoading(true);
        setActiveTab('other'); 
        setReady(false);

        //make request to gene expression here or below
        const data={
            user: selectedProject.user, 
            project: selectedProject.project_id,
            gene_list: genes
        }
        console.log("about to make request to gene expression");
        const response = await conductGeneExpression(data, token);
        console.log('Made request here is the response', response);


        /*if (selectedPlotType === "Feature Plot" && genes.length === 1) {
            setGeneFeature(genes[0]);
            console.log("Getting feature plot data", genes[0]);
            const data = {
                gene_name: genes[0],
                user: selectedProject.user,
                project: selectedProject.project_id,
            }
            try {
                await loadGeneFeaturePlot(data, token);          
            } catch (error) {
                console.error('Error processing the feature plot:', error);
            }
        } else if (selectedPlotType === "Dot Plot") {
            try {
                await loadDotPlot(selectedProject.user, selectedProject.project_id, genes, token);          
            } catch (error) {
                console.error('Error processing the dot plot:', error);
            }
        } else if (selectedPlotType === "Violin Plot") {
            try {
                await loadVlnPlots(selectedProject.user, selectedProject.project_id, genes, token);          
            } catch (error) {
                console.error('Error processing the violin plots:', error);
            }
        } else {
            console.log("Unknown plot type chosen: ", selectedPlotType);
        }*/
    };

    return (
    <div className='w-screen h-screen'>
        {showForm&&(
            <BugReportForm page='ANNOTATIONS' token={token} setShowForm={setShowForm}/>
        )}
        <div 
        className='absolute z-50 rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
        onClick={()=>{setShowForm(true)}}
        >
            <GoReport />
        </div>
        <PagesNavbar page={"ANNOTATIONS"}/>
        {/* <SocketComponent user={selectedProject.user} setComplete={setReady} step={selectedPlotType ? selectedPlotType.replace(' ', '') : ''} /> */}
        <div className='flex flex-row justify-center mt-10'>
            <div className='w-1/3 ml-3 p-3'>
                <div className="flex flex-wrap p-2 mb-5 border border-gray-300 h-16 overflow-auto">
                    {genes.map(gene => (
                        <div className="flex items-center m-2 p-2 border border-gray-300 rounded" key={gene}>
                            {gene}
                            <button 
                                className="ml-2 text-sm text-red-500" 
                                onClick={() => handleItemRemove(gene)}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
                <GeneNamesList items={geneList} handleItemSelect={handleItemSelect} className='w-full'/>
                <div className="flex mt-10 mb-10 p-3 ml-3 space-x-4 z-0">
                    <label className="flex items-center cursor-pointer" title={genes.length !== 1 ? 'Select one gene for a Feature Plot' : ''}>
                        <input type="radio" name="plotType" value="Feature Plot" disabled={genes.length === 0 || genes.length > 1} className="form-radio text-blue-500" onChange={() => setSelectedPlotType('Feature Plot')}/>
                        <span className="ml-2">Feature Plot</span>
                    </label>
                    <label className="flex items-center cursor-pointer" title={genes.length === 0 ? 'Select at least one gene for a Violin Plot' : ''}>
                        <input type="radio" name="plotType" value="Violin Plot" disabled={genes.length === 0} className="form-radio text-blue-500" onChange={() => setSelectedPlotType('Violin Plot')}/>
                        <span className="ml-2">Violin Plot</span>
                    </label>
                    <label className="flex items-center cursor-pointer" title={genes.length === 0 ? 'Select at least one gene for a Dot Plot' : ''}>
                        <input type="radio" name="plotType" value="Dot Plot" disabled={genes.length === 0} className="form-radio text-blue-500" onChange={() => setSelectedPlotType('Dot Plot')}/>
                        <span className="ml-2">Dot Plot</span>
                    </label>
                    <button
                        className={`${
                            (selectedPlotType && selectedPlotType!== "Feature Plot" && genes.length > 0) || (selectedPlotType==="Feature Plot" && genes.length === 1)
                                ? 'bg-cyan hover:bg-cyan/70'
                                : 'bg-blue hover:bg-blue/70 cursor-not-allowed'
                        } text-white px-5 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 transition ease-in-out duration-150`}
                        onClick={handleLoadPlot}
                        disabled={!selectedPlotType || genes.length === 0}
                    >
                        Load Plot
                    </button>
                </div>
                <h2>Annotate Clusters</h2>
                <div className="mt-4 p-4 border border-gray-300 h-64 overflow-auto">
                    {annotationInputs}
                </div>
                <div className='flex items-center mt-4 space-x-10 '>
                    <button className=" p-2 bg-cyan text-black rounded hover:bg-green-600" onClick={handleSaveAnnotations}>Save</button>
                    <div className={`w-1/2 text-white`}>
                        <NextButton path={`/AnalysisOptions`} complete={true}/>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-2/3 p-3 mr-20">
                <div className="relative w-full h-screen mb-5">
                    <motion.div className="absolute w-full h-2/3 bg-white rounded-md p-2 border border-blue">
                        {
                            isLoading ?
                                <MutatingDots 
                                    height="100"
                                    width="100"
                                    color="#4ecda4"
                                    secondaryColor= '#4ecda4'
                                    radius='12.5'
                                    ariaLabel="mutating-dots-loading"
                                    wrapperStyle={{}}
                                    wrapperClass="h-full flex items-center justify-center"
                                    visible={true}
                                /> :
                            activeTab === "cluster" ? <ClusteringPlot plotKey={clusterPlotKey} bucket={datasetqcBucket} /> :
                            loadedPlot && activeTab === "other" ? loadedPlot === "Feature Plot" && ready ? <FeaturePlot bucket={datasetqcBucket} plotKey={featurePlotkey} gene={genes[0]}/> :
                            loadedPlot === "Violin Plot" && ready ? <ViolinPlot plotKey={vlnPlotsKey} bucket={VLN_PLOTS_BUCKET} clusters={clusters} /> :
                            loadedPlot === "Dot Plot" && ready ? <DotPlot plotKey={dotPlotKey} bucket={datasetqcBucket}/> : null : null
                        }
                    </motion.div>
                    <motion.div
                        className="absolute left-0 right-0 flex space-x-4 p-4  mt-5 border border-blue rounded-md bg-gray-100"
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: '0' }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        style={{
                            zIndex: 10,
                            top: '66.6667%',
                        }}
                    >
                        <button
                            className="flex-1 py-2 text-lg font-bold text-center bg-cyan hover:bg-cyan/60"
                            onClick={() => {setActiveTab('cluster')}}
                        >
                            Cluster
                        </button>
                        <button
                            className="flex-1 py-2 text-lg font-bold text-center bg-cyan hover:bg-cyan/60"
                            onClick={() => {setActiveTab('other')}}
                        >
                            {loadedPlot || '-Choose Plot-'}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    </div>
    );
};
export async function getServerSideProps(context) {
    // Get the user's JWT access token from next's server-side cookie
    const token = await getToken(context);
    const resolution = parseInt(context.query.res, 10);//parse as radix
    console.log(resolution);
    if (!token) {
      return {
        redirect: {
          destination: '/Login',
          permanent: false,
        },
      };
    }
      return {
        props: { 
          token,
          resolution
        }
      }
  };
export default Annotations;