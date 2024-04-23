import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import { NextButton } from '../components/NextButton';
import {MutatingDots} from 'react-loader-spinner';
import PagesNavbar from '../components/PagesNavbar';
import Sidebar from '../components/Sidebar';
import { getToken } from '../components/utils/security.mjs';
import { useProjectContext } from '../components/utils/projectContext';
import {varfeatBucket, pcaBucket} from '../constants.js';
import { varfeatureanalysis } from '../components/utils/mongoClient.mjs';
import SocketComponent from '../components/SocketComponent';
import PlotCarousel from '../components/PlotCarousel';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const DynamicFeaturePlot = dynamic(() => import('../components/plots/VariableFeaturePlot'), {
  ssr: false, 
});
const DynamicPcaPlot = dynamic(() => import('../components/plots/PCAPlot'), {
  ssr: false, 
});
const DynamicPcaGenePlot = dynamic(() => import('../components/plots/PCAGenePlot'), {
  ssr: false,
});

const VariableFeatures = ({data: session, token}) => {

  const {selectedProject, analysisId} = useProjectContext();
  const [isDataLoading,setIsDataLoading]=useState(false)
  const [complete, setComplete] = useState(false);
  const [nFeatures, setNFeatures] = useState(2000);
  const [showForm,setShowForm]=useState(false)
  const plots = [
    <DynamicFeaturePlot
    key={0} 
    plotKey={`${selectedProject.user}/${selectedProject.project_id}/${analysisId}/variableFeatures.json`}
    bucket={varfeatBucket}
    />,
    <DynamicPcaPlot
    key={1}
    plotKey={`${selectedProject.user}/${selectedProject.project_id}/${analysisId}/embeddings.json`}
    bucket={pcaBucket}
    />,
    <DynamicPcaGenePlot
    key={2}
    plotKey={`${selectedProject.user}/${selectedProject.project_id}/${analysisId}/loadings.json`}
    bucket={pcaBucket}
    />
  ];

  useEffect(() => {
    if (complete) {
      setIsDataLoading(false);
    }
  }, [complete]);
  
  const renderPlots = () => {
    //websocket signal ...
    if (complete) {
      return (
        <PlotCarousel 
          plots={plots}
        />
      );
    }
    return null;
  };

  async function loadVariableFeaturesPlot(event) {
    event.preventDefault();
    setIsDataLoading(true)

    const variableFeaturesPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/plots/variableFeatures.json`;
    console.log(variableFeaturesPlotKey, " does not exist... Beginning processing.");
    const loadPlot = async () => {
        const response = await varfeatureanalysis(selectedProject.user, selectedProject.project_id, analysisId, nFeatures, token);
        if (response) {
          console.log(response, 'VAR FEAT RESPONSE HERE')
          setIsDataLoading(false)
          return response;
        }
    }
    loadPlot();
  }    

  return (
    <div className="bg-slate-200 w-screen min-h-screen">
      {showForm&&(
        <BugReportForm page='VARIABLE FEATURE' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
      <SocketComponent
        user={selectedProject.user}
        step={"VariableFeatures"}
        setComplete={setComplete}
      />
      <PagesNavbar page="VARIABLE FEATURES"/>
      <Sidebar page = {"Variable Features"}/>
      <div className='bg-white rounded-xl my-5 mx-10 border border-blue h-2/3 p-5'>
      {
          isDataLoading && 
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
            />
        }
        {renderPlots()}
      </div>
      <div className='flex items-center space-x-10 '>
      <div className="bg-white shadow-2xl rounded-lg flex flex-col space-y-1 w-1/2 ml-10 p-3 border border-blue">
        <label className="font-bold font-md">nFeatures from 0 to 3000: </label>
        <input
          className="border rounded p-2"
          type="number"
          min="0"
          max="3000"
          value={nFeatures}
          onChange={(e) =>
            setNFeatures(Math.max(0, Math.min(3000, Number(e.target.value))))
          }
        />
        <input
            className="w-full"
            type="range"
            min="0"
            step={100}
            max="3000"
            value={nFeatures}
            onChange={(e) => setNFeatures(Number(e.target.value))}
        />
        <div className='flex justify-center items-center'>
          <div className='w-1/2 border border-blue text-lg hover:bg-blue hover:text-white hover:-translate-y-1 hover:scale-110 transition duration-100 ease-out'>
              <form onSubmit={loadVariableFeaturesPlot}>
                <button type='submit' className='px-8 py-2 w-full h-full'>Load Variable Features Plot</button>
              </form> 
          </div>
      </div>
      </div>
      <div className={`w-1/3 h-2/3 mt-2 text-white`}>
            <NextButton path={'/cluster'} complete={complete}/> 
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  // Get the user's JWT access token from next's server-side cookie
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

export default VariableFeatures;
