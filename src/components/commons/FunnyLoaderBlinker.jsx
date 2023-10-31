import FunnyLoaderText from './FunnyLoaderText';
import DotDot from './DotDot';
import React from 'react';

const FunnyLoaderBlinker = () => {
  return (
    <p>
      <span className="blinker"></span>
      <FunnyLoaderText />
      <DotDot />
    </p>
  );
};

export default FunnyLoaderBlinker;
