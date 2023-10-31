import React from 'react';

const NoDataFoundTitle = ({ str, clazz = 'fs-6' }) => {
  return <div className={`${clazz} text-gray-search`}>{str}</div>;
};

export default NoDataFoundTitle;
