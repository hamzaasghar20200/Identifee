import { useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';

export const GlobalSearchMain = ({
  autoClose,
  children,
  show,
  setShow,
  setSearchResults,
  setSearchValue,
}) => {
  const autoCloseHandler = (isOpen, event, metadata) => {
    if (metadata.source !== 'select') {
      setShow(isOpen);
    }
  };
  const closeDropdown = () => {
    setShow(false);
  };
  const toogleHandler = autoClose ? autoCloseHandler : () => {};
  useEffect(() => {
    if (!show) {
      setSearchResults([]);
      setSearchValue('');
    }
  }, [show]);
  const BackDrop = ({ onClick, show }) =>
    show && <div className="search-dropdown-backdrop" onClick={onClick}></div>;
  return (
    <>
      <Dropdown
        onToggle={toogleHandler}
        show={show}
        className={`global-search-dropdown`}
      >
        {children}
      </Dropdown>
      <BackDrop onClick={closeDropdown} show={show} />
    </>
  );
};
