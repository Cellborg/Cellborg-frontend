import {useState} from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { getSession } from 'next-auth/react';
import { handleFinishAnalysis } from '../components/utils/qcClient.mjs';
import { useProjectContext } from '../components/utils/projectContext';
import { useRouter } from 'next/router';
import { getToken } from '../components/utils/security.mjs';
import { GoReport } from "react-icons/go";
import BugReportForm from '../components/BugReportForm';

const AnalysisOptions = ({data: session, token}) => {
  console.log(session);
  const router = useRouter();
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const { selectedProject, analysisId } = useProjectContext();
  const [showForm,setShowForm]=useState(false);

  async function beginReceptorLigandAnalysis() {

  } 
  const analysisChoices = [
    {
      title: 'Heatmap',
      background: '/heatmap_bg.webp',
      link: '/Heatmap'
    },
    {
      title: 'Pseudotime',
      background: '/trajectory-bg.png',
      link: '/Psuedotime'
    },
    {
      title: 'Feature Expression',
      background: '/feature_plot-bg.jfif',
      link: '/FeaturePlots'
    },
    {
      title: 'Receptor-Ligand',
      background: '/grayed-out.jpg',
      link: '/ReceptorLigand'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {showForm&&(
        <BugReportForm page='ANALYSIS OPTIONS' token={token} setShowForm={setShowForm}/>
      )}
      <div 
      className='absolute rounded-full bg-red-400 right-10 bottom-10 text-4xl p-2 hover:cursor-pointer hover:border hover:border-black'
      onClick={()=>{setShowForm(true)}}
      >
        <GoReport />
      </div>
      <Head>
        <title>Lab Analysis Choices</title>
      </Head> 

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 font-roboto">Choose an Analysis</h1>
        <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysisChoices.map((option) => ( option.title === 'Receptor-Ligand' ?                 
              <div
                onClick={beginReceptorLigandAnalysis}
                className="shadow-2xl relative rounded-lg overflow-hidden transition-transform transform scale-95 hover:scale-100 group"  
                style={{ height: '20vh' }}
                key={option.title}
                >
                <Image
                    src={option.background}
                    alt={option.title}
                    className="absolute inset-0 w-full h-full object-cover backdrop-blur-xs"
                    layout="fill"
                />
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{loadingAnalysis ? 'Loading... ': option.title}</span>
                </div>
              </div> :
            <Link href={option.link} key={option.title}>
                <div
                className="shadow-2xl relative rounded-lg overflow-hidden transition-transform transform scale-95 hover:scale-100 group"
                style={{ height: '20vh' }}
                >
                <Image
                    src={option.background}
                    alt={option.title}
                    className="absolute inset-0 w-full h-full object-cover backdrop-blur-xs"
                    layout="fill"
                />
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{option.title}</span>
                </div>
                </div>
            </Link>
          ))}
        </div>
        </div>
        <div className='flex items-center justify-center mt-5 '>
          <button
              className=" w-1/2 bg-blue rounded-lg text-white px-10 py-4 text-lg font-bold hover:bg-blue/70 focus:outline-none focus:ring-2 focus:ring-cyan focus:ring-opacity-50 transition ease-in-out duration-150 cursor-pointer"
              onClick={() => handleFinishAnalysis(selectedProject.user, selectedProject.project_id, analysisId, router, token)}
          >
              Finish Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  // Get the user's JWT access token from next's server-side cookie
  const token = await getToken(context);
  const session = await getSession(context);
  if (!token || !session) {
    return {
      redirect: {
        destination: '/Login',
        permanent: false,
      },
    };
  }
    return {
      props: { 
        data: session,
        token
      }
    }
};

export default AnalysisOptions;