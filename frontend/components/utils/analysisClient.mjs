import { updateProject } from "./mongoClient.mjs";
import { get, set } from 'idb-keyval';

const TimeOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    hour12: true,
}

async function fetchProjectFromCache(project) {
    const cachedProjects = await get('cachedProjects');
    try {
        const projectList = cachedProjects;
        console.log('looking in cache for project list', projectList)
        const projectIdx = projectList.findIndex(p => p._id == project._id);
        console.log('found project in cache:', projectList[projectIdx])
        return projectList[projectIdx];
    }
    catch (e) {
        console.error(`Ran into error ${e} while trying to find project in cachedProjects`);
    }
}

// return a list to update the cache to
async function updatedProjectList(updatedProject) {
    const cachedProjects = await get('cachedProjects');
    try {
        const projectList = cachedProjects;
        const projectIdx = projectList.findIndex(p => p._id == updatedProject._id);
        projectList[projectIdx] = updatedProject;
        await set('cachedProjects', projectList);
    }
    catch (e) {
        console.error(`Error ${e}. Some issue with caching projects`);
    }
}

async function addProjectRun(analysisId, project) {
    console.log("ADDING RUN TO PROJECT!!");
    // get project from cache; ensure its up to date
    const fetchedProject = await fetchProjectFromCache(project);
    console.log("GETTING PROJECT:", fetchedProject);
    // add analysis id + run information to `runs` field in project
    const run = {analysisid: analysisId,
                time: new Date().toLocaleTimeString(undefined, TimeOptions),
                step: 'begin'};
    const updatedProject = { ...fetchedProject }
    if (!updatedProject.runs) {
        updatedProject.runs = [];
    };
    updatedProject.runs.push(run); // push run to runs array for project
    // update project in mongo, to account for new run
    await updateProject(updatedProject._id, updatedProject);
    await updatedProjectList(updatedProject);
};

async function editProjectRunStep(analysisId, project, step) {
    console.log("EDITING EXISTING RUN STEP FIELD!!");
    // get project from cache; ensure its up to date
    const updatedProject = await fetchProjectFromCache(project);
    // find run with matching analysis id, then edit the step to new step value
    const matchingRunIdx = updatedProject.runs.findIndex(r => r.analysisid == analysisId);
    updatedProject.runs[matchingRunIdx].step = step;

    // update project in mongo, to account for edited run
    await updateProject(updatedProject._id, updatedProject);
    await updatedProjectList(updatedProject);
};

export { addProjectRun, editProjectRunStep }