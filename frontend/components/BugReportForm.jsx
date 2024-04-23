import {sendReportBug} from '../components/utils/mongoClient.mjs';
import { TiDelete } from "react-icons/ti";
import {useState} from 'react';
import { useProjectContext } from '../components/utils/projectContext';

const BugReportForm=({page,token, setShowForm})=>{
    const {selectedProject, user, userData, analysisId, items,clusters} = useProjectContext();
    const [formInfo,setFormInfo]=useState({page:page,user:user, project:selectedProject, userData:userData, analysisId:analysisId, items:items, clusters:clusters, desc:''})
    async function handleSubmit(event){
        event.preventDefault();
        const resp=await sendReportBug(formInfo,token)
        console.log(resp)
        setShowForm(false)
      }
      function handleX(){
        setShowForm(false)
      }
    return(
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-4 shadow-lg rounded-lg  drop-shadow-2xl">
                <div 
                className='w-full flex justify-end text-2xl hover:cursor-pointer'
                onClick={()=>{handleX()}}
                >
                    <TiDelete className='text-indigo-400'/>
                </div>
                <form className=' '>
                    <div className='flex flex-col space-y-5'>
                    <label 
                        className='text-xl text-indigo-600'
                        >Description of the Issue:
                    </label>
                    <textarea 
                        className='border border-indigo-600 rounded-md text-indigo-600'
                        rows='10' 
                        cols='50'
                        placeholder='Please provide context for the issue including how to possibly recreate it'
                        onChange={(e)=>setFormInfo({...formInfo, desc:e.target.value})}
                        >
                    </textarea>
                    </div>
                    <button 
                    className='mt-10 w-full flex items-center justify-center border border-indigo-600 bg-indigo-600 text-white rounded-md px-5 py-2 hover:bg-white hover:text-indigo-600'
                    onClick={handleSubmit}
                    >
                        Report Bug
                    </button>

                </form>
            </div>
        </div>
        
    )
}
export default BugReportForm;