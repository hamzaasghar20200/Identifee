import Avatar from './Avatar';
import ItemName from './ItemName';
import ItemAvatar from './ItemAvatar';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useEffect, useRef, useState } from 'react';
import { FormLabel } from 'react-bootstrap';
import _ from 'lodash';
import MaterialIcon from './commons/MaterialIcon';

const AutoComplete = (props) => {
  const {
    id,
    data, // listing/options to render
    onChange, // when input gets changed
    onHandleSelect, // when item gets clicked
    customKey = '', // json key to read when render
    customKeyFunc,
    showAvatar,
    name,
    showIcon,
    placeholder,
    loading,
    clearState,
    showClear = false,
    extraTitles,
    selected = '',
    charactersRequire,
    createItem,
    errorClass,
    validationConfig,
    fieldState,
    label,
    isMultiple = false,
    type = 'item', // organization/contact/people etc
  } = props;

  const typeaheadRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState([
    { [customKey]: selected },
  ]);
  const [newItemSelect, setNewItemSelect] = useState(false);
  const [isClearState, setClearState] = useState(false);
  const onHandleChange = (item) => {
    if (isMultiple) {
      const allIds = item.map((m) => m.id);
      const removedItem = selected.filter(
        (value) => !allIds.includes(value.id)
      );
      onChange(item, removedItem.length && removedItem[0]);
    } else {
      const selectedItem = item && item[0];
      // when new item is selected from dd
      if (selectedItem && selectedItem?.customOption) {
        setNewItemSelect(true);
        createItem(selectedItem.name);
      } else {
        setNewItemSelect(false);
      }
    }
  };

  const onSelectData = (item, name) => {
    if (isMultiple) {
      onHandleSelect(item);
      if (item) {
        setClearState(true);
      } else {
        setClearState(false);
      }
    } else {
      setNewItemSelect(false);
      const selectedVal =
        item[customKey] ||
        item.name ||
        (item.first_name !== null &&
          `${item.first_name} ${item.last_name && item.last_name}`) ||
        item.email;

      setSelectedOption([{ ...item, [customKey]: selectedVal }]);
      onHandleSelect(item, name);
      if (item) {
        setClearState(true);
      } else {
        setClearState(false);
      }
    }
  };

  const searchAndSetSelectedOption = (value) => {
    if (!isMultiple) {
      const e = { target: { value } };
      setSelectedOption([{ ...selectedOption, [customKey]: value }]);
      onChange(e);
      if (value) {
        setClearState(true);
      } else {
        setClearState(false);
      }
    }
  };

  const handleEnter = (e) => {
    if (e.code === 'Enter') {
      e.preventDefault();
      const { activeItem } = typeaheadRef.current.state;
      onSelectData(activeItem, name);
    }
  };

  useEffect(() => {
    if (_.isString(selected)) {
      setSelectedOption([{ ...selectedOption, [customKey]: selected }]);
    }
  }, [selected]);
  const clearSelect = () => {
    clearState(name);
    setSelectedOption([]);
    setClearState(false);
  };
  return (
    <div className="dropdown-search-v2 position-relative">
      {label && (
        <FormLabel htmlFor="organization" className="d-block text-sm">
          {label}
        </FormLabel>
      )}
      <Typeahead
        allowNew={!!createItem}
        newSelectionPrefix={`Add a new ${type}: `}
        className={`${errorClass} ${
          validationConfig?.required
            ? 'border-left-4 border-left-danger rounded'
            : ''
        } ${
          fieldState?.invalid && !fieldState?.error?.ref?.value
            ? 'border rounded border-danger'
            : ''
        }`}
        id={id}
        multiple={isMultiple}
        ref={typeaheadRef}
        name={name}
        isLoading={loading}
        labelKey={customKey || customKeyFunc}
        onInputChange={(value) => searchAndSetSelectedOption(value)}
        onSearch={(value) => searchAndSetSelectedOption(value)}
        maxResults={100}
        minLength={0}
        flip={true}
        onChange={onHandleChange}
        selected={isMultiple ? selected : selectedOption}
        options={data}
        placeholder={placeholder}
        onKeyDown={(e) => handleEnter(e)}
        renderMenuItemChildren={(item) => (
          <div
            className={`${item?.icon ? 'px-2 py-0' : 'px-3 py-1'}`}
            key={item.id || item.name}
          >
            <div
              className="user-avatar-select w-100"
              onClick={() => onSelectData(item, name)}
            >
              {showAvatar && (
                <ItemAvatar>
                  <Avatar user={item} />
                </ItemAvatar>
              )}

              <ItemName
                itemIcon={item?.icon}
                showIcon={showIcon}
                name={
                  customKey
                    ? item[customKey] +
                      (extraTitles && extraTitles.filter((i) => item[i]).length
                        ? `  (${extraTitles.map((i) => item[i]).join(', ')})`
                        : '')
                    : item.first_name || item.last_name
                    ? `${item.first_name} ${item.last_name}`
                    : item.email
                }
              />
            </div>
          </div>
        )}
        useCache={false}
      />
      {newItemSelect && (
        <div className="position-absolute" style={{ top: 9, right: 30 }}>
          <span className="badge bg-primary text-white">NEW</span>
        </div>
      )}
      {charactersRequire && (
        <span className="characters-check">Atleast 2 Characters</span>
      )}
      {(isClearState || selectedOption[0]?.name) && showClear && (
        <MaterialIcon
          onClick={clearSelect}
          clazz="clear-field cursor-pointer"
          icon={'close'}
        />
      )}
    </div>
  );
};

export default AutoComplete;
