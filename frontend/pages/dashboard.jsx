import React, { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react';
import { useProjectContext } from '../components/utils/projectContext';
import PagesNavbar from '../components/PagesNavbar';
import { deleteProjectFromS3 } from '../components/utils/s3client.mjs';
import { getUser, deleteProject } from '../components/utils/mongoClient.mjs';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ProjectList from '../components/ProjectList';
import { ProjectViewBox } from '../components/ProjectViewBox.jsx';
import { get, set } from 'idb-keyval'
import { getToken } from '../components/utils/security.mjs';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const Dashboard = ({data: session, token}) => {
    const userId=session.user.user_id

    const { setProjects, selectedProject, setSelectedProject, setUser, setUserData } = useProjectContext();
    const [editMode, setEditMode] = useState(false);
    const [deleteMode,setDeleteMode]=useState(false);
    const [deletedProject,setDeletedProject]=useState({});
    const [showForm,setShowForm]=useState(false);

    useEffect(() => {
      setUser(userId); 
      //console.log("setting sel proj to null here: changes went through")
      setSelectedProject(null)
    }, [userId, setUser, setSelectedProject])

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const res = await getUser(userId, token);
          if (res) { setUserData(res); }
        } 
        catch (err) { console.log("error: ", err); }
      };
      fetchUserData();
    }, [userId, setUser, setUserData, token]);

    const handleSelectProject = project => {
      console.log("Selected Project: ", project);
      setSelectedProject(project);
      setEditMode(false)
      setDeleteMode(false);
    };
    const createNewProject = () => {
        setSelectedProject({
            name: '',
            description: ''
        });
        setEditMode(true);        
    }

  const exitDeleted=()=>{
    setDeletedProject({})
    setDeleteMode(false)
    console.log(deleteMode)
  }

  //delete project from db and cache
  const handleDelete= async()=>{
    console.log(deletedProject)
    const cachedProjects = await get('cachedProjects');
    const existingProjects = (cachedProjects && cachedProjects.length > 1) ? cachedProjects : [];
    console.log('existing projects from deleted',existingProjects)
    //delete the project in MongoDB
    console.log(deletedProject);
    await deleteProject(deletedProject._id, deletedProject, token);
    
    console.log("delete from AWS s3\n", deletedProject.name);
    // delete from AWS S3
    /*  ISSUE: If project has no datasets, then will run into error. `if (listObjects.Contents.length == 0) cons...` 
        generates TypeError b/c listObjects.Contents will yield an undefined value
        */
    deleteProjectFromS3(deletedProject); 

    //set projects with deleted project
    const deletedProjectList=existingProjects.filter(project=>project._id!==deletedProject._id)
    //update cache
    setProjects(deletedProjectList)
    setDeletedProject({})
    setSelectedProject([])
    setDeleteMode(false)
}
  return (
    <>
    <div className={`bg-blue/20 overflow-hidden`}>
      {showForm&&(
        <BugReportForm page='DASHBOARD' token={token} setShowForm={setShowForm} className='z-50'/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(!showForm)}}
      >
        <GoReport />
      </div>
    {deleteMode && (
        <div className="font-lato fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20">
          <DeleteConfirmationModal
            selectedProject={selectedProject}
            handleDelete={handleDelete}
            exitDeleted={exitDeleted}
          />
        </div>
        )}
      <PagesNavbar page="DASHBOARD"/>
      <div className='flex h-screen'>
          <div className="w-1/5">
            
            <ProjectList onSelectProject={handleSelectProject} user={userId} createNewProject={createNewProject}
            token={token}/>
          </div>

        <div className='w-4/5'>
            <ProjectViewBox 
            editMode={editMode} 
            setEditMode={setEditMode} 
            deleteMode={deleteMode} 
            setDeleteMode={setDeleteMode} 
            setDeletedProject={setDeletedProject} 
            deletedProject={deletedProject}
            handleDelete={handleDelete}
            exitDeleted={exitDeleted}
            token={token}
            />
        </div>
      </div>
      </div>
    </>
  )
}
export async function getServerSideProps(context) {
    const token = await getToken(context);
    // Get the user's session
    const session = await getSession(context);
    if (!token || !session) {
      // If user is not authenticated, redirect
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

export default Dashboard;