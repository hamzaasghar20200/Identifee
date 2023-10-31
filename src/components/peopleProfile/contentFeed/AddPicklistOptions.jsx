import React, { useState, useEffect, useRef } from 'react';
import { OverlayTrigger, Tooltip, Dropdown } from 'react-bootstrap';

import '../../tagInput/TagInput.css';
import { CardLabel } from '../../layouts/ActivityLayout';
import MaterialIcon from '../../commons/MaterialIcon';

const AddPicklistOptions = ({
  dropdownList = [],
  placeholder,
  value = [],
  setValue,
  tooltip,
  validationConfig,
  fieldState,
  onChange,
  labelSize,
}) => {
  const [tags, setTags] = useState(value);
  const [options, setOptions] = useState(dropdownList);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [textValue, setTextValue] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const inputRef = useRef(null);
  const dropdownButtonRef = useRef(null);
  const [dropDirection, setDropDirection] = useState(null);

  useEffect(() => {
    if (showTooltip) {
      setTimeout(() => setShowTooltip(false), 4000);
    }
  }, [showTooltip]);

  useEffect(() => {
    setOptions(dropdownList);
  }, [dropdownList]);

  useEffect(() => {
    if (value.length) {
      setTags(value);
      if (!isEdit) setTextValue('');
      else setIsEdit(false);
    }
  }, [value]);

  useEffect(() => {
    if (dropdownList?.length) {
      if (tags.length) {
        const newList = [];
        dropdownList.forEach((el) => {
          for (let i = 0; i < tags.length; i++) {
            const item = tags[i];
            if (el.value === item.value) break;
            else if (i === tags.length - 1) {
              newList.push(el);
            }
          }
        });
        setOptions(newList);
      } else {
        setOptions(dropdownList);
      }
    }
  }, [tags, value, dropdownList]);

  const handleDropdown = (item) => {
    setShowDrop(true);
    inputRef.current.focus();
    const newTags = [...tags, { value: item.value }];
    setTags(newTags);
    setValue(newTags);
  };

  const handleInput = (e) => {
    onChange(value);
  };

  const removeTag = (index) => {
    const newValues = tags.filter((tag) => tags.indexOf(tag) !== index);
    setTags(newValues);
    setValue(newValues);
    setShowDrop(false);
  };

  const editTag = (tag, index) => {
    if (tag.alert) {
      setIsEdit(true);
      removeTag(index);
      setTextValue(tag.value);
      onChange(tag.value);
    }
  };

  const filteredOptionsLength = () => {
    return options.filter((val) =>
      textValue ? val.value.includes(textValue) : true
    ).length;
  };

  const handleToggle = (open, event, metadata) => {
    if (!open) {
      setShowDrop(false);
    }
    if (open) {
      const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const spaceBelow = windowHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      const direction = spaceBelow > spaceAbove ? 'down' : 'up';
      setDropDirection(direction);
    }
  };

  const getMarginTop = () => {
    if (dropDirection === 'down' && tags.length === 0) {
      return 0;
    } else if (dropDirection === 'down' && tags.length > 0) {
      return 45;
    }
    return 0;
  };

  const getMarginBottom = () => {
    if (dropDirection === 'up' && tags.length === 0) {
      return 80;
    } else if (dropDirection === 'up' && tags.length > 0) {
      return 120;
    }
    return 0;
  };

  return (
    <CardLabel labelSize={labelSize}>
      <div
        className={`tags-input-main ml-1 ${
          validationConfig?.required
            ? 'border-left-4 border-left-danger rounded'
            : ''
        } ${
          fieldState?.invalid && !fieldState?.error?.ref?.value
            ? 'border-danger'
            : ''
        }`}
      >
        <Dropdown show={showDrop} onToggle={handleToggle}>
          {tags.length ? (
            <ul className="tags">
              {tags.map((tag, i) => (
                <li
                  key={i}
                  className={`tag-item rounded ${tag.alert ? 'tag-alert' : ''}`}
                >
                  <span
                    className="tag-title fs-8 font-weight-semi-bold"
                    onClick={() => editTag(tag, i)}
                  >
                    {tag.value} {Boolean(tag?.email) && `(${tag?.email})`}
                  </span>
                  <button
                    type="button"
                    className="button fs-8 ml-0"
                    onClick={() => removeTag(i)}
                  >
                    <MaterialIcon icon="close" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <OverlayTrigger
            show={showTooltip}
            placement="left"
            overlay={<Tooltip id={`tooltip-tag-input`}>{tooltip}</Tooltip>}
          >
            <Dropdown.Toggle
              ref={dropdownButtonRef}
              className={`tags-dropdown w-100 dropdown-input no-hover`}
            >
              <input
                id="input-guests"
                value={textValue}
                type="text"
                placeholder={options.length ? placeholder : 'No more options.'}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyUp={(e) => handleInput(e)}
                onClick={() => setShowDrop(true)}
                autoComplete="off"
                ref={inputRef}
              />
            </Dropdown.Toggle>
          </OverlayTrigger>
          {filteredOptionsLength() > 0 ? (
            <Dropdown.Menu
              className="w-100"
              id={'dropdown-tags'}
              flip={true}
              style={{
                marginTop: getMarginTop(),
                marginBottom: getMarginBottom(),
              }}
            >
              <div>
                {options
                  .filter((val) =>
                    textValue ? val.value.includes(textValue) : true
                  )
                  .map((item, i) => {
                    const id = `data-${i}`;
                    return (
                      <div
                        key={id}
                        onClick={() => {
                          handleDropdown(item);
                        }}
                      >
                        <Dropdown.Item>
                          <span>{item.value}</span>
                        </Dropdown.Item>
                      </div>
                    );
                  })}
              </div>
            </Dropdown.Menu>
          ) : null}
        </Dropdown>
      </div>
    </CardLabel>
  );
};

export default AddPicklistOptions;
