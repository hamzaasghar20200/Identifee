import React from 'react';

const ModalTitleWithSection = ({ title, section }) => {
  return (
    <div className="d-flex align-items-center">
      <span>{title}</span>
      {section && (
        <span
          className="ml-2 m-0 fs-7 badge-pill text-capitalize font-weight-medium tag-item"
          color="soft-secondary"
        >
          {section}
        </span>
      )}
    </div>
  );
};

export default ModalTitleWithSection;
