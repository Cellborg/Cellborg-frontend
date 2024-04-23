import React from 'react'
import Dropzone, { useDropzone } from 'react-dropzone'
import { useCallback } from 'react'

const FolderUpload = () => {
    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles);
      }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
    return (
        <Dropzone className='container border fill-black' style={{height: '50vh'}}>
            <div {...getRootProps()}>
            <input {...getInputProps()} className='px-8 py-2 border bg-black'/>
            {
                isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag and drop some files here, or click to select files</p>
            }
            </div>
        </Dropzone>
      )
}

export default FolderUpload
