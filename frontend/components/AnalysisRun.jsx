import React,{useState} from 'react';
import { GiDna2 } from 'react-icons/gi';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { useRouter } from 'next/router';
import { useProjectContext } from './utils/projectContext';
import { beginAnalysis, getProject } from './utils/mongoClient.mjs';

export const AnalysisRun = ({run, token}) => {
  const router = useRouter();
  const {analysisid, time, step} = run;
  console.log(analysisid, time, step);

  const {selectedProject, analysisId, setAnalysisId} = useProjectContext();
  const [showInfo,setShowInfo] = useState(false)

  const handleOnDrag = (e) => {
    console.log(e.target.id);
  }

  const handleRunButtonClick = () => {
    console.log("RUN TOKEN:", token)
    if (step !== "complete") {
      console.log("Running analysis with analysis id of:", analysisid);

      const runAnalysis = async () => {
        await setAnalysisId(analysisid);
        console.log("selected project is", selectedProject);
        console.log("selected analysis is", analysisId);
        
        const analysisRequest = {
          user: selectedProject.user,
          project: selectedProject.project_id,
          // datasets: selectedProject.datasets.map(dataset => dataset.name),
          analysis: analysisid
        };
        const datasets = selectedProject.datasets.map(dataset => dataset.name);
        console.log(analysisRequest);
        console.log("RUN TOKEN:\n", token)
        const reqToken = token;
        const res = await beginAnalysis(selectedProject.user, selectedProject.project_id, analysisid,  datasets, token);
        if (res) {
          // maybe update project in mongo w/ new run time
          console.log("res", res);
          const fetchedProject = await getProject(selectedProject._id, token);
          const lastStep = (fetchedProject.runs.find(r => r.analysisid == analysisid)).step;
          console.log('last step complete:', lastStep);
          let path = '/VariableFeatures?analysis=true';
          switch (lastStep) {
            case 'VariableFeatures': break;
            case 'PCA': path = '/PCA'; break;
            case 'Clusters': path = '/cluster'; console.log("cluster!"); break;
            case 'GeneFeatures': path = '/FeaturePlots'; break;
          }
          console.log('path is:', path);
          router.push(path);
        }
        else {
          console.log("error");
        }

        // const response = await performQualityControl(selectedProject.user,
        //   selectedProject.name, name);
        // if (response) {
        //   console.log(response);
        // }
      }; runAnalysis();
      }
    else {
      console.log(`Run has already been completed for ${analysisid}... Showing results`);
    }

  };

  return (
    <div
      id={analysisid}
      className='flex flex-col relative'
      draggable
      onDragStart={(e) => handleOnDrag(e)}
    >
      <div className='flex items-center space-x-2'>
        <div className='relative'>
          {showInfo && (
            <div className='bg-blue border rounded-md p-2 absolute -translate-y-full whitespace-nowrap'>
              <div className="text-white">{time}</div>
            </div>
          )}
          <IoIosInformationCircleOutline
            className='w-4 h-4 cursor-pointer'
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          />
        </div>
        <GiDna2 className='w-5 h-5' />
        <div className='text-sm text-black'>
            {time} <br/> {analysisid} <br/> {step}
        </div>
        {step !== 'complete' ? (
          <div className="mt-2">
            <button
              onClick={handleRunButtonClick}
              className="bg-yellow-500 text-white py-0.5 px-1.5 rounded-md ml-3"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <button
              onClick={handleRunButtonClick}
              className="bg-green-500 text-white py-0.5 px-1.5 rounded-md ml-3"
            >
              ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// export default AnalysisRun;