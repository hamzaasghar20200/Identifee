import Skeleton from 'react-loading-skeleton';
import React from 'react';

const RightBarLoader = ({
  count,
  isCircle = true,
  height = 24,
  width = 24,
}) => {
  const loadersCount = Array(count).fill(0);

  const LoaderTemplate = () => {
    return (
      <div>
        <Skeleton
          count={1}
          circle={isCircle}
          className="my-2"
          height={height}
          width={width}
        />
      </div>
    );
  };
  return (
    <>
      {loadersCount.map((_, index) => (
        <LoaderTemplate key={index} />
      ))}
    </>
  );
};

export default RightBarLoader;
