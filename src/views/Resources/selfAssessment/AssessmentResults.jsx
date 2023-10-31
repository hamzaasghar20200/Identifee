import OtherCommunicationStyles from './OtherCommunicationStyles';
import React, { useState } from 'react';
import { COMMUNICATION_STYLES } from './assessmentConstants';
import MuxPlayer from '@mux/mux-player-react';
import { capitalize } from '../../../utils/Utils';

function findSameValueObjects(array) {
  const values = {}; // Create an object to store the values and their counts
  const result = []; // Create an array to store the objects with same value
  for (let i = 0; i < array.length; i++) {
    const value = array[i].value;
    if (values[value]) {
      values[value]++; // Increment the count if the value is already in the object
    } else {
      values[value] = 1; // Add the value to the object with a count of 1 if it's not already in the object
    }
  }
  for (let i = 0; i < array.length; i++) {
    const value = array[i].value;
    if (values[value] > 1) {
      // Check if the value has a count greater than 1
      result.push(array[i]); // Add the object to the result array
    }
  }
  return result;
}

function getValues(obj) {
  let max = null;
  let occurrences = [];

  for (const key in obj) {
    if (obj[key]) {
      const value = obj[key];

      if (max === null || value > max?.value) {
        max = { key, value };
        occurrences = [max];
      } else if (value !== max?.value) {
        occurrences.push({ key, value });
      }
    }
  }

  return [max, ...findSameValueObjects(occurrences)];
}

const AssessmentImages = ({ results, selected, setSelected }) => {
  return (
    <div className="d-flex py-2 my-3 align-items-center justify-content-center flex-wrap gap-2">
      {results.map((item) => (
        <div
          key={item.key}
          onClick={(e) => {
            e.preventDefault();
            setSelected(item);
          }}
          className={`px-2 pt-2 pb-0 cursor-pointer links-hover ${
            selected.key === item.key ? 'selected' : ''
          }`}
        >
          <a
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <img
              src={COMMUNICATION_STYLES[capitalize(item.key)].icon}
              className="rounded-circle sa-comm-style-image"
            />
          </a>
          <h5 className="mt-2">{COMMUNICATION_STYLES[item.key]?.title}</h5>
        </div>
      ))}
    </div>
  );
};
const AssessmentDetails = ({ selected }) => {
  const selectedObject = COMMUNICATION_STYLES[capitalize(selected.key)];
  return (
    <>
      <MuxPlayer
        streamType="on-demand"
        playbackId={selectedObject.video.playId}
        style={{ maxWidth: 600 }}
        poster={selectedObject.video.poster}
        metadata={{
          videoId: selectedObject.video.videoId,
          video_title: selectedObject.title,
          viewer_user_id: selectedObject.video.videoId,
        }}
        autoPlay={false}
        controls={true}
      />
      <div className="p-2">{selectedObject.details}</div>
    </>
  );
};

const AssessmentResults = ({ results }) => {
  const [max, ...occurrences] = getValues(results);
  const [selected, setSelected] = useState(max);
  return (
    <div className="px-lg-3 pb-2">
      <AssessmentImages
        results={[max, ...occurrences]}
        selected={selected}
        setSelected={setSelected}
      />
      <AssessmentDetails selected={selected} />
      <OtherCommunicationStyles />
    </div>
  );
};

export default AssessmentResults;
