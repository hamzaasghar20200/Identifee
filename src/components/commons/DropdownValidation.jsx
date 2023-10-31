import { Form } from 'react-bootstrap';
import React from 'react';
import ValidationErrorText from './ValidationErrorText';

// generic component with validation logic with react-hook-form, will be using this or customize it more as we move forward
// right now, using it in add component form, ExploreQueryBuilder.jsx
const DropdownValidation = ({
  name,
  placeholder,
  value,
  options,
  register,
  validationConfig,
  errors,
  classNames,
  errorDisplay,
  emptyOption = 'Select',
  customKeys = ['name', 'title'],
  ...rest
}) => {
  return (
    <div className="position-relative w-100">
      <Form.Control
        as="select"
        placeholder={`${placeholder} ${validationConfig.inline ? '*' : ''}`}
        value={value}
        name={name}
        {...rest}
        className={`${classNames} ${errors[name] ? 'outline-danger' : ''}`}
        {...register(name, validationConfig)}
      >
        {emptyOption && <option value="">{emptyOption}</option>}
        {options?.map((option, index) => (
          <option key={index} value={option[customKeys[0]]}>
            {option[customKeys[1]]}
          </option>
        ))}
      </Form.Control>
      {errors[name]?.type === 'required' && (
        <ValidationErrorText
          text={errors[name]?.message || `${placeholder} is required.`}
          extraClass={errorDisplay}
        />
      )}
    </div>
  );
};

export default DropdownValidation;
