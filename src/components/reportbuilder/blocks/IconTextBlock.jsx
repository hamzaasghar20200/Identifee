import React from 'react';
import MaterialIcon from '../../commons/MaterialIcon';
import BaseBlock from './BaseBlock';

const IconTextBlock = ({
  block,
  data,
  text,
  iconConfig,
  partner,
  showAdd,
  direction = '',
}) => {
  const handleAdd = () => {
    showAdd(block);
  };
  return (
    <BaseBlock
      showAdd={typeof showAdd === 'function' ? handleAdd : showAdd}
      partner={partner}
      direction={direction}
      dataBlock={
        <>
          <p className="mb-0">
            <MaterialIcon
              icon={iconConfig.icon}
              clazz={`${iconConfig.color} font-size-6xl`}
            />
          </p>
          <p className="font-size-xs mb-0 font-weight-semi-bold">{data.text}</p>
        </>
      }
      textBlock={<p className="mb-0">{text}</p>}
    />
  );
};
export default IconTextBlock;
