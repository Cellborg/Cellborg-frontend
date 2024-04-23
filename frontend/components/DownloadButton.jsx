import React from 'react';
import { saveAs } from 'file-saver';
import {URL} from '../constants.js';
export default function DownloadButton() {
  const handleDownload = async () => {
    saveAs(URL, "plot");
  };

  return (
    <div>
      <button onClick={handleDownload} className='px-8 py-2 border'>Download DimPlot</button>
    </div>
  );
}