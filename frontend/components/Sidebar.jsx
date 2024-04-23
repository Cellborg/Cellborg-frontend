import { useState } from "react";
import { useRouter } from 'next/router';

const Sidebar = ({ page }) => {
    const router = useRouter();

    const analysisPages = ["Variable Features", "Clusters","Annotations", "Gene Features"];
    const analysisRoutes = ["VariableFeatures", "cluster","Annotations", "FeaturePlots"];

    const { query } = router; 

    let pages, routes;

    pages = analysisPages;
    routes = analysisRoutes;

    const [isOpen, setIsOpen] = useState(false);

    const curPageIdx = analysisPages.findIndex(p => p === page);

    const toggleSideBar = () => setIsOpen(!isOpen);

    const handleClick = (index) => {
        const page = routes[index];
        const path = `/${page}`;
        console.log(page, path);
        router.push(path);
        toggleSideBar();
    };

    return (        
        <>
            <div
                className={`fixed top-1/4 left-0 w-48 h-3/5 bg-slate-50 bg-opacity-75 border border-black transform transition-transform duration-500 z-10 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col justify-center h-full">
                    <ul className="space-y-4 font-semibold">
                        {pages.map((item, index) => (
                            <li
                                key={index}
                                className={`flex flex-col items-center ml-5 mr-5 cursor-pointer mt-3`}
                                onClick={() => (index <= curPageIdx || index === curPageIdx + 1 || query.analysis != 'true') ? handleClick(index) : console.log("not allowed")}
                                style={{cursor: index <= curPageIdx || index === curPageIdx + 1 || query.analysis != 'true' ? 'pointer' : 'not-allowed'}}
                            >
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-black mb-2 border-2 ${item === page ? 'border-blue' : 'border-cyan'}`}
                                >
                                    {item[0]}
                                </div>
                                <span className="text-sm">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={toggleSideBar} className="absolute top-1/2 left-48 z-50 text-xl cursor-pointer p-2 bg-blue-500 hover:bg-blue-700">
                    {isOpen ? "X" : "☰"}
                </button>
            </div>
        </>
    );
}

export default Sidebar;
