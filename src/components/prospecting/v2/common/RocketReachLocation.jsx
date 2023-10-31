import React from 'react';

const RocketReachLocation = ({ prospect }) => {
  return (
    <>
      {prospect.location ? (
        <p className="prospect-typography-h6 text-wrap p-0 m-0">
          <span className="text-gray-900">
            {prospect.location ? (
              <span>{prospect.location}</span>
            ) : (
              <span>
                {prospect.city && <span>{prospect.city}</span>}
                {prospect.state && <span>, {prospect.state}</span>}{' '}
              </span>
            )}
          </span>
        </p>
      ) : (
        ''
      )}
    </>
  );
};
export default RocketReachLocation;
