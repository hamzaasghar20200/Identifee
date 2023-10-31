import React from 'react';
import MaterialIcon from '../../commons/MaterialIcon';
import BaseBlock from './BaseBlock';

const CalendarBlock = ({
  block,
  data,
  text,
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
          <div className="position-relative">
            <MaterialIcon
              icon="calendar_today"
              clazz="text-gray-eee font-size-7em"
            />
            <h1
              className="text-danger position-absolute mb-0 font-size-2em font-weight-bold abs-center"
              style={{ bottom: 15 }}
            >
              {data.value}
            </h1>
          </div>
          <p className="font-size-xs mb-0 font-weight-semi-bold">{data.text}</p>
        </>
      }
      textBlock={<p className="mb-0">{text}</p>}
    />
  );
};
export default CalendarBlock;
