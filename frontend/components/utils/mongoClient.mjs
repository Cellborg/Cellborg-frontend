import { API_URL } from "../../constants";

async function mongoRequest(endpoint, data = {}, token = "") {
    try {
        const response = await fetch(`${API_URL}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        console.log("Response: ", response);
        if (!response.ok) {
            console.error(`HTTP error: ${response.status}`);
            return false;
        }
        
        return await response.json();
    }
    catch (err) {
        console.error(`Error encountered from mongoRequest: ${err}`);
        return false;
    }
}
/*LANDING PAGE FORM */
async function sendAccountRequest(data,token){
    return await mongoRequest('hero/accrequest',data,token)
}
/*REORT BUG FORM */
async function sendReportBug(data,token){
    return await mongoRequest('bug/report',data,token)
}

/* PROJECTS */
async function getProjects(user, token) {
    const data = {id: user};
    return await mongoRequest('project/projects', data, token);
}

async function getProject(projectId, token) {
    return await mongoRequest(`project/getproject/${projectId}`, {}, token);
}

async function deleteProject(projectId, entireProject, token) {
    const data = {id: projectId, project: entireProject};
    return await mongoRequest('project/deleteproject', data, token);
};

async function updateProject(projectId, editedProject, token) {
    const data = {id: projectId, project: editedProject};
    return await mongoRequest('project/updateproject', data, token);
};

async function createProject(project, token) {
    return await mongoRequest('project/newproject', project, token);
};
async function newDatasetId(token) {
    return await mongoRequest('project/newDatasetId',{},token);
}

/* USERS */
async function getMetadata(userId) {
    const data = {id: userId};
    return await mongoRequest('user/metadata', data);
};

async function signUp(user) {
    return await mongoRequest('auth/signup', user);
}

async function getUser(user, token) {  // change to POST not GET
    const res = await mongoRequest(`user/getuser/${user}`, {}, token);
    if (res) return res.message;
    return res;
};


async function deleteUser(userId, token) { // change backend route to POST not DELETE
    await mongoRequest(`user/delete/${userId}`, {}, token);
    return;
}

/* DATASET REQUESTS */
async function loadQCPlot(selectedProject) {
    const data = {
        user: selectedProject.user,
        project: selectedProject.project_id
    };  
    return await mongoRequest('qc/loadQualityControlPlot', data);
};

async function beginQualityControl(user, project, datasetId, token) {
    const data = {
        user: user,
        project: project,
        dataset: datasetId
    };
    console.log(data);
    return await mongoRequest('qc/beginQualityControl', data, token);
};

async function performQCMetricsPrePlot(projectUser, projectId, datasetId,mt, token) {
    const data = {
        user: projectUser,
        project: projectId,
        dataset: datasetId,
        mt:mt
    };
    console.log(data);
    return await mongoRequest('qc/performQCMetricsPrePlot', data, token);
};

async function performQCDoublets(projectUser,projectId,datasetId, counts, genes, mito,token){
    const data = {
        user: projectUser,
        project:projectId,
        dataset: datasetId,
        countMax: counts.max,
        countMin: counts.min,
        geneMax: genes.max,
        geneMin:genes.min,
        mitoMax: mito.max,
        mitoMin: mito.min,
    };
    return await mongoRequest('qc/performQCDoublets', data, token)
}
async function finishDoublets(user, project, dataset, doubletScore, token){
    const data = {
        user:user,
        project:project,
        dataset:dataset,
        doubletScore: doubletScore
    };
    return await mongoRequest('qc/finishDoublets', data, token);
}

async function begin(prefix) {
    const data = { prefix: prefix };
    console.log('Beginning Analysis for dataset:', prefix);
    //send POST req to API to begin dataset analysis
    //direct to cluster plot page
    return await mongoRequest('analysis/begin', data);
};
async function heatmapanalysis(user, project, analysis, geneNames, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        geneNames: geneNames
    };
    return await mongoRequest('analysis/heatmapanalysis', data, token);
};
async function findAllMarkersAnalysis(user, project, analysis, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis
    };
    return await mongoRequest('analysis/findAllMarkersAnalysis', data, token);
};

async function findMarkersAnalysis(user, project, analysis, cluster1, cluster2, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        cluster1: cluster1,
        cluster2: cluster2
    };
    return await mongoRequest('analysis/findMarkersAnalysis', data, token);
};

async function loadDotPlot(user, project, analysis, genes, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        genes: JSON.stringify(genes)
    };
    return await mongoRequest('analysis/loadDotPlot', data, token);
};

async function loadVlnPlots(user, project, analysis, genes, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        genes: JSON.stringify(genes)
    };
    return await mongoRequest('analysis/loadVlnPlots', data, token);
};

async function annotateClusters(user, project, analysis, annotations, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        annotations: JSON.stringify(annotations)
    };
    return await mongoRequest('analysis/annotateClusters', data, token);
};

async function psuedotimeAnalysis(user, project, analysis, points, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        points: points
    };
    return await mongoRequest('analysis/psuedotimeAnalysis', data, token); 
}

async function varfeatureanalysis(user, project, analysis, nFeatures, token) {
    const data = {
        user: user,
        project: project,
        analysisId: analysis,
        nFeatures: nFeatures
    };
    return await mongoRequest('analysis/varfeatureanalysis', data, token);
};

async function loadGeneFeaturePlot(requestData, token) {
    return await mongoRequest('analysis/loadGeneFeaturePlot', requestData, token);
};

async function newAnalysisId(token) {
    return await mongoRequest('analysis/newanalysisid', {}, token);
};

async function beginAnalysis(user, project, analysisId, datasets, token) {
    const analysisRequest = {
        user: user,
        project: project,
        analysisId: analysisId,
        datasets: datasets
    }
    console.log("analysis request token: ", token)
    return await mongoRequest('analysis/beginAnalysis', analysisRequest, token);
};

async function beginAnalysis2(user, project, analysisId, datasets) {
    const analysisRequest = {
        user: user,
        project: project,
        analysis: analysisId,
        datasets: datasets
    }
    return await mongoRequest('analysis/beginAnalysis2', analysisRequest);
};

async function loadCPlot(data, token) {
    return await mongoRequest('analysis/loadClusterPlot', data, token);
};

async function collectGenenames(geneNameRequest) {
    return await mongoRequest('analysis/collectgenenames', geneNameRequest);
};


export { getProjects, getProject, deleteProject, updateProject, createProject, getMetadata, signUp, getUser, deleteUser,
loadQCPlot, beginQualityControl, performQCMetricsPrePlot,performQCDoublets,finishDoublets, begin, varfeatureanalysis, loadGeneFeaturePlot,
newAnalysisId, beginAnalysis, loadCPlot, collectGenenames, heatmapanalysis, psuedotimeAnalysis, loadDotPlot, loadVlnPlots, 
annotateClusters, findAllMarkersAnalysis, findMarkersAnalysis,sendAccountRequest,sendReportBug,newDatasetId }

