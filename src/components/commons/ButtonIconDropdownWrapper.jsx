import { Dropdown } from 'react-bootstrap';
import React, { useState } from 'react';
import MaterialIcon from './MaterialIcon';

// check its usage in View.jsx file where we needed a component to show options on Add Component click
const ButtonIconDropdownWrapper = ({
  children,
  options,
  handleOptionSelect,
  styleClasses,
}) => {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <Dropdown show={openFilter} onToggle={setOpenFilter}>
      <Dropdown.Toggle className={`p-0 dropdown-hide-arrow ${styleClasses}`}>
        {children}
      </Dropdown.Toggle>
      <Dropdown.Menu className="p-0 py-1 min-w-170 idf-dropdown-item-list">
        {options.map((option) => (
          <Dropdown.Item
            key={option.id}
            href="#"
            onClick={() => handleOptionSelect(option)}
            className={`px-3 ${option.hide ? 'd-none' : ''}`}
          >
            <div className="d-flex align-items-center py-1">
              {option.icon && (
                <MaterialIcon icon={option.icon} clazz="mr-2 font-size-xl" />
              )}
              <span>{option.name}</span>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ButtonIconDropdownWrapper;
