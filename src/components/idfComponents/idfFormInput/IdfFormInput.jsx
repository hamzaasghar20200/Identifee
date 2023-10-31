import { FormGroup, Input, Label } from 'reactstrap';
import { formatPhoneNumber } from '../../../utils/Utils';

const IdfFormInput = ({
  label,
  placeholder,
  name,
  value,
  onChange,
  type,
  className = '',
  max,
  icon,
  inputClassName = '',
  decimal,
  inputClass,
  ...restProps
}) => {
  const onHandleChange = (e) => {
    const { value, min, max } = e.target;
    const regex = /^[0-9]*(\.[0-9]{0,2})?$/;
    if (
      Number(value) <= Number(max) && Number(value) >= Number(min) && decimal
        ? regex.test(value)
        : true
    ) {
      onChange(e);
    }
  };
  return (
    <FormGroup className={`${className} position-relative`}>
      {label && <Label>{label}</Label>}
      {icon && (
        <div className="material-icons-outlined pos-icon-inside-imput">
          <span>{icon}</span>
        </div>
      )}
      <Input
        className={`${icon ? 'pl-5' : ''} ${inputClassName} ${inputClass}`}
        {...restProps}
        name={name}
        type={type}
        max={max}
        min={0}
        id={name}
        onChange={max ? onHandleChange : onChange}
        placeholder={placeholder}
        value={
          name?.includes('phone')
            ? formatPhoneNumber(value[name])
            : value[name] || ''
        }
      />
    </FormGroup>
  );
};

IdfFormInput.defaultProps = {
  type: 'text',
  placeholder: '',
  value: {},
};

export default IdfFormInput;
