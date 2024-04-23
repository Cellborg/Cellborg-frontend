import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GeneNamesList from '../components/GeneNamesList';
import { motion } from 'framer-motion';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import {MutatingDots} from 'react-loader-spinner';
import { loadDotPlot, loadVlnPlots, loadGeneFeaturePlot } from '../components/utils/mongoClient.mjs'
import { getPlotData } from '../components/utils/s3client.mjs';
import { useProjectContext } from '../components/utils/projectContext';
import { DOTPLOT_BUCKET, VLN_PLOTS_BUCKET, genefeatBucket, projectGeneNameBucket } from '../constants';
import SocketComponent from '../components/SocketComponent';
import { NextButton } from '../components/NextButton';
import { getToken } from '../components/utils/security.mjs';
import PagesNavbar from '../components/PagesNavbar';
import Link from 'next/link';
import {BsArrowLeftCircleFill} from 'react-icons/bs';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const ViolinPlot = dynamic(() => import('../components/plots/VlnPlots'), {ssr: false});
const FeaturePlot = dynamic(() => import('../components/plots/FeaturePlot'), {ssr: false});
const DotPlot = dynamic(() => import('../components/plots/DotPlot'), {ssr: false});

const FeaturePlots = ({data: session, token}) => {
    const [loadedPlots, setLoadedPlots] = useState({ 'Violin Plot': false, 'Feature Plot': false, 'Dot Plot': false });

    const [activeTab, setActiveTab] = useState(null);
    const [geneFeature, setGeneFeature] = useState("");
    const [genes, setGenes] = useState([]);
    const [selectedPlotType, setSelectedPlotType] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const {selectedProject, analysisId, clusters} = useProjectContext();
    const [geneNames, setGeneNames] = useState(null);
    const [showForm,setShowForm]=useState(false)

    useEffect(() => {
      const geneNamesKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/geneNames.json`
      getPlotData(projectGeneNameBucket, geneNamesKey)
      .then((data) => {
          setGeneNames(data.geneNames);
      })
      .catch((error) => {
          console.error('Error setting the gene names:', error);
      });
    }, [selectedProject, analysisId]);

    const dotPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/dotplot.json`
    const vlnPlotsKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/vlnplots.json`

    const handleItemSelect = (item) => {
        console.log(`Gene Selected: ${item}`);
        if (!genes.includes(item)) {
            setGenes(prevGenes => [...prevGenes, item]);
        }
    };

    const handleItemRemove = (itemToRemove) => {
        setGenes(prevGenes => prevGenes.filter(item => item !== itemToRemove));
    };
    const getSetterForCurrentPlot = () => {
      switch (selectedPlotType) {
        case "Violin Plot":
          return (value) => setLoadedPlots(prev => ({ ...prev, "Violin Plot": value }));
        case "Feature Plot":
          return (value) => setLoadedPlots(prev => ({ ...prev, "Feature Plot": value }));
        case "Dot Plot":
          return (value) => setLoadedPlots(prev => ({ ...prev, "Dot Plot": value }));
        default:
          return null;
      }
    };
  

  const renderPlot = () => {
    if (!activeTab) {
      return <div>Select genes and a visualization method.</div>
    }
    else if (activeTab && genes.length < 1) { //if user selects a tab, but hasnt selected genes (meaning no plot is being loaded)
        return <div>Select genes from the dropdown to visualize.</div>
    }
    else if (activeTab && genes.length > 0 && !loadedPlots[activeTab]) {
      return (<MutatingDots 
          height="100"
          width="100"
          color="#4ecda4"
          secondaryColor= '#4ecda4'
          radius='12.5'
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{}}
          wrapperClass="h-full flex items-center justify-center"
          visible={true}
        />);
    }

    switch (activeTab) {
        case "Violin Plot":
            return <ViolinPlot plotKey={vlnPlotsKey} bucket={VLN_PLOTS_BUCKET} clusters={clusters} />;
        case "Feature Plot":
            return <FeaturePlot user={selectedProject.user} project={selectedProject.project_id} analysis={analysisId} bucket={genefeatBucket} gene={geneFeature}/>;
        case "Dot Plot":
            return <DotPlot plotKey={dotPlotKey} bucket={DOTPLOT_BUCKET} clusters={clusters} />;
        default:
            return null;
    }
};

    const handleLoadPlot = async() => {
        console.log('Loading', selectedPlotType, 'for:', genes);
        setLoadedPlots(prevState => ({ ...prevState, [selectedPlotType]: false }));
        //setIsLoading(true);
        setActiveTab(selectedPlotType);
        if (selectedPlotType === "Feature Plot" && genes.length === 1) {
            setGeneFeature(genes[0]);
            console.log("Getting feature plot data", genes[0]);
            const data = {
                gene_name: genes[0],
                user: selectedProject.user,
                project: selectedProject.project_id,
                analysisId: analysisId
            }
            try {
                await loadGeneFeaturePlot(data, token);          
            } catch (error) {
                console.error('Error processing the feature plot:', error);
            }
        } else if (selectedPlotType === "Dot Plot") {
            try {
                await loadDotPlot(selectedProject.user, selectedProject.project_id, analysisId, genes, token);          
            } catch (error) {
                console.error('Error processing the dot plot:', error);
            }
        } else if (selectedPlotType === "Violin Plot") {
            try {
                await loadVlnPlots(selectedProject.user, selectedProject.project_id, analysisId, genes, token);          
            } catch (error) {
                console.error('Error processing the violin plots:', error);
            }
        } else {
            console.log("Unknown plot type chosen: ", selectedPlotType);
        }
    };

    return (
      <div className='w-screen h-screen'>
        {showForm&&(
            <BugReportForm page='FEATURE PLOT' token={token} setShowForm={setShowForm}/>
        )}
        <div 
        className='absolute z-50 rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
        onClick={()=>{setShowForm(true)}}
        >
            <GoReport />
        </div>
        <PagesNavbar page="FEATURE"/>
        <SocketComponent user={selectedProject.user} setComplete={getSetterForCurrentPlot()} step={selectedPlotType ? selectedPlotType.replace(' ', '') : ''} />
        <div className='flex flex-row justify-center items-start w-screen h-screen'>
            <div className='w-1/3 ml-3 mt-10 p-3'>
                <div className="flex flex-wrap p-2 mb-3 border border-gray-300 h-16 overflow-auto">
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
                <GeneNamesList items={geneNames} handleItemSelect={handleItemSelect} />
                <div className="flex mt-20 py-20 mb-10 p-3 space-x-4">
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
                <Link href='/AnalysisOptions' className='my-5 rounded-lg w-1/2 p-2 flex items-center bg-blue text-white hover:bg-cyan hover:text-blue'><BsArrowLeftCircleFill className='mr-1 text-blue bg-white rounded-full'/> Back to Analysis Options</Link>
            </div>
            <div className="flex flex-col w-2/3 mt-10 p-3 mr-20">
                <div className="relative w-full h-screen mb-5">
                    <motion.div className="absolute w-full h-2/3 bg-white border border-blue rounded-md">
                        {renderPlot()}
                    </motion.div>
                    <motion.div
                        className="absolute left-0 right-0 flex space-x-4 p-4 bg-white mt-5 border border-blue rounded-md"
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
                            onClick={() => {setActiveTab('Feature Plot')}}
                        >
                            Feature Plot
                        </button>
                        <button
                            className="flex-1 py-2 text-lg font-bold text-center bg-cyan hover:bg-cyan/60"
                            onClick={() => {setActiveTab('Violin Plot')}}
                        >
                            Violin Plot
                        </button>
                        <button
                            className="flex-1 py-2 text-lg font-bold text-center bg-cyan hover:bg-cyan/60"
                            onClick={() => {setActiveTab('Dot Plot')}}
                        >
                            Dot Plot
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
      </div>
    );
};
export async function getServerSideProps(context) {
    const token = await getToken(context);
    const session = await getSession(context);
    if (!token || !session) {
      return {
        redirect: {
          destination: '/Login',
          permanent: false,
        },
      };
    }
      return {
        props: { 
          data: session,
          token,
        }
      }
  };
export default FeaturePlots;