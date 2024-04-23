import React, { useEffect } from 'react'
import { useProjectContext } from './utils/projectContext';
import { getProjects } from './utils/mongoClient.mjs';
import dynamic from 'next/dynamic';
import { get, set } from 'idb-keyval';

const Project = dynamic(() => import('../components/Project'), {
  ssr: false,
});


const ProjectList = ({ onSelectProject, user, createNewProject, token}) => {
    const { projects, setProjects } = useProjectContext();

    useEffect(() => {
        // Check if projects are already cached in local storage
        const fetchProjects = async () => {
          const cachedProjects = await get ('cachedProjects');
          if (cachedProjects && cachedProjects.length > 2) {
              console.log("Cached projects: ", cachedProjects);
              setProjects(cachedProjects);
              return; // No need to fetch if data is already cached
          }
          try {
            const projectData = await getProjects(user, token);
            console.log("Project data: ", projectData);
            setProjects(projectData);
            console.log(`Fetched ${projectData}`)
          }
          catch (e) { console.log("error:", e) }
        }
        fetchProjects();

      }, [user, setProjects, token]);
    
      return (
        <div className="w-full h-screen">
          <div className="">
              <button
                onClick={createNewProject}
                className="font-lora w-full border-b-2 border-blue/20 text-xl bg-blue text-black text-white text-center p-2 hover:bg-blue/80"
              >
                  New Project
              </button>

            <div 
            className="overflow-y-auto"
           
            >
              {projects.map((project) => (
                <Project
                  key={project.name}
                  project={project}
                  onSelectProject={onSelectProject}
                />
              ))}
            </div>
          </div>
        </div>
      );
    };
    
export default ProjectList;
