import { S3Client, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command  } from "@aws-sdk/client-s3";
import { ENVVV } from "../../constants";

export const s3Client = new S3Client({
  region: "us-west-2",
  credentials:{
    accessKeyId:"AKIA4TIFZQZ2YCE3EBA6",
    secretAccessKey:"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",
  }
});

async function checkIfPlotDataExists(bucket, key) {
  const headObjectCommand = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
  });
  try {
      await s3Client.send(headObjectCommand);
      return true; // The object exists
  } catch (error) {
      return false;
  }
}

async function getPlotData(bucket, key) {
  var check=false;
  while(!check){
    check= await checkIfPlotDataExists(bucket,key)
    console.log(check)
  }
  try {
      const command = new GetObjectCommand({Bucket: bucket, Key: key });
      console.log("COMMAND: ", command);
      const response = await s3Client.send(command);
      console.log(checkIfPlotDataExists(bucket,key))
      console.log("Response from getting plot data:", response);
      const stringData = await response.Body.transformToString();
      const jsonData = JSON.parse(stringData);
      console.log(jsonData);
      return jsonData;
  } catch (error) {
      console.error('Error getting the JSON plot data:', error);
  }
}

async function getBinaryPlotData(bucket, key) {
  try {
    const command = new GetObjectCommand({Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    const arrayBuffer = await new Response(response.Body).arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error('Error getting the binary plot data:', error);
  }
}
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
      chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}


async function getCSVPlotData(bucket, key) {
  try {
    const command = new GetObjectCommand({Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    const stringData = await response.Body.transformToString();
    return stringData;
  } catch (error) {
    console.error('Error getting the CSV file.', error);
  }
}

async function deleteProjectFromS3(project) {
  console.log("Project to delete:", project)
  const projectPrefix = `${project.user}/${project.project_id}/`;
  const bucket = "cellborgdatasetuploadbucket";

  const listParams = { Bucket: bucket, Prefix: projectPrefix };
  const listObjects = await s3Client.send(new ListObjectsV2Command(listParams));
  if (!listObjects.Contents) {
    console.log(`prefix ${projectPrefix} is empty`);
  }
  else if (listObjects.Contents && listObjects.Contents.length === 0) {
    console.log(`prefix ${projectPrefix} is empty`);
  }
  else {
    const deleteObjects = listObjects.Contents;
    for (const object of deleteObjects) {
      const deleteParams = { Bucket: bucket, Key: object.Key };
      const response = await s3Client.send(new DeleteObjectCommand(deleteParams));
      console.log(`Deleted ${object.Key}`);
    }
    console.log(`Project ${projectPrefix} has been deleted`)
  }
}
async function getProjectValues(project){
  console.log(`Getting project values from s3 for ${project.project_id}`);
  const key = `${project.user}/${project.project_id}/project_values.json`;
  const bucket = `cellborg-${ENVVV}-qcdataset-bucket`;
  try {
    const command = new GetObjectCommand({Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    const stringData = await response.Body.transformToString();
    return JSON.parse(stringData);
  } catch (err) {
    console.error(`Error getting project values from s3, ${err}`);
  }
}

export { checkIfPlotDataExists, getPlotData, getBinaryPlotData, getCSVPlotData, deleteProjectFromS3, getProjectValues };