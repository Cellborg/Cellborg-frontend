import { useState, useEffect } from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import Logo from '../public/particle.png';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {AiOutlineMenu, AiOutlineClose} from 'react-icons/ai';

const tabs = [
    { id: "Home", label: "Home", type: "anchor" },
    { id: "Demo", label: "Demo", type: "anchor" },
    { id: "AboutUs", label: "About Us", type: "page", href: "/AboutUs" },
    { id: "News", label: "News", type: "page", href: "/News"},
    { id: "Login", label: "Login", type: "page", href: "/Login" },
    { id: "SignUp", label:"Get Started", type:"page",href:"/SignUp" }
];

const AnimatedNav = () => {
    const router = useRouter(); 
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

    const findInitialTab = () => {
        const matchingTab = tabs.find(tab => tab.href === router.pathname || tab.id === router.asPath.split('#')[1]);
        return matchingTab ? matchingTab.id : tabs[0].id;
    };

    const tabClick = (tabId, href, type) => {
        setActiveTab(tabId);
        if (type === "page" && href) {
            router.push(href);
        } else {
            router.push(`/#${tabId}`);
        }
        if(mobileMenuVisible){
            setMobileMenuVisible(!mobileMenuVisible)
        }
        console.log("Clicked on: ", tabId);
    }

    let [activeTab, setActiveTab] = useState(findInitialTab());

    useEffect(() => {
        const handleRouteChange = (url) => {
            const matchingTab = tabs.find(tab => tab.href === url);
            if (matchingTab) setActiveTab(matchingTab.id);
        };
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router]);

  return (
    <div className='z-50 bg-white fixed left-0 top-0 w-full ease-in duration-300 flex justify-between items-center p-2 drop-shadow-xl'>
        <div className='w-full px-4 flex items-center text-white justify-between lg-hidden lg-hidden'>
            <Link href='/' className=''>
                <div className='w-1/2 flex items-center'>
                    <Image className="w-1/2" width={50} height={50} src={Logo.src} alt="Cellborg"/>
                    <h1 className='flex items-center justify-center font-lora mx-3 font-bold text-3xl text-on-white-landing'>Cellborg <span className='font-roboto text-rose text-xl ml-2 text-center mt-5'>BETA</span></h1>
                </div>
            </Link>
            <div className='flex space-x-3 hidden lg:flex '>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => tabClick(tab.id, tab.href, tab.type)}
                        className={`${
                            activeTab === tab.id ? "" : "hover:opacity-50"
                        } relative rounded-sm px-3 py-1.5 text-md font-medium text-on-white-landing 
                        outline-2 outline-sky-400 focus-visible:outline`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute inset-0 rounded-sm bg-cyan"
                            />
                        )}
                        <span className='relative z-10'>{tab.label}</span>
                    </button>
                ))}
            </div>
            {/*Mobile Menu Icon */}
            <button
            onClick={()=>setMobileMenuVisible(!mobileMenuVisible)}
            className="text-white text-2xl  lg:hidden"
            >
                {!mobileMenuVisible && <AiOutlineMenu />}
            </button>
            {/*Mobile Menu*/}
            <div 
            className= {`absolute top-0 ${mobileMenuVisible ? 'right-0' : 'right-full'} bottom-0 flex justify-center items-center w-full h-screen bg-blue/90 text-center ease-in duration-300 `}
            >
                <div 
                className='absolute right-5 top-5'
                onClick={()=>setMobileMenuVisible(!mobileMenuVisible)}
                >
                    <AiOutlineClose size={25}/> 
                </div>
                <div className="flex flex-col items-center text-white space-y-3 border border-cyan p-5">
                    {tabs.map((tab) => (
                        tab.id!="Login" && tab.id!="SignUp"?(
                        <button
                            key={tab.id}
                            onClick={() => tabClick(tab.id, tab.href, tab.type)}
                            className={`${
                                activeTab === tab.id ? "" : "hover:opacity-50"
                            } relative rounded-sm px-3 py-1.5 text-4xl text-white font-onest
                            outline-2 outline-sky-400 focus-visible:outline`}
                            >
                            
                            <span className='relative z-10'>{tab.label}</span>
                        </button>): null
                    ))}
                    </div>
            </div>
        </div>

    </div>
  )
}

export default AnimatedNav