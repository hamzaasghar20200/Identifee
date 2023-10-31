import BaseBlock from './BaseBlock';
import React from 'react';

const RawHTMLBlock = ({ block, text, showAdd, partner, direction = '' }) => {
  const handleAdd = () => {
    showAdd(block);
  };
  return (
    <BaseBlock
      showAdd={typeof showAdd === 'function' ? handleAdd : showAdd}
      direction={direction}
      partner={partner}
      raw={true}
      textBlock={text}
    />
  );
};

export default RawHTMLBlock;
