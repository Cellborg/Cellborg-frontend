import React, { useState } from 'react';
import {BsFillArrowRightCircleFill, BsFillArrowLeftCircleFill,BsCircle} from 'react-icons/bs';
const PlotCarousel = ({plots }) => {
  const [activePlotIndex, setActivePlotIndex] = useState(0);

  const handlePrev = () => { 
    if(activePlotIndex==0){
      setActivePlotIndex(plots.length-1)
    }
    else{
      setActivePlotIndex(activePlotIndex-1)};
    }
  const handleNext = () => {
    if(activePlotIndex==plots.length-1){
      setActivePlotIndex(0);
    }
    else{
      setActivePlotIndex(activePlotIndex+1)
    }
  };
  
  return (
    <>
      <div className=''>
              <div className='flex items-center space-x-5'>
                <BsFillArrowLeftCircleFill 
                className='w-10 h-10 text-blue transition duration-100 hover:text-cyan hover:-translate-y-1 hover:scale-110 cursor-pointer'
                onClick={handlePrev}
                />
                <div 
                className='w-full h-full p-5 flex items-center justify-center'
                >
                    {plots[activePlotIndex]}
                </div>
                <BsFillArrowRightCircleFill 
                className='w-10 h-10 text-blue duration-100 transition hover:text-cyan hover:-translate-y-1 hover:scale-110 cursor-pointer'
                onClick={handleNext}
                />
              </div>
              <div className='flex items-center justify-center'>
                <div className='bg-cyan/50 rounded-full mt-5 flex items-center justify-center py-1 space-x-2 w-1/5'>
                {plots.map((plot, idx) => (
                    <BsCircle key={idx} className={`${activePlotIndex==idx?`bg-blue`:``} rounded-full transition ease-in duration-100`}/>
                    ))}
                </div>
              </div>
          </div>
    </>
  );
};

export default PlotCarousel;
