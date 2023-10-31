import Topics from './Topics';
import React from 'react';
const Overview = ({ loading, topics, updateFilterList, setSelectedFilter }) => {
  return (
    <>
      <Topics
        loading={loading}
        topics={topics}
        updateFilterList={updateFilterList}
        setSelectedFilter={setSelectedFilter}
      />
    </>
  );
};

export default Overview;
