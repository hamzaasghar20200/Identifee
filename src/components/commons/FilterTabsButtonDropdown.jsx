import userService from '../../services/user.service';
import { Dropdown, Tab, Tabs } from 'react-bootstrap';
import AutoComplete from '../AutoComplete';
import React, { useState, useEffect } from 'react';
import MaterialIcon from './MaterialIcon';
import ButtonFilterDropdown from './ButtonFilterDropdown';

const FilterTabsButtonDropdown = ({
  options,
  filterTabs,
  filterOptionSelected,
  setFilterOptionSelected,
  handleFilterSelect,
  filterSelected,
  setFilterSelected,
  setFilterTabs,
  openFilter,
  setOpenFilter,
  onHandleFilterOrg,
  defaultSelection,
}) => {
  const filterKeys = options.map((k) => k.key);
  const [filterSearch, setFilterSearch] = useState({
    name: !filterKeys.includes(filterOptionSelected?.key)
      ? filterOptionSelected?.name || ''
      : '',
  });
  const [usersData, setUsersData] = useState([]);

  const getFilterUsers = async (value = '') => {
    const { data } = await userService.getUsers(
      { value, filters: `$filter=status ne 'invited'` },
      { limit: 10 }
    );

    const { users } = data;
    const updatedUsers = users.map((u) => ({
      ...u,
      name: u?.first_name ? `${u.first_name} ${u.last_name}` : u.email,
    }));
    setUsersData(updatedUsers);
  };

  const onAutocompleteChange = async (e) => {
    const { value } = e.target;
    setFilterSearch({ name: value });
    getFilterUsers(value);
    if (!value) {
      setFilterOptionSelected(defaultSelection);
      setFilterSelected({
        ...filterSelected,
        filter: { assigned_user_id: null },
      });
    }
  };

  useEffect(() => {
    if (filterTabs === 'owners') {
      getFilterUsers();
    }
  }, [filterTabs]);

  return (
    <ButtonFilterDropdown
      filterOptionSelected={filterOptionSelected}
      options={options}
      openFilter={openFilter}
      setOpenFilter={setOpenFilter}
      handleFilterSelect={handleFilterSelect}
    >
      <Dropdown.Menu className="p-0 dropdown-center" style={{ minWidth: 320 }}>
        <Tabs
          fill
          justify
          id="controlled-tab-example"
          activeKey={filterTabs}
          onSelect={(k) => {
            setFilterTabs(k);
          }}
          className="mb-1 w-100 idf-tabs"
        >
          <Tab
            eventKey="owners"
            title={
              <span>
                <MaterialIcon icon="person" /> <span> Owners </span>
              </span>
            }
          >
            <div className="p-3">
              <AutoComplete
                id={'searchForOwner'}
                placeholder={'Search for owner'}
                name={'searchForOwner'}
                showAvatar={true}
                loading={false}
                onChange={onAutocompleteChange}
                data={usersData}
                showIcon={false}
                onHandleSelect={(item) => {
                  onHandleFilterOrg(item);
                }}
                customKey="name"
                selected={filterSearch?.name || ''}
              />
            </div>
          </Tab>
          <Tab
            eventKey="filters"
            title={
              <span>
                <MaterialIcon icon="filter_list" /> <span> Filters </span>
              </span>
            }
          >
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
                        filterOptionSelected.key === option.key ? 'fw-bold' : ''
                      }
                    >
                      {option.name}
                    </span>
                    {filterOptionSelected.key === option.key && (
                      <MaterialIcon icon="check" clazz="fw-bold" />
                    )}
                  </div>
                </Dropdown.Item>
              ))}
            </div>
          </Tab>
        </Tabs>
      </Dropdown.Menu>
    </ButtonFilterDropdown>
  );
};

export default FilterTabsButtonDropdown;
