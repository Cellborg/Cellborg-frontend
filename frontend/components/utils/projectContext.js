import React, { createContext, useContext, useEffect, useState } from 'react';
import { get, set, update } from 'idb-keyval';

const ProjectContext = createContext();

const getInitialState = async (key, defaultValue) => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
    const context = await get(key);
    if (context !== undefined) {
      try {
        return context;
      } catch (e) {
        console.error(`Error parsing local storage data for ${key}:`, e);
      }
    }
  }
  return defaultValue;
};

const setIndexedDB = async (key, value) => {
  try {
    await set(key, value);
  } catch (e) {
    console.error(`Error setting idb data for ${key}:`, e);
  }
};

export const useProjectContext = () => {
  return useContext(ProjectContext);
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState("");
  const [userData, setUserData] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [items, setItems] = useState(null);
  const [selectedProject, setSelectedProject] = useState({});
  const [clusters, setClusters] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const selectedProjectData = await getInitialState('selectedProject', {});
      setSelectedProject(selectedProjectData);

      const user = await getInitialState('user', "");
      setUser(user);

      const userData = await getInitialState('userData', "");
      setUserData(userData);

      const analysisIdData = await getInitialState('analysisId', "");
      setAnalysisId(analysisIdData);

      const cachedProjectsData = await getInitialState('cachedProjects', []);
      setProjects(cachedProjectsData);

      const clustersData = await getInitialState('clusters', {});
      setClusters(clustersData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject && Object.keys(selectedProject).length !== 0)
      setIndexedDB('selectedProject', selectedProject);
  }, [selectedProject]);

  useEffect(() => {
    if (user !== "")
      setIndexedDB('user', user);
  }, [user]);

  useEffect(() => {
    if (userData !== "")
      setIndexedDB('userData', userData);
  }, [userData]);

  useEffect(() => {
    if (clusters && Object.keys(clusters).length !== 0)
      setIndexedDB('clusters', clusters);
  }, [clusters]);

  useEffect(() => {
    if (analysisId !== "")
      setIndexedDB('analysisId', analysisId);
  }, [analysisId]);

  useEffect(() => {
    if (Array.isArray(projects) && projects.length !== 0)
      setIndexedDB('cachedProjects', projects);
  }, [projects]);

  useEffect(() => {
    setIndexedDB('clusters', clusters);
  }, [clusters]);

  useEffect(() => {
    setIndexedDB('clusters', clusters);
  }, [clusters]);

  return (
    <ProjectContext.Provider value={{
      projects,
      setProjects,
      user,
      setUser,
      userData,
      setUserData,
      selectedProject,
      setSelectedProject,
      analysisId,
      setAnalysisId,
      items,
      setItems,
      clusters,
      setClusters
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
