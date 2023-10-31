import React from 'react';

const AIReferences = ({ list }) => {
  return (
    <div className="rounded w-100 bg-white font-size-sm2 p-3 mt-2 border shadow">
      <label className="font-weight-medium mb-0">References:</label>
      <ul className="mb-0">
        {list?.map((item, index) => (
          <div key={index} className="d-flex align-items-center py-1 gap-1">
            <span>{index + 1}.</span>
            <a href={item.url} rel="noreferrer" target="_blank">
              {item.title}
            </a>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default AIReferences;
