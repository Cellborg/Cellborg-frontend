import { useState } from 'react';
import Link from 'next/link';
import {AiOutlineMenu, AiOutlineClose} from 'react-icons/ai';
import Logo from '../public/favicon.ico';
import Image from 'next/image';

const Navbar = ({page}) => {
    const [nav, setNav] = useState(false)
    
    const handleNav = () => {
        setNav(!nav)
    }
  return (
    <div className='z-50 bg-white fixed left-0 top-0 w-full ease-in duration-300 flex justify-between items-center p-2'>
      <div className='w-full px-4 flex items-center text-white justify-between'>
            <Link href='/'>
                <div className='flex items-center'>
                    <Image className="w-full h-14" width={'50'} height={'50'} src={Logo.src} alt="Cellborg"/>
                    <h1 className='flex items-center justify-center font-lora mx-3 font-bold text-3xl'>Cellborg <span className='font-roboto text-cyan text-xl ml-2 text-center mt-5'>Beta</span></h1>
                </div>
                
            </Link>
        <ul className='hidden sm:flex '>
            <li className={`p-6 text-md font-lora ${page=='About Us'? 'transition scale-125':'opacity-75'}`}>
                <Link href='/AboutUs'>About Us</Link>
            </li>
            <li className={`p-6 text-md font-lora ${page=='News'? 'transition scale-125':'opacity-75'}`}>
                <Link href='/News'>News</Link>
            </li>
            <li className={`p-6 text-md font-lora ${page=='Login'? 'transition scale-125':'opacity-75'}`}>
                <Link href='/Login'>Login</Link>
            </li>
            <li className={`p-6 text-md font-lora ${page=='Sign Up'? 'transition scale-125':''}`}>
                <Link href='/SignUp' className='text-cyan'>Get Started</Link>
            </li>
        </ul>

        {/* Mobile Button */}
        <div className='block sm:hidden z-10' onClick={handleNav}>
            {nav ? <AiOutlineClose size={20}/> : 
            <AiOutlineMenu size={20} />}
        </div>
        {/* Mobile Menu */}
        <div 
            className= {`absolute top-0 ${nav ? 'left-0' : 'left-full'} right-0 bottom-0 flex justify-center items-center w-full h-screen sm:hidden bg-black text-center ease-in duration-300`}
        >
            <ul>
                <li className='p-4 text-3xl hover:text-gray-500'>
                    <Link href='/'>Home</Link>
                </li>
            </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar;
