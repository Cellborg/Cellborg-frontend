import React, { useState } from 'react'
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {IoMdArrowRoundBack} from 'react-icons/io';
import { handleFinishQC } from '../components/utils/qcClient.mjs';
import { useProjectContext } from '../components/utils/projectContext';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const QualityControlForm = ({data: session, token}) => {
    console.log(session);
    const router = useRouter();
    const { task, dataset,name } = router.query;
    const { selectedProject } = useProjectContext();

    const [minValue, setMinValue] = useState(200);
    const [maxValue, setMaxValue] = useState(2500);
    const [mtValue, setMtValue] = useState(5);
    const [showForm,setShowForm]=useState(false);
    async function performQC() {
        console.log(`Performing Quality Control on ${dataset}`);
        try {
            router.push(`/loading?task=${task}&dataset=${dataset}&name=${name}&&min=${minValue}&max=${maxValue}&mt=${mtValue}`);
        } catch (error) {
            console.log("Error performing quality control: ", error);
        }
    }
    const backToDashboard=(router)=>{
        console.log('going back to dashboard')
        router.push('/dashboard')
    }

  return (
    <>
        <div 
        className="w-screen h-screen flex items-center p-8 justify-center space-y-4 w-1/2 background"
        >
            {showForm&&(
                <BugReportForm page='QUALITY CONTROL FORM' token={token} setShowForm={setShowForm}/>
            )}
            <div 
            className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
            onClick={()=>{setShowForm(true)}}
            >
                <GoReport />
            </div>
            <div className='w-1/2 bg-white rounded-xl shadow-xl p-10 space-y-5'>
                <div 
                className='w-fit px-2 flex items-center cursor-pointer mb-10 space-x-2 hover:bg-blue rounded-full hover:text-white transition duration-100'
                onClick={()=>{
                    backToDashboard(router)
                    handleFinishQC(selectedProject.user, selectedProject.project_id, dataset, router, token)
                }}
                >
                    <IoMdArrowRoundBack/>
                    <h2>Back to Dashboard</h2>
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="font-bold font-md">nFeature_RNA greater than: </label>
                    <input
                        className=" border rounded p-2"
                        type="number"
                        value={minValue}
                        onChange={(e) => setMinValue(Math.max(200, Math.min(2500, Number(e.target.value))))}
                    />
                    <input
                        className=""
                        type="range"
                        min="1"
                        max="5000"
                        value={minValue}
                        onChange={(e) => setMinValue(Number(e.target.value))}
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <label className="font-bold font-md">nFeature_RNA less than: </label>
                    <input
                        className="border rounded p-2"
                        type="number"
                        value={maxValue}
                        onChange={(e) => setMaxValue(Math.max(200, Math.min(2500, Number(e.target.value))))}
                    />
                    <input
                        className=""
                        type="range"
                        min="1"
                        max="5000"
                        value={maxValue}
                        onChange={(e) => setMaxValue(Number(e.target.value))}
                    />
                </div>

                <div className="flex flex-col space-y-1">
                    <label className="font-bold font-md">% mitochondrial genes less than: </label>
                    <input
                        className="border rounded p-2"
                        type="number"
                        min="1"
                        max="100"
                        value={mtValue}
                        onChange={(e) => setMtValue(Math.max(1, Math.min(100, Number(e.target.value))))}
                    />
                    <input
                        className=""
                        type="range"
                        min="1"
                        max="100"
                        value={mtValue}
                        onChange={(e) => setMtValue(Number(e.target.value))}
                    />
                </div>
                <div className='flex justify-center w-full h-full'>
                    <button className='mt-10 ml-3 w-1/2 py-2 h-full border border-blue text-lg hover:bg-blue hover:text-white hover:-translate-y-1 hover:scale-110 transition duration-100 ease-out' onClick={performQC}>Perform QC on {name}</button>
                </div>
            </div>
        </div>

    </>
  )
};

export async function getServerSideProps(context) {
    const datasetName = context.query.dataset;
    const session = await getSession(context);
    if (!session) {
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
            dataset: datasetName
        }
    }
}

export default QualityControlForm;
