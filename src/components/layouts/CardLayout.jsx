import {
  Card as CardBt,
  Row,
  Col,
  Form,
  Container,
  Dropdown,
  Button,
} from 'react-bootstrap';
import { Spinner } from 'reactstrap';
import { NAME_INVITED_USER } from '../../utils/constants';
import Avatar from '../Avatar';

import './layout.css';
import MaterialIcon from '../commons/MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';

export const Card = ({ children }) => {
  return <CardBt>{children}</CardBt>;
};

export const CardHeader = ({ children }) => {
  return (
    <CardBt.Header className="p-3 sticky-header">{children}</CardBt.Header>
  );
};

export const CardForm = ({ children, wrapInContainer = true }) => {
  return (
    <>
      {wrapInContainer ? (
        <Container>
          <Form>{children}</Form>
        </Container>
      ) : (
        <Form>{children}</Form>
      )}
    </>
  );
};

export const CardSection = ({ children, endLine, className }) => {
  const endLineClass = endLine ? ' border-bottom' : '';

  return (
    <Row className={`${className || 'px-3 py-2 mx-0'}${endLineClass}`}>
      {children}
    </Row>
  );
};

export const CardBlock = ({ children }) => {
  return <Col className="p-1">{children}</Col>;
};

export const CardContent = ({ children }) => {
  return (
    <Col className="pl-0 pr-0 pr-md-3 mt-3" sm={12} md={8}>
      {children}
    </Col>
  );
};

export const CardSide = ({ children }) => {
  return (
    <Col
      className="pl-0 pl-md-3 pr-0 mt-3 mb-4 border-md-left custom-switch-setting"
      sm={12}
      md={4}
    >
      {children}
    </Col>
  );
};

// Custom Columns
export const CardContentCustom = ({ children }) => {
  return (
    <Col className="pl-0 pr-0 pr-md-3 mt-3" sm={12} md={5}>
      {children}
    </Col>
  );
};

export const CardSideCustom = ({ children }) => {
  return (
    <Col
      className="pl-0 pl-md-3 pr-0 mt-3 mb-4 border-md-left custom-switch-setting"
      sm={12}
      md={7}
    >
      {children}
    </Col>
  );
};

export const CardTitle = ({ children }) => {
  return (
    <CardBt.Title as="h3" className="p-1">
      {children}
    </CardBt.Title>
  );
};

export const CardSubtitle = ({ children, endLine }) => {
  const endLineClass = endLine ? ' border-bottom' : '';

  return (
    <CardBt.Title as="h4" className={`mx-1 pb-3${endLineClass}`}>
      {children}
    </CardBt.Title>
  );
};

export const CardSubContent = ({ children }) => {
  return <div className="mx-1 pt-3 pb-6">{children}</div>;
};

export const TextInput = ({
  onChange,
  value,
  name,
  placeholder,
  label,
  classNameLabel,
}) => {
  return (
    <Form.Group as={Row} className="my-2">
      <Form.Label className={`label-mw ${classNameLabel}`} column xs>
        <h5>{label}</h5>
      </Form.Label>
      <Col xs>
        <Form.Control
          type="text"
          onChange={onChange}
          value={value}
          id={name}
          name={name}
          placeholder={placeholder}
        />
      </Col>
    </Form.Group>
  );
};

export const List = ({ children, className }) => {
  return (
    <Col xs={12} className={`px-0 mt-3 ${className}`}>
      {children}
    </Col>
  );
};

export const Item = ({ children, onClick }) => {
  return (
    <div className="p-2 item-btn rounded w-100" onClick={onClick}>
      <Row className="item-container" noGutters>
        {children}
      </Row>
    </div>
  );
};

export const ItemAvatar = ({ children }) => {
  return <Col className="item-avatar rounded-circle">{children}</Col>;
};

export const ItemUser = (itemUserProps) => {
  return (
    <Col id={itemUserProps.id} className="item-user mx-3">
      <h5 className="mb-0">{itemUserProps.name}</h5>
      <p className="m-0">{itemUserProps.email}</p>
    </Col>
  );
};

export const ItemActions = ({ children }) => {
  return <Col className="item-actions text-right">{children}</Col>;
};

export const CardButton = ({
  variant,
  disabled,
  onClick,
  title,
  isLoading,
  className,
  block,
  icon,
  id,
  type = 'button',
}) => {
  return (
    <Button
      id={id}
      className={className || ''}
      type={type}
      block={block || false}
      variant={variant || ''}
      onClick={onClick}
      disabled={disabled || false}
    >
      {isLoading ? (
        <Spinner className="spinner-grow-xs" />
      ) : (
        <>
          <span className="material-icons-outlined">{icon}</span> {title}
        </>
      )}
    </Button>
  );
};

