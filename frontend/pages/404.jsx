import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import BannerSVG from '../public/banner2.svg'
import Image from 'next/image';
import dynamic from 'next/dynamic';
const HomeLayout = dynamic(() => import('../components/HomeLayout'), {ssr: false});

const Custom404 = () => {
  return (
    <>
    <HomeLayout>
    <div className='font-roboto scroll-smooth h-screen w-screen bg-slate-100 overflow-y-scroll' > 
      {/*Overlay */}
      <div className="bg-blue w-full h-1/2 flex items-center border border-blue drop-shadow-lg relative">
        <div className="w-full h-1/5 top-9/10 bg-blue p-4 flex items-center">
          <div className='text-white w-2/5 h-1/2 bg-blue'>
            <h2 className='text-5xl font-bold text-right '>Genomics Unleashed</h2>
              <TypeAnimation className='py-5 text-right text-4xl'
                sequence={[
                  2000,
                  'Bulk RNA Sequencing',
                  2000,
                  'Single Cell RNA Sequencing',
                  2000,
                  "ATAC Sequencing",
                  2000,
                  "Spatial Transcriptomics",
                  2000,
                  "Coming soon :)",
                 ]}
                wrapper='span'
                repeat={Infinity}
                style={{'text':'right', 'float':'right'}}
              />
            </div>
            <div className="w-3/6 h-full absolute right-32 -mb-20">
            <Image className="w-full h-full inset-x-0 top-0" src={BannerSVG.src} alt="Banner" width={0} height={0} style={{ width: '100%', height: '100%' }} />
            </div> 
          </div>
        </div>
      {/* 404 Page Not Found */}
      <div className="flex h-1/2 w-full justify-center items-center">
        <h1 className="text-6xl font-bold text-blue">404 Page Not Found</h1>
      </div>

    </div>
    </HomeLayout>
    </>
  )
}

export default Custom404