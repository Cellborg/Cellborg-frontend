import React from 'react';

const DeleteConfirmationModal = ({ selectedProject, handleDelete, exitDeleted }) => {
  return ( 
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 shadow-lg rounded-lg ">
        <h1>Are you sure you want to delete project {selectedProject.name}?</h1>
        <div className="flex justify-end mt-5">
          <button onClick={exitDeleted} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">No</button>
          <button onClick={handleDelete} className="mx-10 px-3 rounded-md hover:text-black hover:bg-cyan">Yes</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
