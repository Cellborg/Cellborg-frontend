import React, { useState } from 'react'
import { useProjectContext } from './utils/projectContext';
import { s3Client } from './utils/s3client.mjs';
import {PutObjectCommand} from "@aws-sdk/client-s3"; 
import { useRouter } from 'next/router';
import { MutatingDots } from 'react-loader-spinner';
import { createProject, newAnalysisId, beginAnalysis, updateProject,newDatasetId } from './utils/mongoClient.mjs';
import { AnalysisRun } from './AnalysisRun';
import {datasetUploadBucket} from '../constants.js';
import dynamic from 'next/dynamic';
import { get, set, update } from 'idb-keyval';
import {findSpecies} from './FindSpecies.js';
const DatasetFolder = dynamic(() => import('../components/DatasetFolder'), {
    ssr: false,
  });

export const ProjectViewBox = ({ editMode, setEditMode,setDeleteMode, setDeletedProject,deletedProject, token}) => {
    //used to route pages
    const pageRouter = useRouter();
    /**
     * keeps track of...
     * isDataLoading/setIsDataLoading - loading screen state
     * editedProject/setEditedProject - edited project state for new projects and current ones (also think edit project screen)
     * uploadedFolders/setUploadedFolders - uploaded files for edited project/new ones
     * selectedDatasets/setSelectedDatasets - selected datasets so we upload files to correct datasets
     */
    const [isDataLoading,setIsDataLoading]=useState(false);
    const [editedProject, setEditedProject] = useState({});
    const [uploadedFolders, setUploadedFolders] = useState([]);
    const [selectedDatasets, setSelectedDatasets] = useState([]);
    const [species, setSpecies] = useState("No Species");
    const { setProjects, user, selectedProject, setSelectedProject, setAnalysisId } = useProjectContext();

    /** 
     * checks for valid file structure
     *      -file names
     *      -# of files
     * @param {Object} files 
     * @returns {Boolean}
    */
    function validFiles(files) {
        //creates array from files
        const selectedFolder = Array.from(files).map(file => (file.name));
        //impliments above checks
        if (selectedFolder.length < 3) { return false; }
        if (selectedFolder.indexOf("features.tsv.gz") > -1 &&
            selectedFolder.indexOf("barcodes.tsv.gz") > -1 && 
            selectedFolder.indexOf("matrix.mtx.gz") > -1) {
                return true;
            }
        return false;
    }

    /**
     * handles folder upload
     * @param {FileList} e 
     * @returns 
     */
    const handleFolderUpload = async (e) => {
        const files = e.target.files;
        let folderName;
        //checks if folder is valid
        if (!validFiles(files)){
            console.log("Folder structure was incorrect. Try again");
            return;
        }
        //iter through folder files
        for (let i = 0; i < files.length; i++) {
            //make sure file is in folder
            if (files[i].webkitRelativePath.indexOf('/') > -1) {
                // Get the folder name
                folderName = files[i].webkitRelativePath.split('/')[0];
                console.log("Folder name:", folderName)
            }        
        }
        console.log("files: ", files)
        //add files to selected datasets
        setSelectedDatasets([...selectedDatasets, files]);
        //add folder to uploaded folders
        setUploadedFolders([...uploadedFolders, {name: folderName, status: "pending"}]);
        //if editing project that was already created...
        if (editedProject.datasets) {
            setEditedProject({ ...editedProject, datasets: [...editedProject.datasets, {name: folderName, nickname:folderName, status: "pending"}] });
        } else { // else add datasets to new project
            setEditedProject({ ...editedProject, datasets: [{name: folderName, nickname:folderName, status: "pending"}] });
        }
      };
    
      /**
       * @param {}
       * @returns 
       * set deleted project
       * update delete-mode to true so modal shows up on screen
       * USE-CASE: user clicks delete on existing project
       */
    const saveDeleted = async () =>{
        await setDeletedProject(selectedProject)
        console.log('deleted project val',deletedProject)
        setDeleteMode(true)
    }

    /**
     * @param {}
     * @returns
     * edit-mode to true
     * edited project to selected project
     * USE-CASE: user clicks edit on existing project 
     */
    const handleEdit = () => {
        setEditMode(true);
        setEditedProject(selectedProject);
    };

    /**
     * @param {}
     * @returns
     * begins analysis run
     * USE-CASE: user clicks Run on existing project
     */
    async function handleRun() {
        try {
            //generate analysis-ID
            const analysisId =  await newAnalysisId(token);
            console.log("analysis id:", analysisId);
            setAnalysisId(analysisId);

            //retrieves dataset-ID's
            const datasetIDs = selectedProject.datasets.map(dataset => dataset.dataset_id);
            console.log("Datasets: ", datasetIDs);
            //push user to analysis loading page and being analysis
            pageRouter.push("/AnalysisLoading"); 
            const res = await beginAnalysis(selectedProject.user, selectedProject.project_id, analysisId, datasetIDs, token); 
            console.log(res);
            if (res) {
                console.log(`Beginning analysis ${analysisId} for project ${selectedProject.name}`);
            }
            
        } catch (error) {
            console.log("Error running analysis: ", error);
        }

    }
    /**
     * @param {}
     * @returns
     * USE-CASE: user clicks cancel edit after clicking edit on existing project
     */
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedProject({});
        setUploadedFolders([]);
    };

    function generateS3Key(project, file) {
        const user = project.user;
        const projectId = project.project_id;
        var dataset_id;
        for(const dataset in Array.from(project.datasets)){
            //console.log(Array.from(project.datasets),'ARR IS HERE')
            //console.log(project.datasets[0],'DATASET HERE')
            if(project.datasets[dataset].name===file.webkitRelativePath.split('/')[0]){
                console.log(project.datasets[dataset].dataset_id,'DATASET_ID')
                dataset_id=project.datasets[dataset].dataset_id
            }
        }
        const fileName = file.name;
        console.log(fileName)
        console.log('EXAMPLE KEY:', `${user}/${projectId}/${dataset_id}/${fileName}`)
        const key = `${user}/${projectId}/${dataset_id}/${fileName}`;
        console.log("Key:", key);
        return key;
    }
    
    async function uploadToS3Bucket(file, project, s3Client, datasetUploadBucket) {
        console.log(file)
        const MAX_RETRIES = 3;
        let retryCount = 0;
        const s3key = generateS3Key(project, file);
    
        while (retryCount < MAX_RETRIES) {
            try {
                const s3UploadCommand = new PutObjectCommand({
                    Bucket: datasetUploadBucket,
                    Key: s3key,
                    Body: file
                });
                await s3Client.send(s3UploadCommand);
                console.log(`Successfully uploaded ${s3key}`);
                return;
            } catch (error) {
                retryCount++;
                console.warn(`Failed to upload ${s3key}. Retry ${retryCount} of ${MAX_RETRIES}`);
                if (retryCount === MAX_RETRIES) {
                    console.error(`Failed to upload ${s3key} after ${MAX_RETRIES} retries.`);
                    throw error;
                    //TODO: route back to dashboard (with the same project still in edit mode, if possible)
                }
            }
        }
    }
    
    async function uploadDatasetsToS3(selectedDatasets, project, s3Client, datasetUploadBucket) {
        console.log("selected datasets:", selectedDatasets);
        const uploadPromises = [];
        for (const dataset of selectedDatasets) {
            for (const file of Array.from(dataset)) {
                //add species in right here
                if(file.name=="features.tsv.gz"){
                    let spec = findSpecies(file, setSpecies).toString();
                    dataset.species = spec;
                }
                
                uploadPromises.push(uploadToS3Bucket(file, project, s3Client, datasetUploadBucket));
            }
        }
    
        const results = await Promise.allSettled(uploadPromises);
    
        results.forEach(result => {
            if (result.status === 'rejected') {
                console.error("Error in uploading datasets to S3:", result.reason);
            }
        });
        console.log("All uploads attempts finished.");
    }    
    
    function qcCompleted() {
        const allCompleted = selectedProject && selectedProject.datasets && selectedProject.datasets.every(dataset => dataset.status === "complete");
        return allCompleted;
    }
    
    const handleSaveEdit = async() => {
        setIsDataLoading(true)
        try {
            const cachedProjects = await get('cachedProjects');
            // console.log("cached", cachedProjects)
            const existingProjects = (cachedProjects) ? cachedProjects : [];
            // console.log("existing", existingProjects)
            let resProject;
            if (editedProject._id) { //project already has a mongo _id -> we are updating + should be in cache
                console.log(editedProject._id);
                console.log(editedProject,'EDITED PROJECT HERE');
                await uploadDatasetsToS3(selectedDatasets, editedProject, s3Client, datasetUploadBucket);
                await updateProject(editedProject._id, editedProject, token);
                resProject = editedProject;
            }
            else {
                console.log("inserting new project")
                console.log(editedProject)

                var newProject = { user: user, ...editedProject, runs: []};
                //newProject.datasets an array of objects - find the correct dataset
                console.log(selectedDatasets, "SELECTED HERE")
                for (const dataset of selectedDatasets) {
                    for (const file of Array.from(dataset)) {
                        //add species in right here
                        if(file.name=="features.tsv.gz"){
                            const folderName = dataset[1].webkitRelativePath.split('/')[0];
                            const spec = await findSpecies(file, setSpecies)
                            for(var datas of newProject.datasets){
                                if(datas.name == folderName){
                                    datas.species = spec
                                    
                                }
                            }
                            
                        };
                    };
                };
                console.log(newProject.datasets, "AFTER")
                
                const resp = await createProject(newProject, token);
                setEditedProject(resp)
                const id=resp.mongo_response
                newProject=resp.project
                console.log(newProject,'NEW PROJECT IS HERE')
                console.log(newProject.datasets)
                setSelectedDatasets(newProject.datasets)
                console.log(selectedDatasets,'DATASETS HERE')
                await uploadDatasetsToS3(selectedDatasets, newProject, s3Client, datasetUploadBucket);
                resProject = {  _id: id, ...newProject }; 
            } 

            let editedProjectList = existingProjects.filter(project=> project._id !== resProject._id)
            // console.log("filtered editedProjectList:", editedProjectList)
            editedProjectList = [...editedProjectList,resProject]
            // console.log("editedProjectList:", editedProjectList)

            // Update the cache with the updated list of projects
            // set('cachedProjects', editedProjectList)
            setProjects(editedProjectList)
            setEditMode(false);
            setEditedProject({});
            setSelectedProject(resProject);
            set('selectedProject', resProject)
            setUploadedFolders([]);
            setSelectedDatasets([]);
            setIsDataLoading(false)
        } catch (error) {
            console.log("Error saving the project:", error);
        }
    };

    const handleUpdateDataset = (nicknamedDataset) => {
        //change index based on id of dataset
        for (const dataset of editedProject.datasets){
            if(dataset.name==nicknamedDataset.name){
                dataset.nickname=nicknamedDataset.nickname
            }
        }
        console.log(editedProject)
      };
    return (
        <div className='font-lora rounded-sm h-full w-full border bg-slate-50 overflow-y-scroll'>
            {isDataLoading ? (
                <MutatingDots 
                height="100"
                width="100"
                color="#4ecda4"
                secondaryColor= '#4ecda4'
                radius='12.5'
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass="flex justify-center items-center h-full"
                visible={true}
                />
            ):(<>
          {selectedProject ? (
            <>
                {!editMode ? (
                    <>
                    <div className="my-10 mx-32">
                        <h1 className=' text-2xl font-bold font-roboto text-blue mb-5 mt-2'>{selectedProject.name}</h1>
                        <strong className="text-blue my-5 font-roboto font-bold">
                                Description
                            </strong>
                        <p className='text-md my-2 w-3/4 text-black' style={{ wordWrap: 'break-word' }}>
                            {selectedProject.description}
                        </p>
                        <div className='mt-5 font-bold text-blue font-roboto'> Datasets:</div>
                        {selectedProject.datasets ? (
                            <div 
                            className='flex flex-col items-start overflow-y-scroll pt-7 rounded-lg bg-white shadow-lg'
                            style={{maxHeight:"30vh"}}
                            >
                                {selectedProject.datasets.map((dataset, index) => (
                                    <div key={dataset.name} className="p-2">
                                        <DatasetFolder dataset={dataset} editmode={editMode} onUpdateDataset={handleUpdateDataset} token={token}/>
                                    </div>
                                ))} 
                            </div>
                            ) : (
                            <div className='mt-5 mb-10' text-white="true">No Datasets Uploaded</div>
                        )}
                     <div className="bottom-0 flex justify-start mt-5">
                        <button className='border px-2 py-1 m-2 rounded-md hover:bg-cyan' onClick={handleEdit}>Edit</button>
                        <button 
                            className={`border px-2 py-1 m-2 rounded-md ${qcCompleted() ? 'hover:bg-cyan' : 'bg-gray-400 cursor-not-allowed'}`} 
                            onClick={handleRun} 
                            disabled={!qcCompleted()}
                        >
                            Run
                        </button>
                        <button className='border px-2 py-1 m-2 bg-red-400 rounded-md hover:bg-red-400/50' onClick={saveDeleted}>Delete Project</button>
                    </div>
                    <div className='mt-5 font-bold text-blue'> Runs:</div>
                        {selectedProject.runs && selectedProject.runs.length > 0 ? (
                            <div 
                            className='flex flex-col items-start overflow-y-scroll pt-7 border border-blue/30 bg-white rounded-lg shadow-lg'
                            style={{maxHeight:"30vh"}}
                            >
                                {selectedProject.runs.map(run => (
                                    <div key={run.time} className="p-2">
                                        <AnalysisRun run={run} token={token}/>
                                    </div>
                                ))} 
                            </div>
                            ) : (
                            <div className='mt-5 mb-10'>No runs yet</div>
                        )}
                    </div>
                </>) : (
                    <div className="my-20 mx-32">
                        <div>
                            <h1 className='m-2 text-2xl font-bold text-blue'>Project Name</h1>
                            <input
                                className={`border border-blue m-2 text-black rounded-sm`}
                                type="text"
                                value={editedProject.name || ''}
                                onChange={e => setEditedProject({ ...editedProject, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <p className='m-2 font-bold text-blue text-md'>Project Description</p>
                            <textarea
                                rows="4"
                                cols="50"
                                className='m-2 text-black resize overflow-auto rounded-sm border border-blue'
                                value={editedProject.description || ''}
                                onChange={e => setEditedProject({ ...editedProject, description: e.target.value })}
                            />
                        </div>
                    

                        <div>
                            <div className='m-2 font-bold text-blue'>Datasets:</div>
                            {selectedProject.datasets && (
                            <div 
                            className='mt-2 flex flex-col items-start border overflow-y-scroll'
                            style={{maxHeight:"30vh"}}
                            >
                                {selectedProject.datasets.map((dataset,index) => (
                                    <div key={dataset.name} className="p-2">
                                        <DatasetFolder dataset={dataset} editmode={editMode} onUpdateDataset={handleUpdateDataset} token={token}/>
                                    </div>
                                ))}
                            </div>
                            )}
                            {uploadedFolders.length > 0 && (
                                <div className='m-2 flex flex-wrap'>
                                    {uploadedFolders.map((dataset,index) => (
                                    <div key={dataset.name} className="w-1/4 p-2 m-1 px-2">
                                        <DatasetFolder dataset={dataset} editmode={editMode} onUpdateDataset={handleUpdateDataset} token={token}/>

                                    </div>
                                    ))}
                                </div>
                            )}
                            <input
                                className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue file:text-white
                                hover:file:bg-blue/50 
                              "
                                id="fileInput"
                                type="file"
                                onChange={handleFolderUpload}
                                webkitdirectory="true" 
                                mozdirectory="true" 
                                directory="true"
                            />
                        </div>

                        <button className={`border px-2 py-1 mt-5 m-2 rounded-md hover:bg-cyan hover:text-black`} disabled={uploadedFolders.length===0 } onClick={handleSaveEdit}>Save</button>
                        <button className='border px-2 py-1 mt-5 m-2 rounded-md hover:bg-red-400 hover:text-black' onClick={handleCancelEdit}>Cancel</button>
                    </div>
                )}
            </>
          ) : (
            <p className="">Select a project to view</p>
          )}
        </>
        )}
        
        </div>
    );
}
