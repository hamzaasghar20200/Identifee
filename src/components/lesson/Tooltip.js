import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const TooltipComponent = ({
  title,
  placement = 'bottom',
  children,
  image = '',
}) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip className={`font-weight-semi-bold`}>
          {image ? <div className="mb-2">{image}</div> : ''}
          {title}
        </Tooltip>
      }
    >
      {children}
    </OverlayTrigger>
  );
};

export default TooltipComponent;
