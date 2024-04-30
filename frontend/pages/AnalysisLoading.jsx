import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProjectContext } from '../components/utils/projectContext';
import SocketComponent from '../components/SocketComponent';
import {MutatingDots} from 'react-loader-spinner';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';
import {SESSION_COOKIE} from '../../constants'

const AnalysisLoading = ({data: token}) => {
    const pageRouter = useRouter();
    const [ready, setReady] = useState(false);
    const {user} = useProjectContext();
    const [showForm,setShowForm]=useState(false);

    useEffect(() => {
        if (ready) {
            pageRouter.push('/VariableFeatures');
        }
    }, [ready, pageRouter]);

    return (
        <div className='w-screen h-screen flex justify-center items-center'>
            {showForm&&(
                <BugReportForm page='ANALYSIS LOADING' token={token} setShowForm={setShowForm}/>
            )}
            <div 
            className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
            onClick={()=>{setShowForm(true)}}
            >
                <GoReport />
            </div>
            <SocketComponent
                step={"Initialize"}
                user={user}
                setComplete={setReady}
            />
            <MutatingDots
                height="100"
                width="100"
                color="#4ecda4"
                secondaryColor="#4ecda4"
                radius="12.5"
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass="flex justify-center item-center"
                visible={true}
            />
            <div>Initializing Analysis...</div>
        </div>
    )
}
export async function getServerSideProps(context) {
    // Get the user's JWT access token from next's server-side cookie
    let token = "";
    try {
      const session_cookie = cookie.parse(context.req.headers.cookie);
      token = session_cookie[`${SESSION_COOKIE}`];
    }
    catch (err) {
      console.log("error getting session cookie");
    }
      return {
        props: { 
          data: token,
        }
      }
  };

export default AnalysisLoading;
