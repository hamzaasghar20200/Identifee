import React from 'react';
import { Collapse } from 'react-bootstrap';

const Wrapper = ({
  title,
  icon,
  children,
  value = '',
  active,
  setActive,
  id,
}) => {
  return (
    <div
      className={`w-100 my-1 ${
        active === id
          ? ''
          : `item-filter ${value?.trim() !== '' ? 'text-primary' : ''}`
      }`}
    >
      <div
        className={`d-flex cursor-pointer align-items-center p-item-filter nav-link font-size-sm2 font-weight-medium px-3 py-0 ${
          active === id ? 'bg-primary text-white' : ''
        }`}
        onClick={() => setActive(id !== active ? id : null)}
      >
        <span
          className={`material-icons-outlined fs-20 py-1 my-1 ${
            active !== id && value?.trim() !== '' ? 'fw-bold' : ''
          }`}
        >
          {icon}
        </span>
        <div className="ml-1">
          <span
            className={`text-capitalize py-0 ${
              active !== id && value?.trim() !== '' ? 'fw-bolder' : ''
            }`}
          >
            {title}
          </span>
          <br />
          {active !== id && value?.trim() !== '' && (
            <span className="fst-italic">{value}</span>
          )}
        </div>

        <span className="material-icons-outlined font-size-sm2 ml-auto py-0">
          {active === id ? 'remove' : 'add'}
        </span>
      </div>

      <Collapse in={active === id}>
        <div className={`p-2 px-3`}>{children}</div>
      </Collapse>
    </div>
  );
};

export default Wrapper;
