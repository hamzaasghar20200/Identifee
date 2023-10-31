import React from 'react';

const Unauthorized = () => {
  return (
    <>
      <div className="text-center exceptions-view">
        <h4>{`We are sorry`}</h4>
        <p>{`You don’t have permission to access this page, please contact administrator`}</p>
      </div>
    </>
  );
};

export default Unauthorized;
