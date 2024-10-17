import React, { useState, useEffect,useRef } from 'react';
import { motion } from 'framer-motion';
import { IoMdArrowDroprightCircle } from 'react-icons/io';
import { Fade, Slide } from 'react-awesome-reveal';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { TypeAnimation } from 'react-type-animation';
import AnaylsisPNG from '../public/hero/analysis.png';
import CloudPNG from '../public/hero/cloud.png';
import CodingPNG from '../public/hero/coding.png';
import { FaRegDotCircle } from "react-icons/fa";
import HeroForm from '../components/HeroForm';
import Rplot from '../public/hero/rplot.svg';
import UTD from '../public/hero/UTDLogo.svg';
import UTSW from '../public/hero/UTSW.svg'
import UCI from '../public/hero/UCI.svg'
import UCLA from '../public/hero/UCLA.svg';
import Image from 'next/image';

const ClusteringPlot = dynamic(() => import('../components/Demo/DemoClusterPlot'), {ssr: false});
const ReceptorLigandPlot = dynamic(() => import('../components/Demo/DemoReceptorLigandPlot'), {ssr: false});
const OrderCellsPlot = dynamic(() => import('../components/Demo/DemoOrderCellsPlot'), {ssr: false,});
const PseudotimePlot = dynamic(() => import('../components/Demo/DemoPseudotimePlot'), {ssr: false});
const GeneDemoComponent = dynamic(() => import('../components/Demo/GeneDemoComponent'), {ssr: false});

