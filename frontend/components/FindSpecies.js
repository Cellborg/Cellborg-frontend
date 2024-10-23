import {MtToSpecies } from '../constants';

const pako = require('pako');
var retard="";

export const findSpecies=(file)=>{
    const myPromise =  new Promise ((resolve, reject) =>{
        const reader = new FileReader();
        reader.onload = function(event){
            let fileContents = event.target.result;
            const compressedData = new Uint8Array(fileContents);
            const decompressedData = pako.inflate(compressedData, { to: 'string' });
            console.log('in here');
            const speciesLines = decompressedData.trim().split('\n');
            for(const word of speciesLines){
                var new_word = word.split('\t')[1];
                if(new_word in MtToSpecies){
                    retard = MtToSpecies[new_word];
                    resolve(retard);
                }
              }
              resolve(null)
            
            }
        reader.onerror = reject;

        reader.readAsArrayBuffer(file);
    })
    return myPromise
};

export default findSpecies;