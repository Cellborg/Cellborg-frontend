import React from 'react'
import { getSession } from 'next-auth/react';
import {useState} from 'react';
import PagesNavbar from '../components/PagesNavbar';
import DeleteUserButton from '../components/DeleteUserButton';
import { getToken } from '../components/utils/security.mjs';
import {BiArrowBack} from 'react-icons/bi'
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';
import Link from 'next/link';


const Profile = ({data: session, token}) => {
  const [showForm,setShowForm]=useState(false)

  return (
    <>
    <div className="bg-white font-nunito">
      <PagesNavbar page="PROFILE"/>
      <div className='h-full '>
          <Link href='/dashboard' className="flex items-center rounded-lg w-1/6 hover:cursor-pointer my-5 p-2 border border-blue bg-blue text-white hover:bg-cyan hover:text-blue">
          <BiArrowBack/>
          Back to dashboard
          </Link>
      </div>
      <div className=''>
        <DeleteUserButton session={session} token={token}/>
      </div>
      {showForm&&
        <BugReportForm page='PROFILE' token={token} setShowForm={setShowForm}/>
      }

      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
      </div>
    </>
  )
}
export async function getServerSideProps(context) {
    // Get the user's JWT access token from next's server-side cookie
    const token = await getToken(context);
    // Get the user's session
    const session = await getSession(context);

    if (!token || !session) {
      // If user is not authenticated, redirect
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
          token
        }
      }
  };

export default Profile;
