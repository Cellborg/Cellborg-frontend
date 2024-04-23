import { openDB, deleteDB, wrap, unwrap } from 'idb';

const createProjectDatabase = async () => {
    try {
      const db = await openDB('ProjectDatabase', 1, {
        upgrade(db) {
          projectstore = db.createObjectStore('projects');
          db.createObjectStore('user');
          db.createObjectStore('userData');
          db.createObjectStore('analysisId');
          db.createObjectStore('selectedProject');
        },
      });
      console.log('Project database created successfully');
    } catch (error) {
      console.error('Error creating project database:', error);
    }
  };

  const setIndexedDB = async (storeName, object) => {
    try {
        const db = await openDB('ProjectDatabase', 1);
        
        // Start a read-write transaction on the specified object store
        const tx = db.transaction(storeName, 'readwrite');
        
        // Get the object store
        const store = tx.objectStore(storeName);

        // Put the object into the object store
        store.put(object);

        // Complete the transaction
        await tx.done;
        
        console.log('Project database updated successfully');
    } catch (error) {
        console.error('Error updating project database:', error);
    }
};

export { setIndexedDB, createProjectDatabase}