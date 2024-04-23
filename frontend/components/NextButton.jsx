import React from 'react';
import { useRouter } from 'next/router';

export const NextButton = ({path, complete}) => {
    const router = useRouter();

    const handleNextClick = () => {
      console.log(path)
      router.push(`${path}`)
    };
  return (
    <div className='flex items-center justify-center w-full h-full'> 
      <button className={`${complete ? 'bg-blue hover:scale-110 hover:transition-y-1 delay-50 transition ease-in-out' : 'bg-blue/50 cursor-not-allowed'} border border-blue py-2 px-4 rounded-lg w-full h-full`} onClick={handleNextClick}>Next Page</button>
    </div>
  )
}
