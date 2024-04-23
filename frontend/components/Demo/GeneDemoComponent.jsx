import { useState } from 'react';
import dynamic from 'next/dynamic';
const DemoDotplots = dynamic(() => import('./DemoDotPlots'), {ssr: false,});
const DemoGeneFeaturePlot = dynamic(() => import('./DemoGeneFeaturePlot'), {ssr: false});

const GeneDemoComponent = () => {
    const [viewingGene, setViewingGene] = useState(null);
    const [viewAll, setViewAll] = useState(false);
    const genes = ['CCR7', 'CD14', 'S100A4', 'MS4A1', 'CD8A', 'FCGR3A', 'NKG7', 'FCER1A', 'PPBP'];

    const handleGeneSelect = (gene) => {
        setViewAll(false);
        setViewingGene(gene);
    };

    const handleViewAll = () => {
        setViewAll(true);
        setViewingGene(null);
    };

    const renderPlots = () => {
        if (viewAll) {
            return <DemoDotplots />;
        } else if (viewingGene) {
            return <DemoGeneFeaturePlot gene={viewingGene} />;
        } else {
            return <div>Select a gene to view its feature plot or click `View All Dotplots`</div>;
        }
    };

    return (
        <div className='flex'>
            <div className='w-1/5 p-2'>
                <div className='mb-4'>
                    <label htmlFor='gene' className='block text-gray-700 text-sm font-bold mb-2'>
                        Select Gene
                    </label>
                    <select
                        className='block w-full bg-white border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:border-indigo-500'
                        id='gene'
                        value={viewingGene || ''}
                        onChange={(e) => handleGeneSelect(e.target.value)}
                    >
                        <option value=''>--Select--</option>
                        {genes.map(gene => (
                            <option key={gene} value={gene}>{gene}</option>
                        ))}
                    </select>
                </div>
                <button
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleViewAll}
                >
                    View All Dotplots
                </button>
            </div>
            <div className='w-4/5 p-2'>
                {renderPlots()}
            </div>
        </div>
    )
}

export default GeneDemoComponent;
