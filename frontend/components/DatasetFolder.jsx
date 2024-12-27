import React,{useState} from 'react';
import { FcOpenedFolder } from 'react-icons/fc';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import {BsFillCheckSquareFill} from 'react-icons/bs';
import { useRouter } from 'next/router';
import { useProjectContext } from './utils/projectContext';
import { beginQualityControl } from './utils/mongoClient.mjs';
import RerunModal from './RerunModal';


const DatasetFolder = ({dataset, editmode, onUpdateDataset, token}) => {
  const router = useRouter();
  const {name, status, nickname,dataset_id, species} = dataset;

  const {selectedProject} = useProjectContext();
  const [rerunModal, setRerunModal] = useState(false);
  const [mouseIn, setMouseIn] = useState(true);

  const handleOnDrag = (e) => {
    console.log(e.target.id);
    e.dataTransfer.setData("dataset", e.target.id);
  }

  const newQCButtonClick = () => {
    if (status == "complete") setRerunModal(true);
    else beginQC()
  }

  const handleView = () => {
    setRerunModal(false);
    console.log(`QC has already been completed for ${name}... Showing results`);
    router.push(`/QualityControl?dataset=${name}&completed=true`);
  }

  const beginQC = () => {
    setRerunModal(false);

    console.log("Performing QC :", name);

    const begin = async () => {
      console.log("selected project is", selectedProject);
      const response = await beginQualityControl(selectedProject.user, selectedProject.project_id, dataset_id, token);
      if (response) {
        console.log(response);
        console.log(name, "NAME HERE")
        //need to pull species from dataset not project
        router.push(`/loading?task=${response.taskArn}&dataset=${dataset_id}&name=${name}&species=${species}`);
      } else {
        console.log("Error beginning QC...");
        return;
      }
    }; begin();
  }
  const handleInputChange = (e) => {
    // Update the dataset object with the new name
    const updatedDataset = {name: name, nickname: e.target.value, id:e.id };
    onUpdateDataset(updatedDataset);
  };

  return (
    <div
      id={dataset_id}
      className='flex flex-col relative'
      draggable
      onDragStart={(e) => handleOnDrag(e)}
    >
      <div className='flex items-center space-x-2'>
        <FcOpenedFolder className='w-8 h-8' />
        <div className='text-sm text-black pr-5'>
          {editmode?(
                <input type="text" placeholder={name} onChange={handleInputChange}></input>
              ):
              (<div>
                  {nickname}
                </div>)}
              </div>
        {!editmode ?
        <>
        {status === 'pending' ? (
          <div className="mt-2">
            <button
              onClick={newQCButtonClick}
              className="bg-blue text-white py-0.5 px-1.5 rounded-md hover:bg-cyan hover:text-blue"
            >
              QC
            </button>
          </div>
        ) : (
          <div className="flex items-center mt-2">
            <button
              onClick={newQCButtonClick}
              className="text-blue py-0.5 px-1.5 rounded-md"
            >
              <BsFillCheckSquareFill className='scale-150'/>
            </button>
          </div>
        )}
        </> : <></>}
        <h1 className= 'pl-3'>{species}</h1>
        <div>
          {rerunModal && (
              <RerunModal
                handleRerun={() =>{ 
                  setRerunModal(false)
                }}
                handleView={handleView}
                handleEnter={() => setMouseIn(true)}
                handleLeave={() => setMouseIn(false)}
                handleClick={() => {(!mouseIn) && setRerunModal(false)}}
              />
          )}

        </div>
      </div>
    </div>
  );
};

export default DatasetFolder;
