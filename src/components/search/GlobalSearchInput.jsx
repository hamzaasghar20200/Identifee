import { forwardRef, useEffect, useState } from 'react';

import {
  Button,
  Dropdown,
  Form,
  FormControl,
  InputGroup,
  Spinner,
} from 'react-bootstrap';

export const GlobalSearchInput = ({
  searchValue,
  setSearchValue,
  show,
  setShow,
  loading,
  setLoading,
  setResearch,
}) => (
  <Dropdown.Toggle
    as={CustomSearchInput}
    searchValue={searchValue}
    setSearchValue={setSearchValue}
    show={show}
    setShow={setShow}
    loading={loading}
    setLoading={setLoading}
    setResearch={setResearch}
  />
);

const CustomSearchInput = forwardRef(
  (
    {
      show,
      setShow,
      searchValue,
      addFocus,
      setSearchValue,
      loading,
      setLoading,
      setResearch,
    },
    ref
  ) => {
    const [inputHover, setInputHover] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    const clearInput = () => {
      closeDropdown();
      setSearchValue('');
      setShowIcon(false);
    };

    const closeDropdown = () => {
      setShow(false);
    };

    const openDropdown = () => {
      setShow(true);
    };

    const inputClickHandler = (e) => {
      const { value } = e.target;
      value.length >= 3 && !show && setShow(true);
      value.length >= 3 && !show && setShowIcon(true);
    };

    const inputValueHandler = (e) => {
      e.preventDefault();
      const { value } = e.target;
      setSearchValue(value);

      value.length >= 3 ? !show && openDropdown(e) : show && closeDropdown(e);
      value.length >= 3 && !show && setShowIcon(true);
    };
    const inputFocus = () => {
      const input = document.getElementById('global-search-input');
      input.focus();
      setShow(false);
    };

    const addHover = () => {
      setInputHover(true);
    };
    const removeHover = () => setInputHover(false);
    useEffect(() => {
      if (searchValue) {
        setShowIcon(true);
      } else {
        setShowIcon(false);
        setShow(false);
        setInputHover(false);
      }
    }, [searchValue]);
    return (
      <>
        <SearchForm onMouseOver={addHover} onMouseOut={removeHover}>
          <SearchInput
            ref={ref}
            inputHover={inputHover}
            value={searchValue}
            onChange={inputValueHandler}
            onClick={inputClickHandler}
          />
          {loading ? (
            <SearchSpinner />
          ) : (
            <SearchButton
              onClick={() => {
                if (searchValue) {
                  inputClickHandler({ target: { value: searchValue } });
                  setResearch((prev) => prev + 1);
                } else {
                  inputFocus();
                }
              }}
            />
          )}
          <ResetButton onClick={clearInput} showIcon={showIcon} />
        </SearchForm>
      </>
    );
  }
);

CustomSearchInput.displayName = 'CustomSearchInput';

const SearchForm = ({ onMouseOut, onMouseOver, children }) => (
  <Form className="search-fixed border-0">
    <InputGroup size="sm" onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {children}
    </InputGroup>
  </Form>
);
const SearchButton = ({ onClick }) => (
  <InputGroup.Text role="button" onClick={onClick} className="border-0 pr-0">
    <span className="material-icons-outlined">search</span>
  </InputGroup.Text>
);

const SearchSpinner = () => (
  <InputGroup.Text role="span" className="border-0 pl-3 pr-0">
    <Spinner animation="border" size="sm" variant="primary" />
  </InputGroup.Text>
);

const SearchInput = forwardRef(
  ({ inputHover, value, onChange, onClick, onFocus }, ref) => (
    <FormControl
      id="global-search-input"
      ref={ref}
      aria-label="Search"
      className={`border-0 search-input`}
      placeholder="Search"
      value={value}
      onFocus={onFocus}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    />
  )
);

SearchInput.displayName = 'SearchInput';

const ResetButton = ({ onClick, showIcon }) =>
  showIcon && (
    <Button
      variant="link"
      className="border-0 pl-0"
      size="sm"
      onClick={onClick}
    >
      <span className="material-icons-outlined search-close">close</span>
    </Button>
  );
