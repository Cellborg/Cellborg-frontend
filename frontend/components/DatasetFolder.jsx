import React,{useState, useRef, useEffect} from 'react';
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
  const [showInfo,setShowInfo] = useState(false)
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
        router.push(`/loading?task=${response.taskArn}&dataset=${dataset_id}&name=${name}&species=${selectedProject.species}`);
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
        <div className='relative'>
          {showInfo && (
            <div className='bg-blue border rounded-md p-2 absolute -translate-y-full whitespace-nowrap'>
              <div>{nickname}</div>
            </div>
          )}
          <IoIosInformationCircleOutline
            className='w-4 h-4 cursor-pointer'
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          />
        </div>
        <FcOpenedFolder className='w-5 h-5' />
        <div className='text-sm text-black'>
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
              className="bg-blue text-white py-0.5 px-1.5 rounded-md"
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
        <h1 className= 'pl-10'>{species}</h1>
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
