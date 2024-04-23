import { signOut } from "next-auth/react";
import React from 'react';
import { useProjectContext } from '../components/utils/projectContext';
import { deleteProject, deleteUser } from "./utils/mongoClient.mjs";
import { deleteProjectFromS3 } from "./utils/s3client.mjs";

const DeleteUserButton = ({session, token}) => {
  const { userData, projects } = useProjectContext();
  const userId = userData._id;

  const deleteUserProjects = async () => {
    for (let i = 0; i < projects.length; i++ ) {
    //delete the project in MongoDB
      console.log("deleting project: ", projects[i]._id);
      deleteProject(projects[i]._id, projects[i], token);
      deleteProjectFromS3(projects[i]);
    }
  }

  const handleDelete = () => {
    deleteUserProjects();
    deleteUser(userId, token);
    signOut({ callbackUrl: "/Login" }); // Redirect to the login page after signout
  };

  return (
    <div className="mb-4 bg-red-500 text-white px-2 py-1 rounded-lg h-14 flex items-center justify-center">
      {session ? (
        <button onClick={handleDelete} className="text-white">Delete Account</button>
      ) : (
        <p>You are not signed in</p>
      )}
    </div>
  );
}

export default DeleteUserButton;