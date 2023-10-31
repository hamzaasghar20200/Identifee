import React from 'react';
import { Dropdown } from 'react-bootstrap';

const IdfDropdown = ({ defaultValue, className, variant, items, onChange }) => {
  const handleChange = (selected) => {
    onChange(selected);
  };

  return (
    <Dropdown>
      {items.length > 0 && (
        <>
          <Dropdown.Toggle
            id="dropdown-basic"
            variant={variant}
            className={`btn-ghost-primary ${className}`}
          >
            {defaultValue?.label}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ minWidth: 200, zIndex: 999 }}>
            {items?.map((item) => (
              <Dropdown.Item
                key={item.value}
                onClick={handleChange.bind(this, item)}
              >
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </>
      )}
    </Dropdown>
  );
};

export default IdfDropdown;
