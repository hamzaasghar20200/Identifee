import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';

const FieldSkeletonLoader = ({ circle = true, rows }) => {
  const [rowCount] = useState(Array(rows).fill(0));
  const Circle = ({ children }) => {
    return <div style={{ height: 20, width: 20 }}>{children}</div>;
  };
  return (
    <>
      {rowCount.map((r, idx) => (
        <div key={idx} className="d-flex col py-2 my-2 px-0 align-items-center">
          {circle && (
            <Circle>
              <Skeleton
                circle
                style={{ borderRadius: '50%', lineHeight: 1.3 }}
              />
            </Circle>
          )}
          <div className={`w-100 ${circle ? 'ml-2' : 'ml-0'}`}>
            <Skeleton height="20" />
          </div>
        </div>
      ))}
    </>
  );
};

export default FieldSkeletonLoader;
