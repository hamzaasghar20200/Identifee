import MaterialIcon from '../../commons/MaterialIcon';
import React from 'react';

const GreenRedCheckItem = ({ item, bordered = 'border-bottom' }) => {
  const isChecked = item[1].value > 0;
  return (
    <p className={`font-size-sm2 mb-0 py-2 ${bordered}`}>
      <div className="d-flex align-items-center gap-1">
        <MaterialIcon
          icon={isChecked ? 'check_circle' : 'cancel'}
          filled
          clazz={`font-size-md ${isChecked ? 'text-green' : 'text-red '}`}
        />
        <span className="fs-8">{item[1]?.key}</span>
      </div>
    </p>
  );
};
export default GreenRedCheckItem;
