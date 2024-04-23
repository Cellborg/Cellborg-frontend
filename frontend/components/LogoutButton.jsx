import { signOut, useSession } from "next-auth/react";
import React from 'react';

const LogoutButton = () => {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/Login" }); // Redirect to the login page after signout
  };

  return (
    <div className="mb-4 bg-red-500 text-white px-2 py-1 rounded-lg">
      {session ? (
        <button onClick={handleSignOut} className="text-white">Sign Out</button>
      ) : (
        <p>You are not signed in</p>
      )}
    </div>
  );
}

export default LogoutButton;
