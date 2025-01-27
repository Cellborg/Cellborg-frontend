import React, { useState, useEffect } from 'react'
import { getSession, useSession } from 'next-auth/react';
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

    const { setProjects,projects, setSelectedProject, setUser, setUserData} = useProjectContext();
    const [editMode, setEditMode] = useState(false);
    const [deleteMode,setDeleteMode]=useState(false);
    const [deletedProject,setDeletedProject]=useState({});
    const [showForm,setShowForm]=useState(false);

  /*
   *Initializes project context vars
   *Sets user to user ID in application memory
   *Sets selected project variable to null upon load
   *Sets user data (firstname,lastname, email, password, user_id)
   */
    useEffect(() => {
      setUser(userId);
      setSelectedProject(null)
      const fetchUserData = async () => {
        try {
          const res = await getUser(userId, token);
          if (res) { setUserData(res); }
        } 
        catch (err) { console.log("error: ", err); }
      };
      fetchUserData();
    }, [userId, setUser, setUserData, setSelectedProject, token])

    /*
     * Sets selected project in context and user modes
     */
    const handleSelectProject = project => {
      console.log("Selected Project: ", project);
      setSelectedProject(project);
      setEditMode(false)
      setDeleteMode(false);
    };
    /*
     * Sets project context for selected project to empty attributes, sets edit-mode to true
     */
    const createNewProject = () => {
        setSelectedProject({
            name: '',
            description: '',
            datasets:[]
        });
        setEditMode(true);        
    }
    /*
     * gets out of delete mode by setting deletedProject in context to empty and user-mode to false
     */
    const exitDeleted=()=>{
      setDeletedProject({});
      //setSelectedProject(null);
      setDeleteMode(false);
    }

  /**
     * @param {}
     * @returns
     * retrieves from cache and deletes from mongo and s3
     * updates cache and sets context and env
     * USE-CASE: user clicks delete on delete confirmation modal
     */
  const handleDelete= async()=>{
    console.log(deletedProject)
    const cachedProjects = await get('cachedProjects');

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
    const deletedProjectList=cachedProjects.filter(project=>project._id!==deletedProject._id)
    set('cachedProjects', deletedProjectList)

    //update cache
    setProjects(deletedProjectList)
    setDeletedProject({})
    setSelectedProject(null)
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