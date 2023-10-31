import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

import IdfFormInput from '../../../idfComponents/idfFormInput/IdfFormInput';
import useOutsideClickDropDown from '../../../../hooks/useOutsideClickDropDown';
import MaterialIcon from '../../../commons/MaterialIcon';
import TooltipComponent from '../../../lesson/Tooltip';

const DropDownSearch = ({
  placeholder,
  onChange,
  onSelect,
  options = [],
  customKey,
  inputVal,
  allowClear,
}) => {
  const dropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(inputVal || '');

  useEffect(() => {
    try {
      if (inputVal) {
        setInputValue(inputVal);
      }
    } catch (e) {}
  }, [inputVal]);

  const onHandleChange = (e) => {
    const { value } = e.target;
    setInputValue(value);
    onChange(value);
    setIsMenuOpen(true);
  };

  const onHandleSelect = (item) => {
    onSelect(item);
    setInputValue('');
    onChange('');
    setIsMenuOpen(false);
  };

  useOutsideClickDropDown(dropdownRef, isMenuOpen, setIsMenuOpen);

  return (
    <div>
      <Dropdown
        show={isMenuOpen}
        ref={dropdownRef}
        drop="down"
        onToggle={(isOpen, event, metadata) => {
          if (metadata.source !== 'select') {
            setIsMenuOpen(isOpen);
            if (isOpen) {
              onChange(inputValue);
            }
          }
        }}
      >
        <Dropdown.Toggle
          as="div"
          className="tags-dropdown w-100 border rounded dropdown-input p-0"
          id="dropdown-basic"
        >
          <div className="position-relative">
            <IdfFormInput
              className="mb-0 w-100"
              inputClassName="border-0 text-truncate"
              placeholder={placeholder}
              value={{ search: inputValue }}
              name="search"
              onChange={onHandleChange}
              autocomplete="off"
              onKeyDown={(e) => {
                if (e.code === 'Enter') {
                  e.preventDefault();
                  onHandleSelect(inputValue);
                }
              }}
            />
            {allowClear && inputValue && (
              <TooltipComponent title="Clear">
                <a
                  href=""
                  className="position-absolute d-flex justify-content-center align-items-center abs-center-y icon-hover-bg bg-white"
                  style={{ right: 10 }}
                  onClick={(e) => {
                    e.preventDefault();
                    setInputValue('');
                    setIsMenuOpen(true);
                    document.getElementById('search').focus();
                  }}
                >
                  <MaterialIcon icon="close" />
                </a>
              </TooltipComponent>
            )}
          </div>
        </Dropdown.Toggle>

        {!!options.length && (
          <Dropdown.Menu className="w-100 basic-animation menu-drop-style py-1 z-index-100">
            {options.map((item, index) => {
              const title = customKey ? item[customKey] : item;
              return (
                <Dropdown.Item
                  as="a"
                  href=""
                  className="cursor-pointer text-black"
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    onHandleSelect(item);
                  }}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: title.replace(
                        new RegExp(inputValue, 'gi'),
                        (match) => `<b>${match}</b>`
                      ),
                    }}
                  />
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        )}
      </Dropdown>
    </div>
  );
};

export default DropDownSearch;
