import React from 'react';
import { options } from './ManageUsers.constants';
import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';
import { Dropdown } from 'react-bootstrap';
import MaterialIcon from '../commons/MaterialIcon';

export default function Filters({
  openFilter,
  setOpenFilter,
  filterOptionSelected,
  handleFilterSelect,
}) {
  return (
    <>
      <ButtonFilterDropdown
        filterOptionSelected={filterOptionSelected}
        options={options}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        customKeys={['id', 'title']}
        handleFilterSelect={handleFilterSelect}
      >
        <Dropdown.Menu className="p-0" style={{ minWidth: 320 }}>
          <div className="py-1 idf-dropdown-item-list">
            {options.map((option) => (
              <Dropdown.Item
                key={option.id}
                href="#"
                onClick={(e) => handleFilterSelect(e, option)}
                className="px-3"
              >
                <div className="d-flex align-items-center justify-content-between py-1">
                  <span
                    className={
                      filterOptionSelected.id === option.id ? 'fw-bold' : ''
                    }
                  >
                    {option.title}
                  </span>
                  {filterOptionSelected.id === option.id && (
                    <MaterialIcon icon="check" clazz="fw-bold" />
                  )}
                </div>
              </Dropdown.Item>
            ))}
          </div>
        </Dropdown.Menu>
      </ButtonFilterDropdown>
    </>
  );
}
