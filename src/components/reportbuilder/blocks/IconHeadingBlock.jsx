import MaterialIcon from '../../commons/MaterialIcon';
import React from 'react';

const IconHeadingBlock = ({
  containerStyle = 'gap-1 px-3',
  heading,
  icon,
  iconStyle = { back: '#A3A4AF', fore: 'text-white' },
  iconSize = { width: 28, height: 28 },
}) => {
  return (
    <div className={`d-flex align-items-center ${containerStyle}`}>
      <div
        className={`rounded-circle d-flex align-items-center justify-content-center text-center`}
        style={{ background: iconStyle.back, ...iconSize }}
      >
        <MaterialIcon icon={icon} clazz={iconStyle.fore} />
      </div>
      <h3 className="text-center mb-0">{heading}</h3>
    </div>
  );
};

export default IconHeadingBlock;
