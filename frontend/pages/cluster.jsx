import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import { ClusterPlotForm } from '../components/plotForms/ClusterPlotForm';
import dynamic from 'next/dynamic';
import {MutatingDots} from 'react-loader-spinner';
import { NextButton } from '../components/NextButton';
import PagesNavbar from '../components/PagesNavbar';
import Sidebar from '../components/Sidebar';
import { useProjectContext } from '../components/utils/projectContext';
import { datasetqcBucket } from '../constants';
import { getToken } from '../components/utils/security.mjs';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';
import { socketio } from '../constants';
import io from 'socket.io-client';

const DynamicScatterPlot = dynamic(() => import('../components/plots/ScatterPlot'), {
  ssr: false,
});

const Cluster = ({data: session, token}) => {
  const [clusterPlotKey, setClusterPlotKey] = useState("");
  const [complete, setComplete] = useState(false);
  const [isDataLoading, setIsDataLoading]=useState(false);
  const {selectedProject, setClusters, setGeneList} = useProjectContext();
  const [showForm,setShowForm]=useState(false);

  useEffect(()=>{
    const socket = io(socketio);
    socket.emit('RegisterConnection', selectedProject.user);

    socket.on('PA_Clustering_Complete', async (data)=>{
      const {user, project, geneNames,clusters, stage} = data;

      //add info to clusters and gene names to context for annotations
      setClusters(clusters);
      setGeneList(geneNames);
      setComplete(true);
    })
  }, [])
  useEffect(() => {
    if (complete) {
      setIsDataLoading(false);
    }
  }, [complete]);
  
  const renderPlots = () => {
    if (complete) {
      return (
        <DynamicScatterPlot plotKey={clusterPlotKey} bucket={datasetqcBucket} setIsDataLoading={setIsDataLoading}/>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-200 w-screen h-screen">
      {showForm&&(
        <BugReportForm page='CLUSTER' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute z-50 rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
     <PagesNavbar page="CLUSTER ANALYSIS"/>
      <Sidebar page = "Clusters" />
      <div className='flex flex-row mt-3'>
        <div className='p-4 ml-5 border border-blue rounded-lg bg-white w-[13vw] h-[85vh]'>

          <ClusterPlotForm setIsDataLoading={setIsDataLoading} setClusterPlotKey={setClusterPlotKey} token={token}/>

        </div>
        <div className='ml-5 rounded-lg border border-blue p-1 bg-white' style={{height:'85vh', width:'82vw',position:'relative'}}>
        {
          isDataLoading && (
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
        )}
        {renderPlots()}
        </div> 
      </div>
      <div className="flex justify-center">
        <div className={`w-1/3 mt-2 text-white`}>
          <NextButton path={`/Annotations?${clusterPlotKey.split('/').pop().split('.json')[0]}`} complete={complete}/>
        </div>
      </div>
    </div>
  )
}

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
        token
      }
    }
};

export default Cluster;
