import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// will use this component and customize it more as we are integrating throughout app
const ReactDatepicker = ({
  onChange,
  id,
  value,
  name,
  placeholder,
  className,
  minDate,
  autoComplete,
  validationConfig,
  fieldState,
  format,
  ...rest
}) => {
  return (
    <DatePicker
      id={id}
      name={name}
      dateFormat={format}
      minDate={minDate}
      todayButton="Today"
      autoComplete={autoComplete}
      selected={value}
      popperClassName="idf-date"
      className={`${className} ${
        validationConfig?.required
          ? 'border-left-4 border-left-danger rounded'
          : ''
      } ${
        fieldState?.invalid && !fieldState?.error?.ref?.value
          ? 'border-danger'
          : ''
      }`}
      placeholderText={placeholder}
      onChange={onChange}
      {...rest}
    />
  );
};

export default ReactDatepicker;