export const SwitchInput = ({
  id,
  checked,
  onChange,
  onClick,
  label,
  disabled = false,
}) => {
  return (
    <div className="custom-control custom-switch py-1">
      <input
        type="checkbox"
        className="custom-control-input"
        id={id}
        checked={checked}
        onChange={onChange}
        onClick={onClick}
        disabled={disabled}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export const SwitchInputWithEditableControls = ({
  id,
  checked,
  onChange,
  onClick,
  label,
  disabled = false,
  controls,
}) => {
  return (
    <div className="d-flex align-items-center gap-1 flex-fill hover-actions">
      <div className="custom-control w-100 custom-switch py-1">
        <input
          type="checkbox"
          className="custom-control-input"
          id={id}
          checked={checked}
          onChange={onChange}
          onClick={onClick}
          disabled={disabled}
        />
        {controls ? (
          <>
            <label
              className={`custom-control-label with-input ${
                controls?.onRemove ? 'w-90' : 'w-100'
              }`}
              htmlFor={id}
            >
              <input
                type="text"
                className="form-control"
                maxLength={controls.maxLength}
                onChange={controls.onChange}
                value={label}
              />
            </label>
            {controls.onRemove && (
              <TooltipComponent title="Remove">
                <a
                  className="position-absolute cursor-pointer icon-hover-bg right-0 abs-center-y"
                  onClick={controls.onRemove}
                >
                  <MaterialIcon icon="delete" />{' '}
                </a>
              </TooltipComponent>
            )}
          </>
        ) : (
          <label className="custom-control-label" htmlFor={id}>
            {label}
          </label>
        )}
      </div>
    </div>
  );
};

export const CheckboxInput = ({
  id,
  checked,
  onChange,
  onClick,
  fieldState,
  validationConfig,
  label,
  disabled,
  name,
}) => {
  return (
    <div className="custom-control custom-checkbox py-1">
      <input
        type="checkbox"
        className={`custom-control-input ${
          validationConfig?.required ? 'border-left-4 border-left-danger' : ''
        } ${
          fieldState?.invalid && !fieldState?.error?.ref?.value
            ? 'border-danger'
            : ''
        } `}
        id={id}
        checked={checked}
        onChange={onChange}
        name={name}
        disabled={disabled}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export const DropdownSearch = ({
  id,
  roleId,
  onChange,
  value,
  name,
  placeholder,
  results,
  error,
  selection,
  setSelection,
  title,
  children,
}) => {
  const handleCollapse = () => {
    const dropdownMenu = document.getElementById(id);
    dropdownMenu.classList.remove('show');
  };

  return (
    <Dropdown drop="down">
      <Dropdown.Toggle
        className="w-100 dropdown-search"
        variant="outline-link"
        id="dropdown"
      >
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu className="w-100" id={id}>
        <Col xs={12} className="px-3">
          {error.error && (
            <p className="alert-danger px-3 py-1 mb-1 rounded">{error.msg}</p>
          )}
          <Form.Control
            type="text"
            onChange={onChange}
            id={name}
            name={name}
            placeholder={placeholder}
            results={results}
            maxLength={100}
          />
          <List className="dropdown-results">
            {value.length > 1 && (
              <p className="alert-light mb-1 px-1 py-0 text-center rounded">
                {`Click in the user item to add`}
              </p>
            )}

            {results?.map((user, index) => {
              const userToAdd = {
                name: `${
                  user.first_name !== null ? user.first_name : NAME_INVITED_USER
                } ${user.last_name !== null ? user.last_name : ''}`,
                first_name: `${
                  user.first_name !== null ? user.first_name : NAME_INVITED_USER
                }`,
                last_name: `${
                  user.last_name !== null ? user.last_name : NAME_INVITED_USER
                }`,
                email: user.email,
                avatar: user.avatar,
                id: user.id,
                roleId: user.role,
                status: user.status,
              };

              const checkUserAdded = selection.some(
                (item) => item.id === user.id
              );

              return (
                <Item
                  id={`user-${index}`}
                  key={user.id}
                  onClick={() => {
                    if (!checkUserAdded) {
                      selection
                        ? setSelection((selection) => [...selection, userToAdd])
                        : setSelection(userToAdd);
                      handleCollapse();
                    }
                  }}
                >
                  <ItemAvatar>
                    <Avatar user={user} classModifiers="mr-2" />
                  </ItemAvatar>
                  <ItemUser
                    name={`${user.first_name || ''} ${user.last_name || ''}`}
                    email={user.email}
                  />
                  <ItemActions>
                    {checkUserAdded && (
                      <p className="alert-success mb-1 px-1 py-0 text-center rounded">
                        {`Added`}
                      </p>
                    )}
                    {userToAdd.roleId !== roleId && (
                      <p className="alert-warning my-0 px-1 py-0 text-center rounded">
                        {`Other role`}
                      </p>
                    )}
                  </ItemActions>
                </Item>
              );
            })}
          </List>
        </Col>
      </Dropdown.Menu>
    </Dropdown>
  );
};
