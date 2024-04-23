import React, {useState} from 'react';
import dynamic from 'next/dynamic';
import SocketComponent from '../components/SocketComponent';
import {MutatingDots} from 'react-loader-spinner';
import { PSUEDOTIME_BUCKET } from '../constants';
import { useProjectContext } from '../components/utils/projectContext';
import { psuedotimeAnalysis } from '../components/utils/mongoClient.mjs';
import { getToken } from '../components/utils/security.mjs';
import PagesNavbar from '../components/PagesNavbar';
import Link from 'next/link';
import {BsArrowLeftCircleFill} from 'react-icons/bs';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const DynamicOrderCellsPlot = dynamic(() => import('../components/plots/OrderCellsPlot'), {
  ssr: false,
});
const DynamicPsuedotimePlot = dynamic(() => import('../components/plots/MonoclePlot'), {
  ssr: false, 
});
const Psuedotime = ({data: token}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const {selectedProject, analysisId} = useProjectContext();
  const [selectedPoints, setSelectedPoints] = useState(new Set());
  const [showForm,setShowForm]=useState(false);

  const handleRedo = () => {
    setComplete(false);
  };
  

  const orderCellsPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/order_cells.json`;
  const psuedotimePlotKey = `${selectedProject.user}/${selectedProject.project_id}/${analysisId}/psuedotime.json`;

  const setOrderCellsPlot = async (rPoints) => {
    console.log(rPoints);
    const res = await psuedotimeAnalysis(selectedProject.user, selectedProject.project_id, analysisId, rPoints, token);    if (res) {
    console.log(res);
    }
  }
  const handleDoneClick = async() => {
    console.log(Array.from(selectedPoints));
    const rPoints = Array.from(selectedPoints).map(point => `Y_${point}`);
    console.log("Sending psuedotime request to the API...");
    //connect to API
    try {
        setOrderCellsPlot(rPoints);
    } catch (error) {
        console.log("error performing heatmap analysis: ", error);
    }
};
  return (
    <div className="bg-slate-100 w-screen h-screen">
      {showForm&&(
        <BugReportForm page='PSUEDOTIME' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute z-50 rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
      <PagesNavbar page={"PSUEDOTIME"}/>
      <SocketComponent
        user={selectedProject.user}
        step={"Psuedotime"}
        setComplete={setComplete}
      />
      <div className='flex space-x-5 mx-10'>
        <div>
          <h1 className='font-roboto my-5 text-2xl font-roboto font-bold'>VelocityAnalysis</h1>
          <Link href='/AnalysisOptions' className='my-5 rounded-lg w-full p-2 flex items-center bg-blue text-white text-md hover:bg-cyan hover:text-blue'><BsArrowLeftCircleFill className='mr-5 text-blue bg-white rounded-full'/> Back to Analysis Options</Link>
          {complete?(
            <button onClick={handleRedo} className="bg-blue text-white px-6 py-2 rounded-md w-full hover:bg-blue/70 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer">
              Redo Pseudotime
            </button>):(
            <button
            className="bg-blue text-white px-6 py-2 rounded-md w-full"
            onClick={handleDoneClick}>
            Done
            </button>
          )}
        </div>
        <div className='border border-blue rounded-lg mt-10 p-2 bg-white' style={{height:'85vh', width:'82vw'}}>
          {
            isLoading ? (
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
            ) : (
              complete ? (
                <>
                  <DynamicPsuedotimePlot 
                    plotKey={psuedotimePlotKey} 
                    bucket={PSUEDOTIME_BUCKET} 
                  />
                </>
              ) : (
                <>
                <DynamicOrderCellsPlot plotKey={orderCellsPlotKey} bucket={PSUEDOTIME_BUCKET} setSelectedPoints={setSelectedPoints} selectedPoints={selectedPoints} handleDoneClick={handleDoneClick}/>
                </>
              )
            )
          }
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  // Get the user's JWT access token from next's server-side cookie
  const token = await getToken(context);
  if (!token) {
    // JWT token could not be parsed/retrieved from session-token cookie
    console.log('redirecting to login');
    return {
      redirect: {
        destination: '/Login',
        permanent: false,
      },
    };
  }
    return {
      props: { 
        data: token,
      }
    }
};

export default Psuedotime;