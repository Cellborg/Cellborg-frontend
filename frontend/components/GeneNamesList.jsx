import React, { useState, useEffect,useRef } from 'react';
import { checkIfPlotDataExists, getPlotData } from '../components/utils/s3client.mjs'
import { useProjectContext } from './utils/projectContext';
import { loadGeneFeaturePlot } from './utils/mongoClient.mjs';
import { editProjectRunStep } from './utils/analysisClient.mjs';
import {genefeatBucket} from '../constants.js';

const GeneNamesList = ({ items, handleItemSelect}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedItems, setDisplayedItems] = useState([]);

  const expandList = useRef(null);

  useEffect(() => {
    if (searchQuery && items) {
      const filteredItems = items.filter(item =>
        item.includes(searchQuery)
      );
      setDisplayedItems(filteredItems);
    } else {
      setDisplayedItems([]);
    }
  }, [searchQuery, items]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandList.current && !expandList.current.contains(event.target)) {
        setDisplayedItems([]);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative w-full border border-blue bg-white rounded-lg'>
      <input
        className='w-full font-roboto outline-none px-5 mb-3 mt-3 text-lg'
        type="text"
        placeholder="Search Gene Name..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <ul ref={expandList} className='absolute z-50 bg-white w-full rounded-md overflow-hidden' style={{ maxHeight: '60vh', overflowY: 'auto', padding: '0', margin: '0'}}>
          {displayedItems.map((item, index) => (
            <li className='border text-xl hover:bg-cyan' key={index}>
              <button className="flex mx-5 w-full h-full" onClick={() => handleItemSelect(item)}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GeneNamesList;
