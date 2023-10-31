import MaterialIcon from './MaterialIcon';
import React from 'react';

const NoDataFound = ({
  title,
  description,
  icon,
  iconStyle = 'font-size-4em',
  iconFilled,
  iconSymbol,
  containerStyle = 'py-6 my-6',
}) => {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center ${containerStyle}`}
    >
      {icon && (
        <MaterialIcon
          icon={icon}
          clazz={`${iconStyle} mb-1`}
          filled={iconFilled}
          symbols={iconSymbol}
        />
      )}
      <h4 className="font-weight-medium">{title}</h4>
      <p className="font-weight-normal font-italic mb-0">{description}</p>
    </div>
  );
};

export default NoDataFound;
