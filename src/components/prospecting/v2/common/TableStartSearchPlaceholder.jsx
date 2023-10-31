import NoDataFound from '../../../commons/NoDataFound';
import React from 'react';

const TableStartSearchPlaceholder = ({ title, description }) => {
  const Description = () => {
    return (
      <>
        Real-time verified data for over 720 million professionals across 35
        million companies, worldwide.
      </>
    );
  };
  const Title = () => {
    return (
      <div className="text-gray-search">
        {title || "Let's start searching!"}
      </div>
    );
  };
  return (
    <NoDataFound
      icon="manage_search"
      title={<Title />}
      description={description || <Description />}
      containerStyle={'text-gray-search py-6 my-6'}
    />
  );
};

export default TableStartSearchPlaceholder;
