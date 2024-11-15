import React, { useState, useEffect, useRef } from 'react';
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
import {performQCDoublets} from '../components/utils/mongoClient.mjs';

const DynamicViolinPlot = dynamic(() => import('../components/plots/ViolinPlot.jsx'), {
  ssr: false,
  loading: () => <div>Loading Violin Plot...</div>,
});
const DynamicFeatureScatterPlot = dynamic(() => import('../components/plots/FeatureScatterPlot.jsx'), {ssr: false});

const QCMetrics = ({data: session, token, datasetName,datasetId, completed}) => {
  const router = useRouter();
  const { selectedProject } = useProjectContext();
  const [isDataLoading,setIsDataLoading]=useState(true)
  const [jsonData, setJsonData] = useState(null);
  const [showForm,setShowForm]=useState(false);
  const count = useRef({'max':null, 'min':null})
  const gene = useRef({'max':null,'min':null})
  const mito = useRef({'max':null,'min':null})

  async function handleFinishMetrics(user, project, dataset, count, gene, mito, router, token){
    const response = await performQCDoublets(user, project, dataset, count, gene, mito, token);
    console.log(response)
    if(response){
      //await handleFinishQC(selectedProject.user, selectedProject.project_id, datasetId, router, token);
      //need to call handleFinishQC once sns message is sent from task or something

      //find corresponding species for selected dataset else empty
      const species = selectedProject.datasets.find(dataset => dataset.dataset_id === datasetId)?.species || undefined;
      
      router.push(`/loading?task=${response.taskArn}&dataset=${dataset}&name=${null}&species=${species}`)
    }
    /**
     * Error handle performQCDoublets
     */
  
  }
  function handleInvalidInput(){
    alert("either invalid input or something went wrong in pre-plot")
  }
  function checkMinsAndMaxs(){
    const currCount = count.current;
    const currGene = gene.current;
    const currMito  = mito.current;
    console.log('counts: ', currCount)
    console.log('gene: ', gene.current)
    console.log('mito: ', mito.current)
    //check if user chose max and min for count
    if(Object.keys(currCount).length <2){
      return false;
    }
    //check if user chose max and min for gene
    else if(Object.keys(currGene).length <2){
      return false
    }
    //check if user chose max and min for mito
    else if(Object.keys(currMito).length <2){
      return false
    }
    //check for negative values
    else if(currCount.min<0 || currCount.max<0 || currGene.min<0 || currGene.max <0 || currMito.max<0 || currMito.min<0){
      return false;
    }
    return true;
  }
  useEffect(() => {
    const violinPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${datasetId}/plots/QCViolinPlot.json`;
    console.log(`Getting plots 1: ${violinPlotKey} from ${datasetqcBucket}`);
    console.log(datasetId);
    Promise.all([
      getPlotData(datasetqcBucket, violinPlotKey),
    ])
      .then(([violinData]) => {
        console.log("violin data:",violinData)
        setJsonData(violinData);
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


  const plots = jsonData? [
    <DynamicViolinPlot key={0} plotData={jsonData} className='w-auto'/>,
    <DynamicFeatureScatterPlot key={1} plotData={jsonData} className='w-auto'/>, //highlight points below n above the cutoff
  ]:[];

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
            <div className = 'flex items-center'>
              <h1>Count Max</h1>
              <input 
              type='number' 
              min='0'
              classname=''
              onChange={(e) => (count.current.max = Number(e.target.value))}
              />
              <h1>Count Min</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e) => (count.current.min = Number(e.target.value))}
              />
              <h1>Gene Max</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e) => (gene.current.max = Number(e.target.value))}
              />  
              <h1>Gene Min</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e) => (gene.current.min = Number(e.target.value))}
              /> 
              <h1>Mito Max</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e) => (mito.current.max = Number(e.target.value))}
              /> 
              <h1>Mito Min</h1>
              <input 
              type='number' 
              classname=''
              min='0'
              onChange={(e) => (mito.current.min = Number(e.target.value))}
              /> 
            </div>
            <div className='flex items-center justify-center mt-1'>
              <button
                className="rounded-md bg-blue text-white px-10 py-4 text-lg font-bold hover:bg-blue/70 transition ease-in-out duration-100"
                onClick={() => {
                  if(completed && checkMinsAndMaxs()){
                    handleFinishMetrics(selectedProject.user, selectedProject.project_id, datasetId, count.current, gene.current, mito.current,router, token)
                  }
                }}
              >
                Finish Metrics for {datasetName}
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
  const datasetName=context.query.datasetName;
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

export default QCMetrics;
