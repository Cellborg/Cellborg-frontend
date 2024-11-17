export const ENVVV = process.env.NEXT_PUBLIC_DEPLOY_ENV || "dev";

//we only want to keep track of dev for URLs ... aws resources will use beta regardless of dev/beta env.
const ENVIRONMENT = ENVVV === "prod" ? "prod" : "beta";

export const API_URL = (ENVVV === "prod") ? 'https://api.cellborg.bio' 
                        : (ENVVV === "beta") ? 'https://beta.api.cellborg.bio' 
                        : 'http://localhost:4200';

console.log(`Cellborg Frontend running on ${ENVVV} server`);

export const SESSION_COOKIE = (ENVVV == "dev") ? 'next-auth.session-token' : '__Secure-next-auth.session-token';

//components/plotForms
export const datasetclusterBucket = (ENVVV === "dev") ? "cellborgdatasetclusterplotbucket" : `cellborg-${ENVIRONMENT}-datasetclusterplot-bucket`;
export const projectGeneNameBucket = (ENVVV === "dev") ? "cellborgprojectgenenamesbucket" : `cellborg-${ENVIRONMENT}-projectgenenames-bucket`;
export const datasetqcBucket = (ENVVV === "dev") ? "cellborgqcdatasetbucket" : `cellborg-${ENVIRONMENT}-qcdataset-bucket`;//also used in /pages/Doublets.jsx, QualityControl.jsx, VariableFeatures.jsx
export const varfeatBucket = (ENVVV === "dev") ? "cellborgvariablefeaturebucket" : `cellborg-${ENVIRONMENT}-variablefeature-bucket`;
export const PSUEDOTIME_BUCKET = (ENVVV === "dev") ? "cellborgpsuedotimebucket" : `cellborg-${ENVIRONMENT}-psuedotime-bucket`;
//components/DownloadButton.jsx
export const URL=`${API_URL}/api/download/getFile`;

//components/GeneNamesList.jsx
export const genefeatBucket = (ENVVV === "dev") ? "cellborggenefeatureplotbucket" : `cellborg-${ENVIRONMENT}-genefeatureplot-bucket`;

//components/ProjectViewBox.jsx
export const datasetUploadBucket = (ENVVV === "dev") ? "cellborgdatasetuploadbucket" : `cellborg-${ENVIRONMENT}-datasetupload-bucket`;

//pages/Heatmap.jsx
export const heatmapBucket = (ENVVV === "dev") ? "cellborgheatmapbucket" : `cellborg-${ENVIRONMENT}-heatmap-bucket`;

//pages/Doublets.jsx
export const qccleaupURL=`${API_URL}/api/qc/qualityControlCleanUp`;

export const paCleanupURL = `${API_URL}/api/pa/paCleanUp`;

//pages/AnalysisOptions.jsx
export const analysisCleanUpURL=`${API_URL}/api/analysis/analysisCleanUp`;

//pages/loading.jsx
export const checkTaskStatusURL=`${API_URL}/api/qc/checkQCTaskStatus`;

//pages/api/auth/
export const LOGIN_URL = `${API_URL}/api/auth/login`;

//pages/PCA.jsx
export const pcaBucket = (ENVVV === "dev") ? "cellborgpcabucket" : `cellborg-${ENVIRONMENT}-pca-bucket`;
export const performPCAURL=`${API_URL}/api/analysis/performPCA`;

//pages/QualityControlForm.jsx
export const socketio=`${API_URL}`;

export const socketio_analysis=`${API_URL}/analysisConnection`;
export const DOTPLOT_BUCKET = (ENVVV === "dev") ? "cellborgdotplotbucket" : `cellborg-${ENVIRONMENT}-dotplot-bucket`;
export const VLN_PLOTS_BUCKET = (ENVVV === "dev") ? "cellborgviolinplotsbucket" : `cellborg-${ENVIRONMENT}-violinplots-bucket`;

export const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "";
export const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "";

export const MtToSpecies = {'MT-ND1': "Homo sapiens",
                             "mt-Nd1":"Mus musculus", 
                             "mt-nd1":"Danio rerio", 
                             "mt:ND1":"Drosophila melanogaster", 
                             "Mt-nd1":"Rattus Norvegicus"}
export const SpeciesToMt = {
                            "Homo sapiens":"MT-",
                            "Mus musculus":"mt-",
                            "Danio rerio":"mt-",
                            "Rattus norvegicus":"Mt-",
                            "Drosophila melanogaster":"mt:"
}