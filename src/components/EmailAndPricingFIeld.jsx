import React, { useState, useEffect, useRef } from 'react';
import { Col, Dropdown, Row } from 'react-bootstrap';

import { ALL_LABEL, NO_DATA_YET } from '../utils/constants';
import { tagsColorNormal } from '../views/Deals/contacts/Contacts.constants';
import Item from './Item';
import ItemName from './ItemName';
import List from './List';
import useOutsideClickDropDown from '../hooks/useOutsideClickDropDown';
import MaterialIcon from './commons/MaterialIcon';
import { Input, Label } from 'reactstrap';
import ButtonIcon from './commons/ButtonIcon';
import { onInputChange } from '../views/Deals/contacts/utils';

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

const EmailAndPricingFIeld = (props) => {
  const [selectedTitle, setSelectedTitle] = useState('');
  const [addData, setAddData] = useState([]);
  const dropdownRef = useRef(null);

  const {
    data = [],
    onHandleSelect,
    selected,
    allOption,
    anyOption,
    hideIcon = false,
    dispatch,
    peopleFormData,
    customClasses,
    isSmall = false,
    typeMenu,
    group,
    hideSelection,
    toggleButtonClasses,
    disabled,
  } = props || {};

  const [show, setShow] = useState(false);
  const [option, setOption] = useState({});
  const [selectedItem, setSelectedItem] = useState({});
  useOutsideClickDropDown(dropdownRef, show, setShow);
  const [dropdownData, setDropdownData] = useState(data);
  const onSelect = (value, e) => {
    setShow(false);
    setOption(value);
    onHandleSelect(value, e);
  };

  const RenderItemList = ({ item, last }) => {
    switch (typeMenu) {
      case 'custom': {
        const { icon } = item;
        return (
          <ItemCustomField
            name={item?.Key}
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
            name={item?.key}
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
    if (dropdownData?.length) {
      setSelectedItem(dropdownData[0]);
    }
  }, [dropdownData]);
  useEffect(() => {
    if (selectedItem?.key) {
      const foundSelected = data.find(
        (item) => item.field_type === selectedItem?.key
      );
      if (foundSelected) {
        setSelectedTitle(foundSelected.name);
        setOption(foundSelected);
      }
    }
  }, [selectedItem?.key]);
  const handleAddInputSection = (item) => {
    const defaultData = dropdownData.filter((child) => {
      return child.id !== item?.id;
    });
    setDropdownData(defaultData);
    const arr = [...addData];
    arr.push(item);
    setAddData(arr);
  };
  const handleRemoveInputSection = (item) => {
    const defaultData = addData.filter((child) => {
      return child.id !== item?.id;
    });
    setAddData(defaultData);
    const arr = [...dropdownData];
    arr.push(item);
    setDropdownData(arr);
  };
  const checkObjData = () => {
    const data = Object.keys(peopleFormData);
    const items = dropdownData.filter((child, i) => {
      const datas = data?.filter((item) => {
        return child === item?.columnName;
      });
      return datas;
    });

    const arr = [...addData];
    if (!arr.includes(items)) {
      setAddData(arr, ...items);
    } else {
      return false;
    }
  };
  useEffect(() => {
    if (peopleFormData) {
      checkObjData();
    }
  }, [peopleFormData]);
  const handleChange = (e) => {
    onInputChange(e, dispatch);
  };

  return (
    <div className="container">
      {addData?.length !== data?.length ? (
        <Row className="mx-0 align-items-center">
          <Col md={4} className="pr-0">
            <Dropdown
              show={show}
              onToggle={onHandleToggle}
              drop="down"
              className={`${toggleButtonClasses} ${
                group
                  ? 'border rounded-top-right-1 rounded-bottom-right-1'
                  : 'rounded'
              }`}
            >
              <Dropdown.Toggle
                disabled={disabled}
                className={`w-100 bg-white text-capitalize text-black`}
                variant="outline-link"
                id="dropdown"
              >
                <div className="d-flex align-items-center w-100">
                  {option?.icon && (
                    <MaterialIcon icon={option?.icon} clazz="mr-1" />
                  )}
                  <span>{selectedItem?.key || selectedTitle?.name}</span>
                </div>
              </Dropdown.Toggle>

              {!hideSelection && (
                <Dropdown.Menu
                  id="dropdown-menu-select"
                  ref={dropdownRef}
                  style={{ width: '!important' }}
                  className={`py-1 px-0 ${
                    !customClasses ? 'w-50' : customClasses
                  }`}
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

                      {!dropdownData?.length && <ItemName name={NO_DATA_YET} />}

                      {dropdownData
                        ?.filter((i) =>
                          selected ? !Object.values(selected).includes(i) : i
                        )
                        ?.map((item, index) => (
                          <RenderItemList
                            key={index}
                            item={item}
                            last={index === dropdownData?.length - 1}
                          />
                        ))}
                    </List>
                  </Col>
                  {props.children}
                </Dropdown.Menu>
              )}
            </Dropdown>
          </Col>
          <Col md={7}>
            <Input
              className="form-control"
              name={selectedItem?.columnName}
              placeholder={selectedItem?.key}
              value={peopleFormData[selectedItem?.columnName]}
              onChange={(e) => handleChange(e)}
            />
          </Col>
          <Col md={1} className="pl-0">
            <ButtonIcon
              onclick={() => handleAddInputSection(selectedItem)}
              icon="add"
              type="button"
              label=""
              color="light"
              iconClass="text-black"
              classnames="text-white icon-hover-bg"
            />
          </Col>
        </Row>
      ) : (
        ''
      )}

      {addData?.length
        ? addData?.map((item, i) => {
            return (
              <Row className="mx-0 align-items-center mt-3" key={i}>
                <Col md={4} className="text-right">
                  <Label>{item?.key}</Label>
                </Col>
                <Col md={7} key={isSmall}>
                  <Input
                    name={item?.columnName}
                    className="form-control"
                    value={peopleFormData[item?.columnName]}
                    onChange={(e) => handleChange(e)}
                    placeholder={item?.key}
                  />
                </Col>
                <Col md={1} className="pl-0">
                  <ButtonIcon
                    onclick={() => handleRemoveInputSection(item)}
                    icon="remove"
                    type="button"
                    label=""
                    color="light"
                    iconClass="text-black"
                    classnames="text-white icon-hover-bg"
                  />
                </Col>
              </Row>
            );
          })
        : ''}
    </div>
  );
};

export default EmailAndPricingFIeld;
