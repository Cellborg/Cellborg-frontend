

import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';
import { socketio_analysis } from '../../constants';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  // Create and manage the socket connection here
  const socket = io(socketio_analysis);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
