import React, { useEffect, useState, useRef } from 'react';
import { CgProfile, CgPen } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useProjectContext } from './utils/projectContext';
import LogoutButton from './LogoutButton';

function PagesNavbar({ page }) { 
  const router = useRouter();
  const { user, userData } = useProjectContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandProfile, setExpandProfile] = useState(false);

  const expandProfileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandProfileRef.current && !expandProfileRef.current.contains(event.target)) {
        setExpandProfile(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  const toggleProfile = () => {
    setExpandProfile(!expandProfile);
    console.log(user, userData.firstname, userData.lastname);
  };

  const loadProfile = () => {
    return (
      <div className="relative flex items-center" ref={expandProfileRef}>
        <CgProfile className="text-3xl" onClick={toggleProfile} />
        {expandProfile && (
          <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 bg-gray-200 border border-gray-300 p-5 flex flex-col justify-center items-center w-[150px]">
            {userData && (
              <div className="mb-4 mt-3 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full text-base">
                 {`${userData.firstname} ${userData.lastname}`}
              </div>
            )}
            <div className="mb-2">
              <CgPen className="text-2xl absolute top-2 right-2" onClick={() => router.push('/Profile')} />
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

    return (
      <div className="shadow-md bg-neutral-100 p-4 w-screen">
      <div className="flex justify-between items-center w-full">
    
        <div className="text-blue text-3xl font-bold flex items-center mx-20">
          {page}
        </div>
    
        <div className="flex justify-end mx-20">
          <div className="text-blue hover:cursor-pointer">
            {loadProfile()}
          </div>
        </div>
      </div>
    </div>
    
      );
}

export default PagesNavbar