const Hero = () => {
  const router = useRouter();
  const [selectedPlot, setSelectedPlot] = useState('Clustering');
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const ref = useRef();
  const isVisible = useIsVisible(ref);
  const [dropDowns, setDropDowns] = useState({
    QC: false,
    Processing: false,
    Exploration: false
  });
  const [mousePos, setMousePos] = useState({});
  const [mouseInside, setMouseInside] = useState(false);
  const [chartMenu,setChartMenu]=useState(false);
  const [showPsuedotime, setShowPsuedotime] = useState(false);
  const [showDemo,setShowDemo]=useState(false);
  const [pricingOption,setPricingOption]=useState('professional')
  useEffect(()=>{
    console.log('Visible is here',isVisible)
  },[isVisible])
  useEffect(() => {
    const handleMouseMove = (event) => {
        setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
    };
}, []);

  const mouseEnter = () => {
    setMouseInside(true);
  };

  const renderPlot = () => {
    switch (selectedPlot) {
      case 'Clustering':
        return <ClusteringPlot />;
      case 'Gene':
        return <GeneDemoComponent />
        //return <GenePlot />;
      case 'PseudoTime':
        if (showPsuedotime) {
          return <PseudotimePlot />
        } else {
          return <OrderCellsPlot setPsuedotime={setShowPsuedotime}/>
        }
      case 'Receptor_Ligand':
        return <ReceptorLigandPlot />;
      default:
        return <p className='absolute inset-0 flex justify-center items-center z-10'>Please select a plot below.</p>;
    }
  }

  const mouseLeave = () => {
    setMouseInside(false);
  };

  const isMouseBound = (e) => {
      const box = e.currentTarget.getBoundingClientRect();
      return box.top < e.clientY && box.bottom > e.clientY && box.left < e.clientX && box.right > e.clientX;
  };

  const updateCirclePosition = (e) => {
    if (isMouseBound(e)) {
      const box = e.currentTarget.getBoundingClientRect();
      const xCoord = e.clientX - box.left;
      const yCoord = e.clientY - box.top;
      setCirclePosition({ x: xCoord, y: yCoord });
    }
  };

  const toggleDropdown = (name) => {
    setDropDowns(prevState => ({
      ...prevState,
      [name]: !prevState[name]
    }));
  };

  const variants = {
    default: {
      x: mousePos.x - 52,
      y: mousePos.y - 52,
      mixBlendMode: 'difference'
    },
    box: {
      x: circlePosition.x - 12,
      y: circlePosition.y - 12
  },
  };

  const boxes = [
    { key:1,title: 'Code-free', image:CodingPNG.src, description: 'Experience effortless efficiency—our platform is intuitive for all users, requiring no coding expertise.' },
    { key:2,title: 'In-depth Analysis', image:AnaylsisPNG.src, description: 'Utilize a state-of-the-art analysis pipeline to power your research requirements with comprehensive capabilities.' },
    { key:3,title: 'Cloud-based', image:CloudPNG.src, description: 'Our proprietary cloud-based system minimizes expenses and maximizes processing speeds for seamless analysis.' }
  ];

  const steps=[
    {key:1,title:'Upload',step:'01',description:'Input raw or processed data in a variety of file formats.'},
    {key:2,title:'Process',step:'02',description:'Walk through our proprietary and validated pre-processing pipeline.'},
    {key:3,title:'Explore',step:'03', description:'Conduct in depth analysis of your data and share your findings.'}
  ]
  const pricingAcademia=[
    {title:'Academic Lite',description:'For teams <5 people, with basic analysis',price:'$0'},
    {title:'Academic Premium',description:'For large teams or groups who need to build websites',price:'$12.98'}
  ]
  const pricingIndustry=[
    {title:'Basic Account',description:'For small teams or groups who need to build websites',price:'$0'},
    {title:'Business Account',description:'For medium teams or group who need to build websites',price:'$9.87'},
    {title:'Premium Account',description:'For large teams or group who need to build websites',price:'$12.98'}
  ]
  const pricingClinical=[
    {title:'Basic Account',description:'For a single client or team who needs to build websites',price:'$0'},
    {title:'Business Account',description:'For small teams or groups who need to build websites',price:'$6.00'},
    {title:'Premium Account',description:'For large teams or group who need to build websites',price:'$9.99'}
  ]
  function useIsVisible(ref) {
    const [isIntersecting, setIntersecting] = useState(false);
  
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
      );
  
      observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }, [ref]);
  
    return isIntersecting;
  }

  return (
    <div className='font-lora scroll-smooth h-screen w-screen bg-white overflow-y-scroll overflow-x-hidden' > 
    <div id='Home'></div>
    <div id='top' className='sticky top-0 w-full h-full drop-shadow-lg flex items-center justify-between'>
      <div className=' w-1/3 h-1/5 text-lg items-center justify-center mx-10 overflow-visible'>
        <div className='overflow-visible text-nowrap '>
          {/*Banner header*/}
          <span
          className='text-5xl font-nunito text-on-white-landing'
            >Decoding&nbsp;
          </span>
              <TypeAnimation
              sequence={[
              // Same substring at the start will only be typed out once, initially
              'single cell RNA sequencing.',
              1000, // wait 1s before replacing "Mice" with "Hamsters"
              'ATAC sequencing.',
              1000,
              'spatial transcriptomics.',
              1000,
              'modern biology.',
              1000
            ]}
            speed={25}
            className='text-5xl font-robot font-bold text-nowrap bg-gradient-to-br from-banner-grad-top to-banner-grad-bot text-transparent bg-clip-text'
            repeat={0}
          />
        </div>
        <p className='text-xl my-5 text-on-white-landing font-nunito'>We develop next-generation sequencing analysis platforms for the non-computational biologist.</p>
        <div className='flex  items-center '>
         <button 
         className='border border-cyan px-5 py-2 rounded-sm text-cyan hover:cursor-pointer hover:text-white hover:bg-cyan font-nunito'
         onClick={()=>(router.push('#whySection'))}
         > 
         <a href='#whySection'>Learn More</a>
         </button>
        </div>
      </div>
      <div className='border border-black w-3/5 h-full bg-blue flex items-center justify-center'>
        {/*Banner image ---- blob*/}
          <img className='w-full h-full pt-32 pr-20' src={Rplot.src} alt='UMAP Plot'/>
      </div>
    </div>
    {/*WHY CELLBORG SECTION */}
    <div id='whySection' className='relative bg-white py-20 px-10'>
      <p className='flex items-center justify-center font-nunito text-xl font-bold text-indigo-700 my-5'>WHY CELLBORG?</p>
      <h1 className='flex items-center justify-center mb-20 text-3xl text-on-white-landing w-full font-nunito sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl'>Biological insights with&nbsp;<span className='text-bold text-rose font-lora font-bold'>3 ingredients</span></h1>
      <div className='flex items-center justify-center rounded-lg p-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {boxes.map((box, idx) => (
            <div
              key={box.key}
              className="relative overflow-hidden lg:w-full h-full z-3"
            >
            <div className='text-on-white-landing relative z-10 whitespace-normal items-center flex flex-col justify-between h-full py-4 font-nunito'>
              <img src={box.image} className='w-1/3 pl-5 '/>
              <h1 className=' mx-10 sm:pt-20 md:pt-10 pt-5 text-xl sm:text-3xl md:text-2xl lg:text-4xl font-bold'>{box.title}</h1>
              <p className='mx-10 pb-10 lg:pt-10 pt-5 text-md text-center'>{box.description}</p>
            </div>
            </div>
          ))}
        </div>
      </div>
      {/*DEMO SECTION */}
      <hr className="h-px mb-20 mt-20 bg-slate-950 border-0"></hr>

      <div className='w-full my-20'>
        <h1 className=' mb-5 flex items-center justify-center font-bold text-indigo-700 font-nunito text-xl'>How it works</h1>
        <h1 className='flex items-center justify-center text-4xl font-nunito text-on-white-landing mb-20'>It&apos;s as easy as</h1>
        <div className='flex items-center justify-end'>
          <Fade direction='down' triggerOnce={true} className=' w-1/3'>
            </Fade>
            <div className='my-10 p-5 w-fit grid grid-cols-1 grid-rows-3 gap-32'>
              {steps.map((step)=>(
                <Slide direction='down' triggerOnce={true} key={step.key}>
                  <div 
                  className='flex items-center overflow-visible font-nunito'
                  >
                    <div>
                      <FaRegDotCircle className='text-2xl text-zinc-400 hover:text-cyan' />
                    </div>
                    <h1 className='px-10 text-4xl text-zinc-200 font-roboto text-6xl'>{step.step}</h1>
                    <div className='text-on-white-landing '>
                      <h1 className='text-xl pb-5 font-bold font-roboto '>{step.title}</h1>
                      <p className='text-lg text-zinc-400'>{step.description}</p>
                    </div>
                  </div>
                </Slide>
              ))}
            </div>
        </div>
        <hr className="h-px mb-20 mt-20 bg-slate-950 border-0" id='Demo'></hr>
        <h1 className=' mb-5 flex items-center justify-center font-bold text-indigo-700 font-nunito text-xl'>Demo</h1>
        <h1 className='flex items-center justify-center text-4xl font-nunito text-on-white-landing mb-20'>Take a look</h1>
        <div className='flex flex-col lg:flex-row w-full h-4/5 my-20 font-nunito'>
          <div className='lg:w-1/2'>
            <div >
             {/*Quality Control dropdown */}
              <div 
              className='mt-10 flex items-center cursor-pointer text-2xl'
              onClick={() => toggleDropdown('QC')}
              >
                <IoMdArrowDroprightCircle className={`rounded-full hover:bg-black hover:text-white ${dropDowns.QC? 'rotate-90 text-white bg-black':''} ease-out duration-500 transition mx-10`}/>
                <h2>Quality Control</h2>
              </div>
              {dropDowns.QC && (
                        <motion.div
                            className='w-fit border border-cyan p-2 rounded-md my-5 mx-10 text-lg text-light leading-relaxed'
                            variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            initial='hidden'
                            animate='visible'
                            transition={{ duration: 0.2, delay: 0.1 }}
                        >
                            Doublet removal
                        </motion.div>
                    )}
            {/*Processing dropdown */}
            <div 
            className='mt-10 flex items-center cursor-pointer text-2xl'
            onClick={() => toggleDropdown('Processing')}
            >
              <IoMdArrowDroprightCircle className={`rounded-full hover:bg-black hover:text-white ${dropDowns.Processing? 'rotate-90 text-white bg-black':''} ease-out duration-500 transition mx-10`}/>
              <h2>Processing</h2>
            </div>
            {dropDowns.Processing &&(
              <>
              <motion.div
              className='w-fit border border-cyan p-2 rounded-md my-5 mx-10 text-lg text-light leading-relaxed'
              variants={{
                hidden:{opacity:0,y:10},
                visible:{opacity:1,y:0},
              }}
              initial='hidden'
              animate='visible'
              transition={{duration:0.2,delay:0.1}}
              > 
              Linear and nonlinear dimensionality reduction (PCA, tSNE, UMAP)
              </motion.div>
              </>
            )}
            {/*Exploration dropdown */}
            <div
            className='my-10 flex items-center cursor-pointer text-2xl'
            onClick={() => toggleDropdown('Exploration')}
            >
              <IoMdArrowDroprightCircle className={`rounded-full hover:bg-black hover:text-white ${dropDowns.Exploration? 'rotate-90 text-white bg-black':''} ease-out duration-500 transition mx-10`}/>
              <h2>Exploration</h2>
            </div>
            {dropDowns.Exploration &&(
              <>
              <motion.div
              className='w-fit border border-cyan p-2 rounded-md my-5 mx-10 text-lg text-light leading-relaxed'
              variants={{
                hidden:{opacity:0,y:10},
                visible:{opacity:1,y:0},
              }}
              initial='hidden'
              animate='visible'
              transition={{duration:0.2,delay:0.1}}
              > 
              <p>Feature, Dot, and Violin Plots</p>
              <p>Differentially Expressed Gene Finder</p>
              <p>Heatmaps</p>
              <p>Psuedotime</p>
              <p>Receptor Ligand Interactions</p>
              </motion.div>
              </>
            )}
          </div>
        </div>
        <div className='w-full lg:ml-auto'>
        <div  
          ref={ref} 
          className={`
            ${selectedPlot === 'Clustering' ? 'lg:-ml-10 lg:w-[110%]' : ''}
            ${selectedPlot === 'PseudoTime' ? 'lg:ml-5' : ''}
            ${selectedPlot === 'Receptor_Ligand' ? 'sm:overflow-visible' : ''}
            ${selectedPlot === 'Gene' ? '' : ''}
            h-[70vh] flex justify-center items-center overflow-hidden relative
          `} 
        >
          {/* Overlay message for non-large screens */}
          <div className={`lg:hidden absolute inset-0 flex justify-center items-center z-10`}>
            <p className="text-center px-4">Please view the website on desktop to visualize the demo.</p>
          </div>

          {/* Plot rendering for large screens */}
          <div className='hidden lg:block absolute inset-0 flex justify-center items-center z-10'>
            {isVisible && renderPlot()}
          </div>
        </div>
            {/*Demo options for large screens */}
            <div className='flex flex-col lg:flex-row lg:ml-10 mt-5 space-x-10 text-xl justify-center hidden lg:flex'>
              <button 
                  onClick={() => setSelectedPlot('Clustering')} 
                  className={`text-blue ${selectedPlot === 'Clustering' ? 'border-b-2 border-cyan' : 'hover:text-blue/50'}`}
              >
                  Clustering
              </button>
              <button 
                  onClick={() => setSelectedPlot('Gene')} 
                  className={`text-blue ${selectedPlot === 'Gene' ? 'border-b-2 border-cyan' : 'hover:text-blue/50'}`}
              >
                  Gene
              </button>
              <button 
                  onClick={() => setSelectedPlot('PseudoTime')} 
                  className={`text-blue ${selectedPlot === 'PseudoTime' ? 'border-b-2 border-cyan' : 'hover:text-blue/50'}`}
              >
                  PseudoTime
              </button>
              <button 
                  onClick={() => setSelectedPlot('Receptor_Ligand')} 
                  className={`text-blue ${selectedPlot === 'Receptor_Ligand' ? 'border-b-2 border-cyan' : 'hover:text-blue/50'}`}
              >
                  Receptor-Ligand
              </button>
          </div>

          {/*Demo options for medium and small screens */} {/* Not supporting demo on mobile devices at this point*/}
          { /*
          <div className='lg:hidden flex justify-center w-full'>
            <div className='w-full flex flex-col items-center justify-center'>
              <div 
                className='w-1/2 border rounded-md bg-slate-100 text-blue p-2 space-x-2 mt-2'
                onClick={() => setChartMenu(!chartMenu)}
              >
                <div className='flex items-center justify-center'>
                  <span>Charts</span>
                  <BiSolidDownArrow />
                </div>
              </div>
              {chartMenu && (
                  <div className='relative w-1/2 bg-slate-100 text-blue border rounded-md p-2 mt-1'>
                    <h2 onClick={() => setSelectedPlot('Clustering')} className={`${selectedPlot=='Clustering'?'bg-cyan rounded-md px-2':''}`}>Clusters</h2>
                    <h2 onClick={() => setSelectedPlot('Gene')} className={`${selectedPlot=='Gene'?'bg-cyan rounded-md px-2':''}`}>Gene</h2>
                    <h2 onClick={() => setSelectedPlot('PseudoTime')} className={`${selectedPlot=='PseudoTime'?'bg-cyan rounded-md px-2':''}`}>PseudoTime</h2>
                    <h2 onClick={() => setSelectedPlot('Receptor_Ligand')} className={`${selectedPlot=='Receptor_Ligand'?'bg-cyan rounded-md px-2':''}`}>Receptor Ligand</h2>
                  </div>
              )}
            </div>
          </div> */}

        </div>
      <div>
      </div>
      </div>

      </div>
      <hr className="h-px mb-10 bg-slate-950 border-0" id='Pricing'></hr> 
      <h2 className='flex items-center justify-center font-roboto text-xl font-bold text-indigo-700 my-5'> Beta Access</h2>
      <div className='w-full mt-10 mb-20'>
        <h1 className='flex items-center justify-center font-roboto text-on-white-landing text-4xl w-full'>Interest Form</h1>
      </div>
       {/*Pricing options */}
        {/* <div className='flex items-center justify-center font-roboto text-2xl hover:cursor-pointer font-nunito'>
          <div 
          className='px-5 py-2 border border-indigo-700 rounded-sm text-indigo-700 hover:bg-indigo-700 hover:text-white'
          onClick={()=>{setPricingOption('free')}}
          >
            <h1>Free Account</h1>
          </div>
          <div 
          className='px-5 py-2 border border-indigo-700 rounded-sm text-indigo-700 hover:bg-indigo-700 hover:text-white'
          onClick={()=>{setPricingOption('professional')}}
          >
            <h1>Professional Account</h1>
          </div>
        </div>  */}
      
      {/*Pricing Grid */}
        {/* {pricingOption==='free'&&(
          <div className='flex items-center justify-center my-10'>
            <div className='border border-indigo-600 rounded-sm text-center py-10 px-5 m-10 text-on-white-landing'>
                <h2 className='text-2xl font-roboto p-5 '>Academic Lite</h2>
                <p className='text-lg font-roboto mb-20'>For teams less than 5 people, with basic analysis</p>
                <h1 className='text-4xl font-roboto'>$0</h1>
                  <button className='border border-violet-600 rounded-md font-roboto m-10 text-lg py-2 px-5'>
                    CREATE FREE ACCOUNT
                  </button>
              </div>
          </div>
        )} */}
        {pricingOption==='professional'&&(
          <div className='flex items-center justify-center my-10'>
            <HeroForm/>
          </div>
        )}
       {/*  {pricingOption=='academia' && (
          <div className='flex items-center justify-center my-10 '>
            {pricingAcademia.map((option)=>(
              <div className='border rounded-sm text-center py-10 px-5 m-10 text-on-white-landing'>
                <h2 className='text-2xl font-roboto p-5'>{option.title}</h2>
                <p className='text-lg font-roboto mb-20'>{option.description}</p>
                <h1 className='text-4xl font-roboto'>{option.price}</h1>
                <p>{option.pricedesc}</p>
                {option.price=='$0'?
                  <button className='border border-violet-600 rounded-md font-roboto m-10 text-lg py-2 px-5'>
                    CREATE FREE ACCOUNT
                  </button>
                  :
                  <button className='border font-roboto m-10 text-lg bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg py-2 px-5 text-white'>
                    START FREE TRIAL
                  </button>
                  }
              </div>
            ))}
          </div>
        )}
        {pricingOption=='industry' && (
          <div className='flex items-center justify-center my-10 '>
            {pricingIndustry.map((option)=>(
              <div className='border rounded-sm text-center py-10 px-5 m-10 text-on-white-landing'>
                <h2 className='text-2xl font-roboto p-5'>{option.title}</h2>
                <p className='text-lg font-roboto mb-20'>{option.description}</p>
                <h1 className='text-4xl font-roboto'>{option.price}</h1>
                <p>{option.pricedesc}</p>
                {option.price=='$0'?
                  <button className='border border-violet-600 rounded-md font-roboto m-10 text-lg py-2 px-5'>
                    CREATE FREE ACCOUNT
                  </button>
                  :
                  <button className='border font-roboto m-10 text-lg bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg py-2 px-5 text-white'>
                    START FREE TRIAL
                  </button>
                  }
              </div>
            ))}
          </div>
        )}
        {pricingOption=='clinical' && (
          <div className='flex items-center justify-center my-10 '>
            {pricingClinical.map((option)=>(
              <div className='border rounded-sm text-center py-10 px-5 m-10 text-on-white-landing'>
                <h2 className='text-2xl font-roboto p-5'>{option.title}</h2>
                <p className='text-lg font-roboto mb-20'>{option.description}</p>
                <h1 className='text-4xl font-roboto'>{option.price}</h1>
                <p>{option.pricedesc}</p>
                {option.price=='$0'?
                  <button className='border border-violet-600 rounded-md font-roboto m-10 text-lg py-2 px-5'>
                    CREATE FREE ACCOUNT
                  </button>
                  :
                  <button className='border font-roboto m-10 text-lg bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg py-2 px-5 text-white'>
                    START FREE TRIAL
                  </button>
                  }
              </div>
            ))}
          </div>
        )} */}



      <hr className="h-px mb-10 mt-32 bg-slate-950 border-0 w-full"></hr>

      <h1 className='text-3xl font-nunito'>Trusted by reseachers at</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  gap-6 w-full my-10'>
        <div className='aspect-square flex items-center justify-center'>
          <img src={UTD.src}/>
        </div>
        <div className='aspect-square flex items-center justify-center px-5'>
          <img src={UTSW.src}/>
        </div>
        <div className='aspect-square flex items-center justify-center'>
          <img src={UCI.src}/>
        </div>
        <div className='aspect-square flex items-center justify-center'>
          <img src={UCLA.src}/>
        </div>
      </div> 
    </div>

    <div 
    className='relative bg-blue w-screen sm:p-20 sm:p-5 sm:text-center sm:items-center text-white flex flex-col md:flex-row lg:justify-between cursor-none'
    onMouseEnter={mouseEnter}
    onMouseLeave={mouseLeave}
    >
    <div className='cursor-none font-nunito'>
      <h1 className='text-4xl w-full cursor-none my-10 pointer-events-none'>
        Accelerate the future of your biological exploration.
        <span>
          {mouseInside&&
          <Fade className='mix-blend-difference'>
            <motion.div 
              className={`fixed top-0 left-0 rounded-full bg-cyan w-52 h-52 cursor-none border-2 border-cyan`}
              initial={mousePos}
              variants={variants}
              animate='default'
              style={{zIndex: 999}}
              /* style={{
                position: 'absolute', // Set to absolute position
                top: mousePosition.y - 52 + 'px', // Adjust for the circle's radius
                left: mousePosition.x - 52 + 'px', // Adjust for the circle's radius
              }} */
              />
          </Fade>
          }
        </span>
      </h1>
    </div>

    <button 
      onClick={() => (router.push('/SignUp'))} 
      className="w-1/5 p-3 border border-white h-full text-4xl py-5 mx-10 text-white w-fit cursor-none hidden lg:block"
    >
      Get Started
    </button>
    </div>
  </div> 
  )
}

export default Hero
