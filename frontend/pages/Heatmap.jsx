import React, { useState } from 'react';
import PagesNavbar from '../components/PagesNavbar';
import SocketComponent from '../components/SocketComponent';
import { useProjectContext } from '../components/utils/projectContext';
import dynamic from 'next/dynamic';
import {MutatingDots} from 'react-loader-spinner';
import { heatmapanalysis, findAllMarkersAnalysis, findMarkersAnalysis } from '../components/utils/mongoClient.mjs';
import {heatmapBucket} from '../constants.js';
import Link from 'next/link';
import {BsArrowLeftCircleFill} from 'react-icons/bs';
import { getToken } from '../components/utils/security.mjs';
import { getSession } from 'next-auth/react';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const DynamicHeatmapPlot = dynamic(() => import('../components/plots/Heatmap'), {
  ssr: false,
});
const CSVTable = dynamic(() => import('../components/CSVTable'), {
  ssr: false,
});

const Heatmap = ({data: session, token}) => {
  const [inputValue, setInputValue] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const {selectedProject, analysisId, clusters} = useProjectContext();
  console.log(clusters,'CLUSTER HERE')
  const [selectedCluster1, setSelectedCluster1] = useState('0');
  const [selectedCluster2, setSelectedCluster2] = useState('1');
  const [analysisOption, setAnalysisOption] = useState('Heatmap');
  const heatmapPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/heatmap_data.bin`
  const allMarkersKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/allMarkersData.csv`
  const findMarkersKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/findMarkersData.csv`
  const [showForm,setShowForm]=useState(false);

  const [loadedHeatmaps, setLoadedHeatmaps] = useState({
    'Heatmap': false,
    'allMarkers': false,
    'findMarkers': false
  });

  const getSetterForCurrentAnalysis = () => {
    switch (analysisOption) {
      case "Heatmap":
        return (value) => setLoadedHeatmaps(prev => ({ ...prev, "Heatmap": value }));
      case "allMarkers":
        return (value) => setLoadedHeatmaps(prev => ({ ...prev, "allMarkers": value }));
      case "findMarkers":
        return (value) => setLoadedHeatmaps(prev => ({ ...prev, "findMarkers": value }));
      default:
        return null;
    }
  };
  const setHeatmapLoaded = (value) => {
    setLoadedHeatmaps(prevState => ({
        ...prevState,
        'Heatmap': value
    }));
  };
  const setAllMarkersLoaded = (value) => {
    setLoadedHeatmaps(prevState => ({
        ...prevState,
        'allMarkers': value
    }));
  };
  const setFindMarkersLoaded = (value) => {
    setLoadedHeatmaps(prevState => ({
        ...prevState,
        'findMarkers': value
    }));
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsButtonDisabled(value.trim().length === 0);
  };

  const handleFindAllMarkers = async() => {
    console.log("Finding all markers and loading csv table...");
    setAllMarkersLoaded(false);
    try {
      const res = await findAllMarkersAnalysis(selectedProject.user, selectedProject.project_id, analysisId, token);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFindMarkers = async() => {
    console.log("Finding markers and loading csv table...");
    setFindMarkersLoaded(false);
    try {
      const res = await findMarkersAnalysis(selectedProject.user, selectedProject.project_id, analysisId, selectedCluster1, selectedCluster2, token);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLoadHeatmap = async() => {
    setHeatmapLoaded(false);
    const geneList = inputValue.replace(/['"]+/g, '').split(/[\s,]+/).map(str => str.trim());
    const filteredGeneList = geneList.filter(gene => gene.length > 0);
    console.log(`Loading heatmap for: ${JSON.stringify(filteredGeneList)}`);
    try {
      const res = await heatmapanalysis(selectedProject.user, selectedProject.project_id, analysisId, JSON.stringify(filteredGeneList), token);
      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log("error performing heatmap analysis: ", error);
    }
  };
  
  const renderPlot = () => {
    if (!analysisOption) {
      return <div>Choose to find markers first or generate heatmap directly.</div>
    } else if (analysisOption === "Heatmap" && inputValue.length < 1) {
      return <div>Enter gene names in the input box to generate a heatmap.</div>
    }
    else if (analysisOption === "Heatmap" && inputValue.length > 0 && !loadedHeatmaps[analysisOption] ||
            analysisOption === "allMarkers" && !loadedHeatmaps[analysisOption] ||
            analysisOption === "findMarkers" && !loadedHeatmaps[analysisOption]) {
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

    switch (analysisOption) {
      case "Heatmap":
        return <DynamicHeatmapPlot plotKey={heatmapPlotKey} bucket={heatmapBucket} clusters={clusters}/>;
      case "allMarkers":
        return <CSVTable 
          s3key={allMarkersKey} 
          user={selectedProject.user} 
          projectName={selectedProject.project_id} 
          analysisId={analysisId} 
          authtoken={token} 
          setHeatmapLoaded={setHeatmapLoaded}
          setAnalysisOption={setAnalysisOption}
          setGeneNames={setInputValue}
          />;
      case "findMarkers":
        return <CSVTable 
          s3key={findMarkersKey} 
          user={selectedProject.user} 
          projectName={selectedProject.project_id} 
          analysisId={analysisId} 
          authtoken={token} 
          setHeatmapLoaded={setHeatmapLoaded}
          setAnalysisOption={setAnalysisOption}
          setGeneNames={setInputValue}
        />
      default:
        return null;
    }
};

  return (
    <>
    {showForm&&(
        <BugReportForm page='HEATMAP' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
    <PagesNavbar page={"HEATMAP ANALYSIS"}/> 
    <SocketComponent
      step={analysisOption ? analysisOption : ''}
      setComplete={getSetterForCurrentAnalysis()}
      user={selectedProject.user}
      />
    <div className="flex items-center h-screen p-6">
      {/* Left side with input box and button */}
      <div className="w-1/3 p-4">
        <div>
          <label>
            <input
              type="radio"
              value="heatmap"
              checked={analysisOption === 'Heatmap'}
              onChange={() => setAnalysisOption('Heatmap')}
            />
            Enter Gene Features for Heatmap
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="allMarkers"
              checked={analysisOption === 'allMarkers'}
              onChange={() => setAnalysisOption('allMarkers')}
            />
            Find All Markers
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="findMarkers"
              checked={analysisOption === 'findMarkers'}
              onChange={() => setAnalysisOption('findMarkers')}
            />
            Find Markers Between Clusters
          </label>
        </div>

      <Link href='/AnalysisOptions' className='my-5 rounded-lg w-1/2 p-2 flex items-center bg-blue text-white hover:bg-cyan hover:text-blue'><BsArrowLeftCircleFill className='mr-1 text-blue bg-white rounded-full'/> Back to Analysis Options</Link>
        
      {analysisOption === 'Heatmap' && (  
        <>
          <div className='text-lg text-'>Enter Gene Features for Heatmap:</div>
          <textarea
            className="w-full h-64 border border-gray-300 p-2 resize-y overflow-auto"
            placeholder="Enter Gene Feature Names"
            value={inputValue}
            onChange={handleInputChange}
          ></textarea>
          <button
            className={`mt-4 px-4 py-2 border border-black rounded-md${isButtonDisabled
                ? 'bg-blue/50 cursor-not-allowed'
                : 'bg-cyan hover:bg-emerald-500 text-blue'}`}
            onClick={handleLoadHeatmap}
            disabled={isButtonDisabled}
          >
            Load Heatmap
          </button>
        </>
      )}
      {analysisOption === 'allMarkers' && (
        <button className="mt-4 px-4 py-2 border border-black rounded-md bg-cyan hover:bg-emerald-500 text-blue" onClick={handleFindAllMarkers}>
          Run
        </button>
      )}
      {analysisOption === 'findMarkers' && (
        <>
          <select 
            className="w-full border border-gray-300 p-2 mt-4"
            value={selectedCluster1}
            onChange={(e) => setSelectedCluster1(clusters[e.target.value])}
          >
            {Object.keys(clusters).map(clusterKey => (
              <option key={clusterKey} value={clusterKey}>
                {clusters[clusterKey]}
              </option>
            ))}
          </select>
          <select 
            className="w-full border border-gray-300 p-2 mt-4"
            value={selectedCluster2}
            onChange={(e) => setSelectedCluster2(clusters[e.target.value])}
          >
            {Object.keys(clusters).map(clusterKey => (
              <option key={clusterKey} value={clusterKey}>
                {clusters[clusterKey]}
              </option>
            ))}
          </select>
          <button 
            className={`mt-4 px-4 py-2 border border-black rounded-md ${
                selectedCluster1 === selectedCluster2 
                    ? 'bg-gray-400 cursor-not-allowed'  // Styles for the disabled state
                    : 'bg-cyan hover:bg-emerald-500 text-blue'
            }`}
            disabled={selectedCluster1 === selectedCluster2}
            onClick={handleFindMarkers}
          >
            Run
          </button>
        </>
      )}
      </div>
      <div className="w-2/3 h-5/6 -mt-10 bg-white rounded-lg border border-blue">
        {renderPlot()}
      </div>
    </div>
    </>
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

export default Heatmap;
