import React from 'react';

const RerunModal = ({ handleRerun, handleView, handleLeave, handleEnter, handleClick}) => {
  return ( 
    <div className="fixed inset-0 flex items-center justify-center z-50" onClick={handleClick}>
      <div className="bg-white p-4 shadow-lg rounded-lg" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <h1>Would you like to rerun QC or view your results?</h1>
        <div className="flex justify-end mt-5">
          <button onClick={handleRerun} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">Rerun</button>
          <button onClick={handleView} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">View results</button>
        </div>
      </div>
    </div>
  );
};

export default RerunModal;
