import React from 'react'
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Fade } from "react-awesome-reveal";
import {MutatingDots} from 'react-loader-spinner';
import {AttentionSeeker} from "react-awesome-reveal";
import { signUp } from '../components/utils/mongoClient.mjs';
import Link from 'next/link';
import {BsFillArrowLeftCircleFill} from 'react-icons/bs';

const SignUp = () => {
    const pageRouter = useRouter();
    const [signUpInfo, setsignUpInfo] = useState({firstname:"",lastname:"",email: "", password: ""});
    const [isDataLoading,setIsDataLoading]=useState(false)
    const [usedData,setUsedData]=useState(false);
    
    const handleSubmit = async (e) => {
        setIsDataLoading(true)
        e.preventDefault()
        const body={
            firstname:signUpInfo.firstname,
            lastname:signUpInfo.lastname,
            email:signUpInfo.email,
            password:signUpInfo.password
        }
        console.log(body)
        const response = await signUp(body);
        if (response) {
            pageRouter.push('/Login');
        }
        else {
            setIsDataLoading(false);
            setUsedData(true);
        }
    };

  return (
    <div className='bg-slate-100 min-h-screen' >
        <div className='ripple-background'>
            <div className='circle xxlarge shade1'></div>
            <div className='circle xlarge shade2'></div>
            <div className='circle large shade3'></div>
            <div className='circle mediun shade4'></div>
            <div className='circle small shade5'></div>
        </div>
        <div className='h-full h-full tall:pt-3 pt-[15%]'>
            {isDataLoading ?(
                <
                MutatingDots
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
            ):(
                <>
               {usedData? (
                <>
                <AttentionSeeker effect="shakeX">
                <form className='max-w-[30vw] w-full mx-auto bg-white p-8 text-black border drop-shadow-xl' onSubmit={handleSubmit}>
                <Link href='/' className='flex items-center hover:text-blue'><BsFillArrowLeftCircleFill className='mr-1'/> Home</Link>
                <h2 className='text-4xl font-bold text-center py-4 text-black'>CELLBORG</h2>
                <div className='flex flex-col mb-4'>
                    <label>First Name</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black border-red-500 border-2' 
                        type="text" 
                        placeholder='John'
                        value={signUpInfo.firstname} 
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, firstname: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Last Name</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black border-red-500 border-2' 
                        type="text" 
                        placeholder='Smith'
                        value={signUpInfo.lastname}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, lastname: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Email</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black border-red-500 border-2' 
                        type="email" 
                        placeholder='johnsmith@gmail.com'
                        value={signUpInfo.email}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, email: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Password</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black border-red-500 border-2' 
                        type="password" 
                        placeholder='********'
                        value={signUpInfo.password}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, password: e.target.value })}
                    />
                </div>
                <div>
                    <p className="italic text-red-700 mt-2">Email already being used</p>
                </div>

                <button className='w-full py-3 mt-8 bg-blue hover:bg-blue/80 relative text-white' type="submit">Sign Up</button>
            </form>
            </AttentionSeeker>
            </>
            ) : (
              <>
            <Fade direction='up' triggerOnce={true}>
            <form className='max-w-[30vw] w-full mx-auto bg-white p-8 text-black border drop-shadow-xl' onSubmit={handleSubmit}>
            <Link href='/' className='flex items-center hover:text-blue'><BsFillArrowLeftCircleFill className='mr-1'/> Home</Link>
                <h2 className='text-4xl font-bold text-center py-4 text-black'>CELLBORG</h2>
                <div className='flex flex-col mb-4'>
                    <label>First Name</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black' 
                        type="text" 
                        placeholder='John'
                        value={signUpInfo.firstname} 
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, firstname: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Last Name</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black' 
                        type="text" 
                        placeholder='Smith'
                        value={signUpInfo.lastname}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, lastname: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Email</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black' 
                        type="email" 
                        placeholder='johnsmith@gmail.com'
                        value={signUpInfo.email}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, email: e.target.value })}
                    />
                </div>
                <div className='flex flex-col '>
                    <label>Password</label>
                    <input 
                        className='border relative bg-gray-100 p-2 text-black' 
                        type="password" 
                        placeholder='********'
                        value={signUpInfo.password}
                        onChange={(e) => setsignUpInfo({ ...signUpInfo, password: e.target.value })}
                    />
                </div>
                <button className='w-full py-3 mt-8 bg-blue hover:bg-blue/80 relative text-white' type="submit">Sign Up</button>
                <div className='text-right mt-5'>
                    <Link className='text-black opacity-50 hover:text-blue hover:opacity-100' href='/Login'>Already have an account?</Link>
                </div>
            </form>
            </Fade>
            </>
            )}
            </>
        )}
        </div>
    </div>
  )
}

export default SignUp;