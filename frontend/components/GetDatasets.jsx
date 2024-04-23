import React,{useState, useEffect} from 'react';
import DatasetFolder from './DatasetFolder';
import { getMetadata } from './utils/mongoClient.mjs';
import { get, set } from 'idb-keyval'

 const ProjectList = (session) => {
    const[datasets,setDatasets]=useState([])
    useEffect(()=>{
        async function fetchData(session){
            const userData=localStorage.getItem(session.session.user.user_id);
            // const userData = get(session.session.user.email);
            let renderData=[];
            if(userData !== null){
                renderData=userData
                renderData=JSON.parse(renderData)
            }else{
                const renderData = await getMetadata(session.session.user.user_id);
                console.log('renderData',renderData)
                // localStorage.setItem(session.session.user.email,JSON.stringify(renderData))
                await set('user',session.session.user.user_id)
            }
        
            const datasetNames= renderData.map(obj => obj.name);
            setDatasets(datasetNames);
        }
        
        fetchData(session);

        const handleStorageChange=()=>{
            const updatedUserData=JSON.parse(localStorage.getItem(session.session.user.user_id));
            const updateUserData1 = get('user');
            const updatedDatasetNames = updatedUserData.map(obj=>obj.name);
            setDatasets(updatedDatasetNames)
        };
        window.addEventListener("addedLocalStorage",handleStorageChange);

        return ()=>{
            window.removeEventListener('addedLocalStorage',handleStorageChange);
        };
    },[session]);
    

  return (
    <div>
        {datasets.map(dataset => (
        <DatasetFolder key={dataset} name={dataset} />
      ))}
    </div>
  )
};
export default ProjectList;
