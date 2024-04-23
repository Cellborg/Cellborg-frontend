import { useEffect } from 'react';
import { useSocket } from './utils/socketContext';

const SocketComponent = ({ user, step, setComplete, handleFeaturePlotReady }) => {
  const socket = useSocket();

  useEffect(() => {
    socket.connect();
    socket.emit('RegisterConnectionAnalysis', user);
    console.log("Emitting analysis register connection for", user);

    const handleStepComplete = (data) => {
      const { user, project, analysisId, step } = data;
      console.log(`step ${step} completed for ${user}: `, data);
      setComplete && setComplete(true);
    };

    const handleFeauturePlotLoading = (data) => {
      const { user, project, analysisId, completed_step, gene_name } = data;
      console.log(`${gene_name} feature plot ready for ${user}: `, data);

      //send signal to parent component to load plot
      handleFeaturePlotReady && handleFeaturePlotReady(gene_name);
    }

    socket.on(`${step}_Complete`, handleStepComplete);

    socket.on('FeaturePlot_ready', handleFeauturePlotLoading);

    return () => {
      socket.disconnect();
    };
  }, [socket, user, step, setComplete, handleFeaturePlotReady]);

  return null;
};

export default SocketComponent;