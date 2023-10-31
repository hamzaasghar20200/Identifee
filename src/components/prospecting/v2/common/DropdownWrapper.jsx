import React from 'react';

import ListItems from '../../filters/ListItems';
import DropDownSearch from './DropDownSearch';

const DropdownWrapper = ({
  placeholder = '',
  onChange,
  onSelect,
  options,
  customKey,
  selects = [],
  onRemoveSelect,
  onClear,
  inputVal,
  allowClear,
}) => {
  return (
    <>
      <DropDownSearch
        placeholder={placeholder}
        onChange={onChange}
        onSelect={onSelect}
        options={options}
        customKey={customKey}
        inputVal={inputVal}
        allowClear={allowClear}
      />
      {!!selects.length && (
        <ListItems
          items={selects}
          options={options}
          deleteItem={onRemoveSelect}
          onClear={onClear}
          customKey={customKey}
        />
      )}
    </>
  );
};

export default DropdownWrapper;
