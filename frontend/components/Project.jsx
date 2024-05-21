import React from 'react';
import { useProjectContext } from './utils/projectContext';

const Project = ({ project, onSelectProject }) => {
  const {selectedProject } = useProjectContext();

    const handleProjectClick = () => {
        onSelectProject(project);
      };
    
      return (
        <div className={`${selectedProject&&(selectedProject.project_id==project.project_id)?'bg-cyan/70 border-2 border-blue text-2xl':'border-2 border-blue/20 bg-slate-100 '} text-black text-lg py-2 w-100%  hover:bg-cyan/90 hover:text-black hover:text-xl`} onClick={handleProjectClick}>
          <h1 className="font-lora ml-2">{project.name}</h1>
          {/* Render other project details as needed */}
        </div>
      );
    }
export default Project;