import React, { useState } from 'react'
import { useProjectContext } from './utils/projectContext';
import { s3Client } from './utils/s3client.mjs';
import {PutObjectCommand} from "@aws-sdk/client-s3"; 
import { useRouter } from 'next/router';
import { MutatingDots } from 'react-loader-spinner';
import { createProject, newAnalysisId, beginAnalysis, updateProject, prepPA} from './utils/mongoClient.mjs';
import { AnalysisRun } from './AnalysisRun';
import {datasetUploadBucket} from '../constants.js';
import dynamic from 'next/dynamic';
import { get, set, update } from 'idb-keyval';
import {findSpecies} from './FindSpecies.js';
import { IoIosInformationCircleOutline } from 'react-icons/io';

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
    const [showUploadDatasetInfo, setShowUploadDatasetInfo] = useState(false);
    const { setProjects, user, selectedProject, setSelectedProject, setAnalysisId, projects } = useProjectContext();

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
        if (selectedFolder.length < 3){return false; }
        console.log('selected folder here',selectedFolder)
        let requiredbarcodes = false;
        let requiredfeatures = false;
        let requiredmatrix = false;
        //impliments above checks
        for (let i = 0; i < selectedFolder.length; i++) {
            const fileName = files[i].name;
            console.log(fileName)
            if (fileName.endsWith('barcodes.tsv.gz')) {
                if(requiredbarcodes){ //if barcodes already true that means there is a duplicate
                    return false;
                }
                requiredbarcodes = true;

            }
            if (fileName.endsWith('features.tsv.gz')) {
                if(requiredfeatures){ //if features already true that means there is a duplicate
                    return false;
                }
                requiredfeatures = true;
            }
            if (fileName.endsWith('matrix.mtx.gz')) {
                if(requiredmatrix){ //if matrix already true that measnt there is a duplicate
                    return false;
                }
                requiredmatrix = true;
            }
            if (requiredbarcodes && requiredfeatures && requiredmatrix) {
                return true;
            }
        }
        console.log("made it past length check", selectedFolder.length)
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
     * begins processing and annotations run
     * USE-CASE: user clicks pa button after qc
     */
    async function handlePARun(){
        try{
            //retrieves dataset-ID's
            const datasetIDs = selectedProject.datasets.map(dataset => dataset.dataset_id);
            console.log("Datasets: ", datasetIDs);
            
            //push user to loading page, reuse qc loading cause no need to create a new one
            const res = await prepPA(selectedProject.user, selectedProject.project_id, token)
            if(res){
                pageRouter.push(`/loading?task=${res.taskArn}`);
                console.log('Successfully sent request to start PA');
            }else{
                console.log('ERROR: FAILED TO SEND REQUEST TO START PA')
            }
        }catch(error){
            console.log("Error running analysis: ", error);
        }
    }
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
        //make sure to only empty viewbox when canceling project creation
        if(selectedProject.name===''){
            setSelectedProject(null);
        }
    };
    /**
     * @param {Object} project {user: str, name: str, datasets: list(Objects), runs:[], project_id:str}{
     * @param {Object} files
     * @returns {String} key
     * USE-CASE: generates s3 key (path) 
     */
    function generateS3Key(project, file) {
        const user = project.user;
        const projectId = project.project_id;
        var dataset_id;
        for(const dataset in Array.from(project.datasets)){
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
    
    /**
     * 
     * @param {Object} file 
     * @param {Object} project 
     * @param {Object} s3Client 
     * @param {String} datasetUploadBucket 
     * @returns 
     * USE-CASE: uploads datasets to s3 bucket
     * REFERENCE: uploadDatasetstoS3
     */
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
    
    /**
     * 
     * @param {List} selectedDatasets 
     * @param {Object} project 
     * @param {Object} s3Client 
     * @param {String} datasetUploadBucket 
     * USE-CASE: uploads datasets to s3
     */
    async function uploadDatasetsToS3(selectedDatasets, project, s3Client, datasetUploadBucket) {
        console.log("selected datasets:", selectedDatasets);
        const uploadPromises = [];
        for (const dataset of selectedDatasets) {
            for (const file of Array.from(dataset)) {
                if(file.name.endsWith('barcodes.tsv.gz') || file.name.endsWith('features.tsv.gz') || file.name.endsWith('matrix.mtx.gz')){
                    uploadPromises.push(uploadToS3Bucket(file, project, s3Client, datasetUploadBucket));
                }
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
    
    /**
     * 
     * @returns {boolean}
     * USE-CASE: checks if qc has been completed on all datasets in selectedProject
     */
    function qcCompleted() {
        const allCompleted = selectedProject && selectedProject.datasets && selectedProject.datasets.every(dataset => dataset.status === "complete");
        return allCompleted;
    }
    
    /**
     * USE-CASE: user clicks save either for new project or edited project
     */
    const handleSaveEdit = async() => {
        setIsDataLoading(true)
        try {
            const cachedProjects = await get('cachedProjects');
            const existingProjects = (cachedProjects) ? cachedProjects : [];
            let resProject;
            if (editedProject._id) { //project already has a mongo _id -> we are updating + should be in cache
                console.log(editedProject._id);

                
                for (const dataset of selectedDatasets) {//find species for all new datasets
                    for (const file of Array.from(dataset)) {
                        console.log('CHECKING SPECIES HERE')
                        console.log(file.name);
                        console.log(file.name.endsWith('features.tsv.gz'))
                        if(file.name.endsWith('features.tsv.gz')){
                            const folderName = dataset[1].webkitRelativePath.split('/')[0];
                            const spec = await findSpecies(file)
                            if(spec){
                                for(var datas of editedProject.datasets){
                                    if(datas.name == folderName){
                                        datas.species = spec // tag dataset with species
                                        
                                    }
                                }
                            }else{
                                throw Error("No species found")
                            }
                            
                        };
                    };
                };
                //update mongo and return tagged project with id's for new datasets
                const res = await updateProject(editedProject._id, editedProject, token);
                //update edited project with finished updated project
                setEditedProject(res.project)
                newProject=res.project
                setSelectedDatasets(res.project.datasets)
                //upload tagged dataset to s3
                await uploadDatasetsToS3(selectedDatasets, newProject, s3Client, datasetUploadBucket);
                resProject = editedProject; 
            }
            else { //if its a new project
                console.log("inserting new project")
                console.log(editedProject)


                console.log(user)
                var newProject = { user: user, ...editedProject, runs: []};
                //newProject.datasets an array of objects - find the correct dataset
                for (const dataset of selectedDatasets) {
                    for (const file of Array.from(dataset)) {
                        if(file.name=="features.tsv.gz"){
                            const folderName = dataset[1].webkitRelativePath.split('/')[0];
                            const spec = await findSpecies(file)
                            if(spec){
                                for(var datas of newProject.datasets){
                                    if(datas.name == folderName){
                                        datas.species = spec //tag dataset here
                                        
                                    }
                                }
                            }else{
                                throw Error("No species found")
                            }
                            
                        };
                    };
                };
                
                //attach id's and update mongo
                const resp = await createProject(newProject, token);
                
                //update edited project with tagged project
                setEditedProject(resp.project)
                const id=resp.mongo_response
                newProject=resp.project


                console.log(newProject.datasets)
                setSelectedDatasets(newProject.datasets)
                //upload to s3 with tagged project
                await uploadDatasetsToS3(selectedDatasets, newProject, s3Client, datasetUploadBucket);
                resProject = {  _id: id, ...newProject }; 
            } 

            //update local cache and context
            let editedProjectList = existingProjects.filter(project=> project._id !== resProject._id)
            editedProjectList = [...editedProjectList,resProject]

            // Update the cache with the updated list of projects
            //set('cachedProjects', editedProjectList)
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

    /**
     * 
     * @param {String} nicknamedDataset 
     * USE-CASE: user selects a nickname for dataset
     */
    const handleUpdateDataset = (nicknamedDataset) => {
        for (const dataset of editedProject.datasets){
            if(dataset.dataset_id==nicknamedDataset.dataset_id){ //check dataset using id for uniqueness
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
                            className='flex flex-col items-start overflow-y-scroll rounded-lg bg-white shadow-lg'
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
    
    {selectedProject.status !== 'PAcomplete' ? (
        <button 
            className={`border px-2 py-1 m-2 rounded-md ${qcCompleted() ? 'hover:bg-cyan' : 'bg-gray-400 cursor-not-allowed'}`} 
            onClick={handlePARun} 
            disabled={!qcCompleted()}
        >
            Run Processing and Annotations
        </button>
    ) : (
        <button 
            className='border px-2 py-1 m-2 rounded-md hover:bg-cyan' 
            disabled={!qcCompleted()}
        >
            Run Analysis
        </button>
    )}
    
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
                            className={`mt-2 flex flex-col items-start overflow-y-scroll`}
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
                            <div className="flex items-center">
                                <label
                                    className=" w-fit text-sm
                                    mr-4 py-2 px-4
                                    rounded-full
                                    font-semibold
                                    bg-blue text-white
                                    hover:bg-blue/50 
                                    hover:cursor-pointer
                                "
                                >
                                    <input 
                                    type="file" 
                                    id="fileInput" 
                                    className="hidden" 
                                    onChange={handleFolderUpload}
                                    webkitdirectory="true" 
                                    mozdirectory="true" 
                                    directory="true"

                                    />
                                Upload Sample
                                </label>
                                <div>
                                {showUploadDatasetInfo&&(
                                    <div className = "bg-slate-100  border-blue border-2 text-xs rounded-md p-2 absolute -translate-y-full whitespace-nowrap">
                                        <h1>Ensure your uploaded folder contains:</h1>
                                        <ul className="pt-2 pb-2 pl-3 font-roboto">
                                            <li>barcodes.tsv.gz</li>
                                            <li>features.tsv.gz</li>
                                            <li>matrix.mtx.gz</li>
                                        </ul>
                                        <h1> Prefixes (e.g. <span className="font-roboto">control_barcodes.tsv.gz</span>) are okay.</h1>
                                    </div>
                                )}
                                <IoIosInformationCircleOutline
                                    className='w-6 h-6 cursor-pointer'
                                    onMouseEnter={() => setShowUploadDatasetInfo(true)}
                                    onMouseLeave={() => setShowUploadDatasetInfo(false)}
                                />
                                </div>
                            </div>
                        </div>

                        <button className={`border px-2 py-1 mt-5 m-2 rounded-md hover:bg-cyan hover:text-black ${uploadedFolders.length===0&&selectedProject.datasets.length===0 ? "cursor-not-allowed": "cursor-pointer"}`} disabled={uploadedFolders.length===0&&selectedProject.datasets.length===0} onClick={handleSaveEdit}>Save</button>
                        <button className='border px-2 py-1 mt-5 m-2 rounded-md hover:bg-red-400 hover:text-black' onClick={handleCancelEdit}>Cancel</button>
                    </div>
                )}
            </>
          ) : (
            <>
            {projects.length===0?
            (
                <p>No projects to view</p>
            ):
            (
                <p>Select a project to view</p>
            )}
            </>
          )}
        </>
        )}
        
        </div>
    );
}
