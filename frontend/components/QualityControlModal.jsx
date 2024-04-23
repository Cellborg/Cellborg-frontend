import React from 'react';

const QualityControlModal = ({ selectedProject, handleDefault, handleManual, handleLeave, handleEnter, handleClick,
}) => {
  return ( 
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleClick}>
      <div className="bg-white p-4 shadow-lg rounded-lg" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <h1>Choose your QC parameters for {selectedProject.name}</h1>
        <div className="flex justify-center mt-5">
          <button onClick={handleDefault} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">Default</button>
          <button onClick={handleManual} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">Manual</button>
        </div>
      </div>
    </div>
  );
};

export default QualityControlModal;
