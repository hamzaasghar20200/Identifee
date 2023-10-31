import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';

import { ALL_LABEL, NO_DATA_YET } from '../utils/constants';
import { tagsColorNormal } from '../views/Deals/contacts/Contacts.constants';
import Item from './Item';
import ItemName from './ItemName';
import List from './List';
import useOutsideClickDropDown from '../hooks/useOutsideClickDropDown';
import MaterialIcon from './commons/MaterialIcon';

const ItemDefault = ({
  hideIcon,
  style,
  name,
  title,
  isSmall,
  onClick,
  className,
}) => {
  return (
    <Item className="px-0" id={`item-${title}`}>
      {!hideIcon && <div className={className} style={style} />}
      <ItemName name={name} bigmx={isSmall} onClick={onClick} />
    </Item>
  );
};

const ItemCustomField = ({
  name,
  icon,
  description,
  last,
  onClick,
  selectedOption,
}) => {
  return (
    <Item
      onClick={onClick}
      id={`item-${name}`}
      className={`${!last ? 'border-bottom' : ''} ${
        selectedOption?.name === name ? 'bg-blue-soft font-weight-bold' : ''
      }  py-2`}
    >
      <Row noGutters className="w-100 align-items-center">
        <Col xs={2} className="text-center">
          <span className="material-icons-outlined fs-5">{icon}</span>
        </Col>
        <Col xs={10} className="pl-0">
          <h5 className="mb-0 fs-7">{name}</h5>
          <p className="text-muted fs-7 mb-0">{description}</p>
        </Col>
      </Row>
    </Item>
  );
};

const DropdownSelect = (props) => {
  const [selectedTitle, setSelectedTitle] = useState('');
  const dropdownRef = useRef(null);

  const {
    data = [],
    onHandleSelect,
    selected,
    select,
    customTitle,
    allOption,
    anyOption,
    validationConfig,
    fieldState,
    hideIcon = false,
    customClasses,
    placeholder,
    isSmall = false,
    typeMenu,
    group,
    hideSelection,
    toggleButtonClasses,
    disabled,
    selectIcon,
  } = props || {};

  const [show, setShow] = useState(false);
  const [option, setOption] = useState({});

  useOutsideClickDropDown(dropdownRef, show, setShow);

  const onSelect = (value, e) => {
    setShow(false);
    setOption(value);
    onHandleSelect(value, e);
  };

  const RenderItemList = ({ item, last }) => {
    switch (typeMenu) {
      case 'custom': {
        const { name, icon } = item;
        return (
          <ItemCustomField
            name={name}
            icon={icon}
            last={last}
            onClick={(e) => onSelect(item, e)}
            selectedOption={option}
          />
        );
      }
      default: {
        const { title, name } = item;
        return (
          <ItemDefault
            hideIcon={hideIcon}
            title={title}
            className={`mr-2 rounded-circle bullet-color`}
            name={customTitle ? item[customTitle] : title || name}
            bigmx={isSmall}
            onClick={(e) => onSelect(item, e)}
            style={{
              background: tagsColorNormal[name],
            }}
          />
        );
      }
    }
  };

  const onHandleToggle = (isOpen, event, metadata) => {
    if (metadata.source !== 'select') {
      setShow(isOpen);
    }
  };

  useEffect(() => {
    if (select) {
      const foundSelected = data.find((item) => item.field_type === select);
      if (foundSelected) {
        setSelectedTitle(foundSelected.name);
        setOption(foundSelected);
      }
    }
  }, [select]);

  return (
    <Dropdown
      show={show}
      onToggle={onHandleToggle}
      drop="down"
      className={`${toggleButtonClasses} ${
        group ? 'border rounded-top-right-1 rounded-bottom-right-1' : 'rounded'
      }`}
    >
      <Dropdown.Toggle
        disabled={disabled}
        className={`w-100 bg-white ${isSmall ? '' : 'dropdown-search'}  ${
          !select && placeholder ? 'text-muted' : 'text-black'
        } text-capitalize ${
          validationConfig?.required
            ? 'border-left-4 border-left-danger rounded'
            : ''
        } ${
          fieldState?.invalid && !fieldState?.error?.ref?.value
            ? 'border-danger'
            : ''
        }`}
        variant="outline-link"
        id="dropdown"
      >
        <div className="d-inline-block text-truncate text-left w-90">
          {(option?.icon || selectIcon) && (
            <MaterialIcon icon={option?.icon || selectIcon} clazz="mr-1" />
          )}
          <span>{selectedTitle || select || placeholder}</span>
        </div>
      </Dropdown.Toggle>

      {!hideSelection && (
        <Dropdown.Menu
          id="dropdown-menu-select"
          ref={dropdownRef}
          style={{ width: '!important' }}
          className={`py-1 px-0 ${!customClasses ? 'w-50' : customClasses}`}
        >
          <Col xs={12} className="p-0 w-100">
            <List>
              {allOption && (
                <ItemDefault
                  className="rounded-circle bg-secondary pl-3"
                  name={ALL_LABEL}
                  onClick={() => onSelect(ALL_LABEL.toLowerCase())}
                />
              )}

              {anyOption && (
                <ItemDefault
                  className="bg-secondary"
                  name="any"
                  onClick={() => onSelect('any')}
                />
              )}

              {!data?.length && <ItemName name={NO_DATA_YET} />}

              {data
                ?.filter((i) =>
                  selected ? !Object.values(selected).includes(i) : i
                )
                ?.map((item, index) => (
                  <RenderItemList
                    key={index}
                    item={item}
                    last={index === data?.length - 1}
                  />
                ))}
            </List>
          </Col>
          {props.children}
        </Dropdown.Menu>
      )}
    </Dropdown>
  );
};

export default DropdownSelect;
