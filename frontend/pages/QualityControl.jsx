import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import {MutatingDots} from 'react-loader-spinner';
import PagesNavbar from '../components/PagesNavbar';
import { useProjectContext } from '../components/utils/projectContext';
import { getPlotData } from '../components/utils/s3client.mjs';
import {datasetqcBucket} from '../constants.js';
import { useRouter } from 'next/router';
import { handleFinishQC } from '../components/utils/qcClient.mjs';
import { getToken } from '../components/utils/security.mjs';
import PlotCarousel from '../components/PlotCarousel';
import BugReportForm from '../components/BugReportForm';
import { GoReport } from "react-icons/go";

const DynamicViolinPlot = dynamic(() => import('../components/plots/ViolinPlot'), {ssr: false});
const DynamicFeatureScatterPlot = dynamic(() => import('../components/plots/FeatureScatterPlot'), {ssr: false});
const DynamicDoubletsPlot = dynamic(() => import('../components/plots/DoubletPlot'), {ssr: false});

const QualityControl = ({data: session, token, datasetName,datasetId, completed}) => {
  const router = useRouter();
  const { selectedProject } = useProjectContext();
  const [isDataLoading,setIsDataLoading]=useState(false)
  const [activePlotIndex, setActivePlotIndex] = useState(0);
  const [jsonData, setJsonData] = useState(null);
  const [doubletsData, setDoubletsData] = useState(null);
  const [showForm,setShowForm]=useState(false);
  useEffect(() => {
    setIsDataLoading(true);
  
    const violinPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${datasetId}/plots/QcViolinPlotData.json`;
    const doubletPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${datasetId}/plots/doubletplot.json`;
    console.log(`Getting plots 1: ${violinPlotKey} and 2: ${doubletPlotKey} from ${datasetqcBucket}`);
    console.log(datasetId);
    Promise.all([
      getPlotData(datasetqcBucket, violinPlotKey),
      getPlotData(datasetqcBucket, doubletPlotKey),
    ])
      .then(([violinData, doubletData]) => {
        setJsonData(violinData);
        setDoubletsData(doubletData);
        setIsDataLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plot data:', error);
      });
    if (!completed) {
      window.addEventListener('beforeunload', (e) => {
        handleFinishQC(selectedProject, datasetId, router);
      });
    }
    return () => {
      if (!completed) {
        window.addEventListener('beforeunload', (e) => {
          handleFinishQC(selectedProject, datasetId, router);
        });
      }
  }
  }, [selectedProject, datasetId, router, completed]);

  const handleCompleteViewingQCResults = (router) => {
    console.log("Finished viewing QC results.. pushing to dashboard");
    router.push('/dashboard');
  };

  const plots = [
    <DynamicViolinPlot key={0} plotData={jsonData} className='w-auto'/>,
    <DynamicFeatureScatterPlot key={1} plotData={jsonData} className='w-auto'/>, //highlight points below n above the cutoff
    <DynamicDoubletsPlot key={2} data={doubletsData} className='w-auto'/>
  ];

  return (
    <div className="bg-slate-100 h-screen ">
      {showForm&&(
        <BugReportForm page='QUALITY CONTROL' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
      <PagesNavbar page="QUALITY CONTROL"/>
        <div className='flex justify-center items-center overflow-x-hidden ml-[8vw] pt-10' style={{height:'85vh', width:'85vw',position:'relative'}}>
        {
          isDataLoading?
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
        :<div className='w-full h-full p-5'>
          <PlotCarousel plots={plots}/>
            <div className='flex items-center justify-center mt-1'>
              <button
                className="rounded-md bg-blue text-white px-10 py-4 text-lg font-bold hover:bg-blue/70 transition ease-in-out duration-100"
                onClick={() => {
                  completed ? 
                    handleCompleteViewingQCResults(router) :
                    handleFinishQC(selectedProject.user, selectedProject.project_id, datasetId, router, token)
                }}
              >
                Finish QC for {datasetName}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  // Get the user's JWT access token from next's server-side cookie
  const token = await getToken(context);
  
  const datasetId = context.query.datasetId;
  const datasetName=context.query.datasetName
  console.log(datasetId);
  const completed = context.query.completed ? context.query.completed : false
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
        datasetName: datasetName,
        datasetId:datasetId,
        completed: completed
      }
    }
};

export default QualityControl;
