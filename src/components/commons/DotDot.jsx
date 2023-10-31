import React, { useEffect, useRef } from 'react';

const DotDot = () => {
  const ref = useRef();
  let timer = null;
  useEffect(() => {
    if (ref?.current) {
      timer = setInterval(function () {
        if ((ref.current.innerHTML += '.').length === 4)
          ref.current.innerHTML = '';
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, []);
  return <span ref={ref}></span>;
};

export default DotDot;
