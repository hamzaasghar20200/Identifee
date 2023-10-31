import { useEffect, useState, useRef } from 'react';
import { Col, Form, Dropdown } from 'react-bootstrap';
import { tagsColorNormal } from '../../../views/Deals/contacts/Contacts.constants';
import Avatar from '../../Avatar';
import ItemAvatar from '../../ItemAvatar';
import ItemName from '../../ItemName';
import List from '../../List';

const IdfDropdownSearch = (props) => {
  const {
    id,
    title,
    data,
    customTitle,
    onHandleSelect,
    value,
    onChange,
    charactersRequire,
    showAvatar,
    bulletPoints,
    className,
    hidden,
    showIcon,
    disabled,
    icon,
    bodyIcon,
    errorClass,
    withData,
    extraTitles,
    changeOrg,
    changeOrgName,
    setChangeOrgName,
    name,
    setAddNewOrg,
    organizationTitle,
    fieldState = {},
    validationConfig = {},
    defaultStyleClass = 'dropdown-search',
  } = props;
  const dropdownRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState(title);
  const [searchInput, setSearchInput] = useState('');
  const [addNewIcon, setAddNewIcon] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (isMenuOpen) {
      try {
        inputRef.current.focus();
      } catch (e) {}
    }
  }, [isMenuOpen]);

  // Function used when the menu is open and the clicked target is not within the menu, then close the menu.
  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        isMenuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!changeOrg && organizationTitle) {
      setChangeOrgName({ ...changeOrgName, name: value });
    }
    setSearchTitle(
      value === undefined ? (
        <div style={{ color: 'gray', opacity: '0.7' }}>Select Manager</div>
      ) : (
        value || title
      )
    );
  }, [value]);

  const selectedText =
    (value && 'text-black') || (searchTitle !== title && 'text-black');

  const handleSelect = (e, item) => {
    onHandleSelect(e, item);
    setIsMenuOpen(false);

    if (changeOrg) {
      setChangeOrgName({
        name: item?.organization?.name,
        id: item?.organization?.id,
      });
    } else if (organizationTitle)
      setChangeOrgName({ name: item?.name, id: item?.id });

    setSearchTitle(
      item[customTitle] ||
        `${item.first_name !== null ? item.first_name : item.email} ${
          item.last_name !== null ? item.last_name : ''
        }`
    );
  };

  if (disabled) {
    const dropToDisable = document.getElementById('dropdown-toogle');

    if (dropToDisable) {
      dropToDisable.classList.add('drop-disabled');
    }
  }

  const onToggle = (isOpen, metadata) => {
    if (disabled) {
      return setIsMenuOpen(false);
    } else if (metadata.source !== 'select') {
      setIsMenuOpen(isOpen);
    }
  };
  return (
    <Dropdown
      aria-hidden={hidden}
      hidden={hidden}
      ref={dropdownRef}
      show={isMenuOpen}
      id={`dropdown-${id}`}
      key={`dropdown-${id}-${data?.length || 0}`}
      className={className}
      onToggle={onToggle}
    >
      <Dropdown.Toggle
        id="dropdown-toogle"
        disabled={disabled}
        className={`w-100 ${defaultStyleClass} form-control ${selectedText} ${errorClass} ${
          validationConfig?.required ? 'border-left-4 border-left-danger' : ''
        } ${
          fieldState.invalid && !fieldState?.error?.ref?.value
            ? 'border-danger'
            : ''
        } `}
        variant="outline-link"
      >
        {icon && <span className="material-icons-outlined mr-2">{icon}</span>}
        <span className="w-90 text-truncate text-left">
          {changeOrg ? searchTitle : changeOrgName?.name || searchTitle}
        </span>
        {addNewIcon ? (
          <span className="badge bg-primary text-white">New</span>
        ) : (
          ''
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="border border-1 overflow-auto w-100 z-index-100">
        <Col xs={12}>
          <Form.Control
            type="text"
            onChange={(e) => {
              onChange(e);
              setSearchInput(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder={title}
            ref={inputRef}
            inputRef={inputRef}
          />
          {charactersRequire && (
            <span className="characters-check">Atleast 2 Characters</span>
          )}
        </Col>

        <List className="dropdown-results pt-2 pl-3 px-3">
          {data?.map((item) => (
            <>
              <Dropdown.Item
                className="p-2 item-btn rounded w-100 tr-hover cursor-pointer"
                id={`item-${item.id}`}
                key={`item-${item.id || item.name}`}
                data-testid={`item-${item.id}`}
                onClick={(e) => handleSelect(e, item)}
              >
                <div className="user-avatar-select w-100">
                  {bulletPoints && (
                    <div
                      className={`ml-3 rounded-circle bullet-color`}
                      style={{
                        background: tagsColorNormal[item.name],
                      }}
                    />
                  )}
                  {showAvatar && (
                    <ItemAvatar>
                      <Avatar user={item} />
                    </ItemAvatar>
                  )}
                  {bodyIcon && (
                    <span className="material-icons-outlined mr-2">{icon}</span>
                  )}
                  <ItemName
                    itemIcon={item?.icon}
                    showIcon={showIcon}
                    name={
                      item.first_name !== null
                        ? customTitle
                          ? item[customTitle] +
                            (withData ? ` (${item?.organization?.name})` : '')
                          : `${item.first_name} ${item.last_name}`
                        : customTitle
                        ? item[customTitle] +
                          (withData ? ` (${item?.organization?.name})` : '') +
                          (extraTitles &&
                          extraTitles.filter((i) => item[i]).length
                            ? ` (${extraTitles.map((i) => item[i]).join(' ')})`
                            : '')
                        : `${item.email}`
                    }
                    address={
                      extraTitles && extraTitles.filter((i) => item[i]).length
                        ? ` (${extraTitles.map((i) => item[i]).join(' ')})`
                        : ''
                    }
                  />
                </div>
              </Dropdown.Item>
            </>
          ))}
        </List>
        {searchInput && name === 'Organization' ? (
          <div style={{ padding: '0 30px' }}>
            <hr />
            <div
              className="w-100 py-2 cursor-pointer"
              onClick={() => {
                setIsMenuOpen(false);
                if (!changeOrg && organizationTitle) {
                  setChangeOrgName({ ...changeOrgName, name: searchInput });
                  setAddNewOrg({ name: searchInput });
                  setAddNewIcon(true);
                }
              }}
            >
              <h5 className="mb-0 text-primary">
                <span className="material-icons-outlined">add</span>Add{' '}
                {searchInput} as new {name}
              </h5>
            </div>
          </div>
        ) : (
          ''
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default IdfDropdownSearch;
