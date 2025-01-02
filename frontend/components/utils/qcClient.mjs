import {qccleaupURL, analysisCleanUpURL, paCleanupURL} from '../../constants.js';

async function handleFinishQC(user, project, dataset, router, token) {
    try {
      const requestBody = {
        user: user,
        project: project,
        dataset: dataset,
      };
      const response = await fetch(qccleaupURL, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        console.log("Successfully cleaned up QC", response);
      } else {
        console.error('Failed to clean up QC.', response);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

async function handleFinishPA(user, project, router, token){
  try{
    const requestBody = {
      user: user,
      project: project,
    };
    const response = await fetch(paCleanupURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    if(response.ok) {
      console.log("Successfully cleaned up PA", response);
    }else {
      console.error('Failed to clean up PA', response);
    }
  }catch(error){
    console.error('An error occurred:', error);
  }
}
async function handleFinishAnalysis(user, project, analysisId, router, token) {
    try {
      const requestBody = {
        user: user,
        project: project,
        analysisId: analysisId,
      };
      const response = await fetch(analysisCleanUpURL, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        console.log("Successfully cleaned up Analysis resources.", response);
        router.push('/dashboard');
      } else {
        console.error('Failed to clean up Analysis.', response);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  export { handleFinishQC, handleFinishAnalysis, handleFinishPA }