
import {useState} from 'react';
import {sendAccountRequest} from './utils/mongoClient.mjs';
import { IoIosCheckmarkCircle } from "react-icons/io";

const HeroForm=()=>{
    const [formInfo,setFormInfo]=useState({fname:'',lname:'',org:'',email:'',type:'', desc:''})

    const [formSent,setFormSent]=useState(false);
    const [formWrong,setFormWrong]=useState(false);
    const [sendWrong,setSendWrong]=useState(false);

    function checkForm(){
        const {fname,lname,org,email,type,desc}=formInfo
        if(fname=='' || lname==''||org==''||email==''||type==''||desc==''){
            return false
        }else{
            return true
        }
    }
    async function handleSubmit(event){
        event.preventDefault();
        const valid=checkForm()
        console.log(formInfo)
        if(valid){
            const resp=await sendAccountRequest(formInfo)
            if(resp.insertedId){
                setFormWrong(false)
                setFormSent(true)
            }else{
                setSendWrong(true)
            }
        }else{
            setFormWrong(true)
        }
    }
    return(
        <div className='my-10 font-nunito border px-10 py-10 rounded-sm border-indigo-600'>
            {formWrong&&
            <div className='italic font-nunito flex items-center justify-center text-red-500 text-xl'>
                <h1>Make sure to fill out each field!</h1>
            </div>
            }
            {!formSent?
                <form 
                className=''
                >
                    <div className='flex items-center space-x-5'>
                        <div className='flex flex-col'>
                            <label 
                            className=''
                            >First name</label>
                            <input 
                            className='border border-blue rounded-md p-2'
                            type="text"
                            placeholder="John"
                            value={formInfo.fname}
                            onChange={(e) => setFormInfo({ ...formInfo, fname: e.target.value })}
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label> Last name</label>
                            <input
                            className='border border-blue rounded-md p-2'
                            type='text'
                            placeholder='Doe'
                            value={formInfo.lname}
                            onChange={(e)=> setFormInfo({...formInfo,lname:e.target.value})}
                            />
                        </div>
                        
                    </div>
                    <div className='pt-5 flex flex-col'>
                        <label 
                        className=''
                        >Organization </label>
                        <input
                        className='border border-blue rounded-md p-2'
                        type='text'
                        placeholder='Cellborg'
                        value={formInfo.org}
                        onChange={(e)=>setFormInfo({...formInfo,org:e.target.value})}
                        />
                    </div>
                    <div className='pt-5 flex flex-col'>
                        <label 
                        className=''
                        >Email:</label>
                        <input
                        className='border border-blue rounded-md p-2 w-fit'
                        type='email'
                        placeholder='johndoe@gmail.com'
                        value={formInfo.email}
                        onChange={(e)=>setFormInfo({...formInfo,email:e.target.value})}
                        />
                    </div>
                    <div className=' pt-5 space-y-2'>
                        <label 
                        className='flex items-center justify-center'
                        >Choose an organization type:</label>
                        <div className='flex items-center justify-center text-2xl'>
                            <div 
                            className={`rounded-md border px-5 py-2 border-indigo-600 hover:text-white hover:bg-indigo-600 hover:cursor-pointer ${formInfo.type=='academic'? 'bg-indigo-600 text-white': 'bg-white text-indigo-600'}`}
                            onClick={()=>(setFormInfo({...formInfo,type:'academic'}))}
                            >
                                <h1>Academic</h1>
                            </div>
                            <div 
                            className={`rounded-md  border px-5 py-2 border-indigo-600 hover:text-white hover:bg-indigo-600 hover:cursor-pointer ${formInfo.type=='industry'? 'bg-indigo-600 text-white': 'bg-white text-indigo-600'}`}
                            onClick={()=>(setFormInfo({...formInfo,type:'industry'}))}
                            >
                                <h1>Industry</h1>
                            </div>
                            <div 
                            className={`rounded-md  border px-5 py-2  border-indigo-600 hover:text-white hover:bg-indigo-600 hover:cursor-pointer ${formInfo.type=='clinical'? 'bg-indigo-600 text-white': 'bg-white text-indigo-600'}`}
                            onClick={()=>(setFormInfo({...formInfo,type:'clinical'}))}
                            >
                                <h1>Clinical</h1>
                            </div>
                        </div>
                    </div>
                    <div className='pt-5 flex flex-col'>
                        <label>Tell us about yourself</label>
                        <textarea 
                        className='border border-blue rounded-md'
                        rows='4' 
                        cols='50'
                        onChange={(e)=>setFormInfo({...formInfo, desc:e.target.value})}
                        >

                        </textarea>
                    </div>

                    <button 
                    className='mt-10 w-full flex items-center justify-center border border-indigo-600 bg-indigo-600 text-white rounded-md px-5 py-2 hover:bg-white hover:text-indigo-600'
                    onClick={handleSubmit}
                    >
                        Send Info
                    </button>
                </form>
                :
                <div className='text-2xl'>
                    <h1>Form has been sent :&#41;</h1>
                    <div className='flex items-center justify-center text-5xl text-indigo-600'>
                        <IoIosCheckmarkCircle className='my-5'/>
                    </div>
                </div>
            } 

        </div>
    )
}
export default HeroForm