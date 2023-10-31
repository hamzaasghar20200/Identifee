import React from 'react';

// will use this component wherever we want to show a popover type thing, for ref how to use it: see Followers.jsx
const PopoverWrapper = ({
  children,
  template,
  hoverElementStyle = 'py-0',
  position = 'right',
  applyWidth = false,
  applyHeight = '',
}) => {
  return (
    <div
      className={`position-relative popover__wrapper profile-popover ${applyHeight}`}
    >
      <a
        className={`border-0 btn-block popover__title px-0 btn btn-link btn-ghost-secondary dropdown-hide-arrow ${hoverElementStyle}`}
      >
        {children}
      </a>
      <div
        className={`p-2 rounded popover__content shadow-lg ${
          applyWidth ? 'lg' : ''
        } ${position}`}
      >
        <div className="bg-transparent cursor-default p-0">{template}</div>
      </div>
    </div>
  );
};

export default PopoverWrapper;
