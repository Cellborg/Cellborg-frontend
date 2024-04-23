import React from 'react';
import { checkIfPlotDataExists, getPlotData } from '../../components/utils/s3client.mjs';
import { useProjectContext } from '../utils/projectContext';
import {datasetqcBucket} from '../../constants.js';
export const QualityControlPlotForm = ({ loadData, setIsDataLoading, dataset }) => {
    const { selectedProject } = useProjectContext();

    function generateQualityControlPlotKey() {
        const qualityControlPlotKey = `${selectedProject.user}/${selectedProject.project_id}/${dataset}/plots/QcViolinPlotData.json`
        return qualityControlPlotKey;
    }
    async function loadQualityControlPlot(event) {
        event.preventDefault();
        setIsDataLoading(true)
        const qualityControlPlotKey = generateQualityControlPlotKey();
        console.log("qualityControlPlotKey: ", qualityControlPlotKey);
        // First check if requested plot already exists in S3
        checkIfPlotDataExists(datasetqcBucket, qualityControlPlotKey)
        .then((exists) => {
            if (exists) {
                console.log(qualityControlPlotKey, "exists!");
                getPlotData(datasetqcBucket, qualityControlPlotKey)
                .then((plotData) => {
                    loadData(plotData);
                })
                .catch((error) => {
                    console.error('Error setting the QC plot:', error);
                });
            } else {
                console.log(qualityControlPlotKey, " does not exist... .");
            }
            setIsDataLoading(false)
        })
        .catch((error) => {
            console.error("Error checking object existence:", error);
        });        
    }

  return (
    <>
        <div className='w-full h-full mx-auto text-center'>
            <form onSubmit={loadQualityControlPlot}>
                <div className='justify-center w-full h-full'>
                    <button type='submit' className='px-8 py-2 w-full h-full'>Load QC Plot</button>
                </div>
            </form>
        </div>
    </>)
};