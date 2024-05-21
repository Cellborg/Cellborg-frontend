import React,{useEffect} from 'react'
import { signIn } from 'next-auth/react'
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Fade } from "react-awesome-reveal";
import {MutatingDots} from 'react-loader-spinner';
import {AttentionSeeker} from "react-awesome-reveal";
import Link from 'next/link';
import {BsFillArrowLeftCircleFill} from 'react-icons/bs';
import { set } from 'idb-keyval'

const Login = () => {
    const pageRouter = useRouter();
    const [loginInfo, setLoginInfo] = useState({email: "", password: ""});
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [wrongCred,setWrongCred]=useState(false);

    useEffect(() => {
      /* 
      helps resolve bug of login loading screen freeze when token cookie unsuccessfully parsed
      from dashboard's getServerSideProps()
      */
      setIsDataLoading(false);
      setWrongCred(false);
    }, [pageRouter])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsDataLoading(true)

        signIn('credentials',{
            username: loginInfo.email,
            password: loginInfo.password,
            redirect: false,
        })
        .then((response) => {
            console.log(response)
            if (response.status==401) {
                setIsDataLoading(false)
                setWrongCred(true);
                console.error("error attemping to login with credentials: ", response.error)
                //pageRouter.push("/Login")
            } else {
                set('cachedProjects', [])
                set('selectedProject', null)
                pageRouter.push('/dashboard');
            }
        })
    };

    return (
        <div className="bg-slate-100 min-h-screen">         
            <div className="ripple-background">
            <div className="circle xxlarge shade1"></div>
            <div className="circle xlarge shade2"></div>
            <div className="circle large shade3"></div>
            <div className="circle mediun shade4"></div>
            <div className="circle small shade5"></div>
          </div>
          <div className="h-full tall:pt-[5%] pt-[15%]">
            {isDataLoading ? (
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
            ) : (
              <>
                {wrongCred ? (
                <>
                  {/*// Apply shakeX animation when wrongCred is true*/}
                  <AttentionSeeker effect="headShake">
                    <form
                      className={`max-w-[30vw] mx-auto bg-white p-8 border drop-shadow-xl animate__animated animate__shakeX`}
                      onSubmit={handleSubmit}
                    >
                    <Link href='/' className='flex items-center hover:text-blue'><BsFillArrowLeftCircleFill className='mr-1'/> Home</Link>
                    <h2 className="text-4xl font-bold text-center py-4 text-black">CELLBORG</h2>
                    <div className="flex flex-col mb-4 text-black">
                      <label>Username</label>
                      <input
                        className={`border relative p-2 text-black border-red-500 border-2`}
                        type="email"
                        placeholder="c2c@cellborg.com"
                        value={loginInfo.email}
                        onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col text-black">
                      <label>Password</label>
                      <input
                        className={`border relative bg-gray-100 p-2 text-black border-red-500 border-2`}
                        type="password"
                        placeholder="********"
                        value={loginInfo.password}
                        onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <p className="italic text-red-700 mt-2">Wrong username or password</p>
                    </div>
                    <button className="w-full py-3 mt-8 bg-blue hover:bg-blue/80 relative text-white" type="submit">
                      Sign In
                    </button>
                    <div className='justify-between flex mt-5'>
                      <Link className='text-black opacity-50 hover:text-blue hover:opacity-100' href='/SignUp'>Don&apos;t have an account?</Link>
                      <Link className='text-black opacity-50 hover:text-blue hover:opacity-100' href='/ForgotPassword'>Forgot Password?</Link>
                    </div>
                  </form>
                  </AttentionSeeker>
                  </>
                  
                ) : (
                  // Apply Fade animation when wrongCred is false
                  <Fade direction="up" triggerOnce={true}>
                    <form
                      className={`max-w-[30vw] w-full mx-auto bg-white p-8 border drop-shadow-xl`}
                      onSubmit={handleSubmit}
                    >
                      <Link href='/' className='flex items-center hover:text-blue'><BsFillArrowLeftCircleFill className='mr-1'/> Home</Link>
                      <h2 className="text-4xl font-bold text-center py-4 text-black">CELLBORG</h2>
                      <div className="flex flex-col mb-4 text-black">
                        <label>Username</label>
                        <input
                          className={`border relative p-2 text-black`}
                          type="email"
                          placeholder="c2c@cellborg.com"
                          value={loginInfo.email}
                          onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col text-black">
                        <label>Password</label>
                        <input
                          className={`border relative bg-gray-100 p-2 text-black`}
                          type="password"
                          placeholder="********"
                          value={loginInfo.password}
                          onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                        />
                      </div>
                      <button className="w-full py-3 mt-8 bg-blue hover:bg-blue/80 relative text-white" type="submit">
                        Sign In
                      </button>
                      <div className='justify-between flex mt-5'>
                          <Link className='text-black opacity-50 hover:text-blue hover:opacity-100' href='/SignUp'>Don&apos;t have an account?</Link>
                          <Link className='text-black opacity-50 hover:text-blue hover:opacity-100' href='/ForgotPassword'>Forgot Password?</Link>
                      </div>
                    </form>
                  </Fade>
                )}
              </>
            )}
          </div>
        </div>
      );
}

export default Login;
