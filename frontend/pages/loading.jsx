import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {checkTaskStatusURL} from '../constants.js';
import {MutatingDots} from 'react-loader-spinner'; 
import io from 'socket.io-client';
import {socketio} from '../constants.js';
import { useProjectContext } from '../components/utils/projectContext';
import { performQCMetricsPrePlot} from '../components/utils/mongoClient.mjs';
import { SpeciesToMt } from '../constants.js';
import cookie from "cookie";
import { get } from 'idb-keyval'
import BugReportForm from '../components/BugReportForm';
import { handleFinishQC } from '../components/utils/qcClient.mjs';
import { updateProject } from '../components/utils/mongoClient.mjs';
import { GoReport } from "react-icons/go";
import {SESSION_COOKIE} from '../constants'

const Loading = ({data: token}) => {
  console.log("token:", token);
  const router = useRouter();
  const { task,dataset,name,species} = router.query;
  const { selectedProject, setSelectedProject, setProjects, projects } = useProjectContext();
  const [showForm,setShowForm]=useState(false);
  
  console.log("Selected project is:", selectedProject);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const socket = io(socketio);
    console.log("Emitting register connection for", selectedProject, selectedProject.user);
    socket.emit('RegisterConnection', selectedProject.user);

    //for QC pre-plot 
    socket.on('QC_Pre_Plot_Complete', async (data) => {
        const { user, project, dataset, stage} = data;   
        console.log("QC completed for:", data);
        const projectList = await get('cachedProjects');
        console.log("project list:", projectList)
        const projIdx = projectList.findIndex(p => p.project_id == project);
        console.log(projIdx)
        const dataIdx = projectList[projIdx].datasets.findIndex(d => d.dataset_id === dataset);

        if (projectList[projIdx].datasets[dataIdx].status !== "prePlot") {
            projectList[projIdx].datasets[dataIdx].status ="prePlot";
            setProjects(projectList);
            setSelectedProject(projectList[projIdx]);
            //set cache status
            set('cachedProjects', projectList)

            //update mongo
            const response = await updateProject(project, projectList[projIdx])
            console.log(`dataset ${dataset} marked prePlot`)
        }
        else {
            console.log(`no need to update, dataset ${dataset} already prePlotted`)
        }
        router.push(`/QCMetrics?datasetId=${dataset}&datasetName=${name}&completed=${true}`);
    });

    //for doublets
    socket.on('QC_Doublet_Complete', async(data)=>{
      const {user, project, dataset} = data;
      console.log("QC Doublets finished for: ", data);

      const projectList = await get('cachedProjects');
      console.log("project list:", projectList)
      const projIdx = projectList.findIndex(p => p.project_id == project);
      console.log(projIdx);
      const dataIdx = projectList[projIdx].datasets.findIndex(d => d.dataset_id === dataset);

      if (projectList[projIdx].datasets[dataIdx].status !== "complete") {
          projectList[projIdx].datasets[dataIdx].status ="complete";
          setProjects(projectList);
          setSelectedProject(projectList[projIdx]);
          //set cache status
          set('cachedProjects', projectList)

          //update mongo project
          const response = await updateProject(project, projectList[projIdx])
          
          console.log(`dataset ${dataset} marked complete`);
      }
      else {
          console.log(`no need to update, dataset ${dataset} already complete`)
      }
      //router.push(`/QCDoublets?datasetId=${dataset}&datasetName=${name}&completed=${true}`)
      //clean up QC Task here
      const response = await handleFinishQC(selectedProject.user, selectedProject.project_id, dataset, router, token);
      router.push('/dashboard')
    })
    return () => {
        socket.disconnect();
    };
}, [projects, selectedProject, router, setProjects, setSelectedProject, name]);

  useEffect(() => {
  
    //move to the api beginqualitycontril endpoint function itself
    const checkTaskStatus = async () => {
      try {
        const response = await fetch(checkTaskStatusURL, {
            method: 'POST',
            headers: {
              'Content-Type' : 'application/json',
              'Authorization' : `Bearer ${token}`
            },
            body: JSON.stringify({taskArn: task})
        });
        const data = await response.json();
        if (data.ready === true) { 
            setIsLoading(false);

            //TODO: make req in dashboard 

            const mt = SpeciesToMt[species]
            console.log("mt from dataset: ",mt)
            console.log("species associated with datatset: ", species)
            const response = await performQCMetricsPrePlot(selectedProject.user, selectedProject.project_id, dataset, mt, token);
            // performQCMetrics endpoint 
            console.log('Response for perform qc metrics is:', response);
        }
        else if(data.ready === false) {
          setTimeout(checkTaskStatus, 5000); //check task status again after 5 seconds
        }
      } catch (error) {
        console.error("Error fetching task status:", error);
      }
    };

    console.log("loading variable: ",isLoading)
    if (isLoading) {
      checkTaskStatus();
    }
  }, [isLoading, router, dataset, task,species, selectedProject.project_id, selectedProject.user, token]);

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      {showForm&&(
        <BugReportForm page="LOADING" token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
    <MutatingDots
      height="100"
      width="100"
      color="#4ecda4"
      secondaryColor="#4ecda4"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperStyle={{}}
      wrapperClass="flex justify-center item-center"
      visible={true}
    />
    {isLoading ? <div>Starting ECS Task...</div> : <div>Performing QC...</div>}
    </div>
  )
}

export async function getServerSideProps(context) {
  // Get the user's JWT access token from next's server-side cookie
  let token = "";
  try {
    const session_cookie = cookie.parse(context.req.headers.cookie);
    token = session_cookie[`${SESSION_COOKIE}`];
  }
  catch (err) {
    console.log("error getting session cookie");
  }
    return {
      props: { 
        data: token,
      }
    }
};


export default Loading;