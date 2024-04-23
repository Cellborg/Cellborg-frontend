import React from 'react';
import { useRouter } from 'next/router';

export const HomeButton = () => {
    const router = useRouter();

    const handleNextClick = () => {
      router.push('/dashboard')
    };
  return (
    <div className="flex justify-end"> 
      <button className="mr-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border h-10 mt-3" 
        style={{ backgroundColor: 'green' }} onClick={handleNextClick}>
            Home
        </button>
    </div>
  )
}
