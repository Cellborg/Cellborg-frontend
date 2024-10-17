import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getSession } from 'next-auth/react';
import {MutatingDots} from 'react-loader-spinner';
import PagesNavbar from '../components/PagesNavbar.jsx';
import { useProjectContext } from '../components/utils/projectContext.js';
import { getPlotData } from '../components/utils/s3client.mjs';
import {datasetqcBucket} from '../constants.js';
import { useRouter } from 'next/router';
import { handleFinishQC } from '../components/utils/qcClient.mjs';
import { getToken } from '../components/utils/security.mjs';
import PlotCarousel from '../components/PlotCarousel.jsx';
import BugReportForm from '../components/BugReportForm.jsx';
import { GoReport } from "react-icons/go";
import {finishDoublets} from "../components/utils/mongoClient.mjs";

const DynamicDoubletsPlot = dynamic(() => import('../components/plots/DoubletPlot.jsx'), {ssr: false});

const QCDoublets = ({data: session, token, datasetName,datasetId, completed}) => {
  const router = useRouter();
  const { selectedProject } = useProjectContext();
  const [isDataLoading,setIsDataLoading]=useState(false)
  const [doubletsData, setDoubletsData] = useState(null);
  const [doubletScore, setDoubletScore] = useState();
  const [showForm,setShowForm]=useState(false);


  useEffect(() => {
    setIsDataLoading(true);
  
    const doubletPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${datasetId}/plots/doubletplot.json`;
    console.log(`Getting plots 2: ${doubletPlotKey} from ${datasetqcBucket}`);
    console.log(datasetId);
    Promise.all([
      getPlotData(datasetqcBucket, doubletPlotKey),
    ])
      .then(([doubletData]) => {
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

  async function sendDoubletScore(score){
    const response = await finishDoublets(selectedProject.user, selectedProject.project_id, datasetId, score,token)
    if(response){
      console.log("Doublets has been finished: ", response);
    }
  }
  const handleCompleteViewingQCResults = (router) => {
    console.log("Finished viewing QC results.. pushing to dashboard");
    router.push('/dashboard')
  };

  const plots = [
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
          <h1>Doublet Score</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e)=>{setDoubletScore(e.target.value)}}
              />
            <div className='flex items-center justify-center mt-1'>
              <button
                className="rounded-md bg-blue text-white px-10 py-4 text-lg font-bold hover:bg-blue/70 transition ease-in-out duration-100"
                onClick={() => {
                    sendDoubletScore(doubletScore)
                    handleFinishQC(selectedProject.user, selectedProject.project_id, datasetId, router, token);
                    handleCompleteViewingQCResults(router);
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

export default QCDoublets;
