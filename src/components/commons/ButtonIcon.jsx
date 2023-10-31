import React from 'react';
import { Spinner } from 'reactstrap';
import TooltipComponent from '../lesson/Tooltip';
import MaterialIcon from './MaterialIcon';

const ButtonIcon = ({
  onclick,
  label = 'Default',
  icon = '',
  loading = false,
  color = 'primary',
  classnames = '',
  iconClass,
  tooltip,
  ...restProps
}) => {
  const ChargeLoad = () => {
    if (loading) return <Spinner className="spinner-grow-xs" />;

    return (
      <>
        {icon && (
          <i
            className={`material-icons-outlined ${
              label ? 'mr-1' : ''
            } ${iconClass}`}
            data-uw-styling-context="true"
          >
            {icon}
          </i>
        )}
        {label}
        {tooltip && (
          <TooltipComponent title={tooltip}>
            <MaterialIcon icon="info" filled clazz="ml-1 fs-6 cursor-pointer" />
          </TooltipComponent>
        )}
      </>
    );
  };

  const btnClass = `btn btn-${color} ${classnames} font-weight-medium`;

  return (
    <button
      className={btnClass}
      data-toggle="modal"
      onClick={onclick}
      {...restProps}
    >
      <ChargeLoad />
    </button>
  );
};

export default ButtonIcon;
