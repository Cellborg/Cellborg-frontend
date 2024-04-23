import React, { useState, useEffect, useRef } from 'react';
import { heatmapanalysis } from './utils/mongoClient.mjs';
import { heatmapBucket } from '../constants';
import { getCSVPlotData } from './utils/s3client.mjs';

const CSVTable = ({ s3key, user, projectName, analysisId, authtoken, setHeatmapLoaded, setAnalysisOption, setGeneNames }) => {
    const [data, setData] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 500;
    const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);

    function parseCSV(data) {
        const rows = data.trim().split('\n');
        return rows.map(row => {
            let values = [];
            let start = 0;
            let inString = false;
            for (let i = 0; i < row.length; i++) {
                if (row[i] === '"') {
                    inString = !inString;
                }
                if ((row[i] === ',' && !inString) || i === row.length - 1) {
                    let value = row.substring(start, i).trim();
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    values.push(value);
                    start = i + 1;
                }
            }
            return values;
        });
    }

    useEffect(() => {
        const fetchCSV = async () => {
            try {
                const data = await getCSVPlotData(heatmapBucket, s3key)
                setData(parseCSV(data));
                setIsLoaded(true);
            } catch (error) {
                console.error('Error fetching or parsing CSV:', error)
            }
        };

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchCSV();
                observer.disconnect();
            }
        });
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [s3key]);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const downloadCSV = () => {
        const blob = new Blob([data.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}_MarkersData.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const copyGeneNamesToClipboard = () => {
        const geneNames = data.slice(1).map(row => row[0]).join(', ');
        navigator.clipboard.writeText(geneNames).then(() => {
            alert('Gene names copied to clipboard!');
        }).catch(err => {
            alert('Failed to copy gene names! ' + err);
        });
    };
    
    const handleGenerateHeatmap = async () => {
        console.log("Generating heatmap using all markers gene names...");
        setAnalysisOption('Heatmap');
        setHeatmapLoaded(false);
        const geneNames = data.slice(1).map(row => row[0]);
    
        const filteredGeneNames = geneNames
            .map(name => name.replace(/['"]+/g, '').trim())
            .filter(name => name.length > 0);
        
        console.log(`Loading heatmap for: ${JSON.stringify(filteredGeneNames)}`);
        setGeneNames(filteredGeneNames);
        
        try {
            const res = await heatmapanalysis(user, projectName, analysisId, JSON.stringify(filteredGeneNames), authtoken);
            if (res) {
                console.log(res);
            }
        } catch (error) {
            console.log("error performing heatmap analysis: ", error);
        }
    }
    
    const currentData = data.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div ref={containerRef} className='p-5 w-full' style={{ maxHeight: '500px', overflowX: 'auto', position: 'relative' }}>
                {isLoaded ? (
                    <>
                        <table border="1">
                            <thead>
                                {data[0] && (
                                    <tr>
                                        {data[0].map((header, index) => <th style={{ padding: '0 5px' }} key={index}>{header}</th>)}
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {currentData.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => <td style={{ padding: '0 5px' }} key={cellIndex}>{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="pagination-controls">
                            <button onClick={handlePrev} disabled={currentPage === 1}>Previous</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    </>
                ) : (
                    <p>Loading table...</p>
                )}
            </div>
            <div className='mt-10 mb-10'>
                <button className="p-3 mr-5" style={{ backgroundColor: isLoaded ? 'green' : 'gray', color: 'white', cursor: isLoaded ? 'pointer' : 'not-allowed' }} onClick={downloadCSV} disabled={!isLoaded}>
                    Download CSV
                </button>
                <button className="p-3 ml-5" style={{ backgroundColor: isLoaded ? 'green' : 'gray', color: 'white', cursor: isLoaded ? 'pointer' : 'not-allowed' }} onClick={copyGeneNamesToClipboard} disabled={!isLoaded}>
                    Copy Gene Names to Clipboard
                </button>
                <button className="p-3 ml-5" style={{ backgroundColor: isLoaded ? 'orange' : 'gray', color: 'white', cursor: isLoaded ? 'pointer' : 'not-allowed' }} onClick={handleGenerateHeatmap} disabled={!isLoaded}>
                    Generate Heatmap
                </button>
            </div>
        </div>
    );
}

export default CSVTable;