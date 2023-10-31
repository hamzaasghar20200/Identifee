import { Col, FormControl } from 'react-bootstrap';
import React from 'react';
import ValidationErrorText from './ValidationErrorText';
import { FormGroup, Label } from 'reactstrap';

// generic component with validation logic with react-hook-form, will be using this or customize it more as we move forward
// right now, using it in create category modal
const InputValidationAdvance = ({
  name,
  type,
  placeholder,
  value,
  register,
  validationConfig,
  errors,
  classNames,
  inputClass,
  fieldType,
  label,
  errorDisplay,
  errorMessage = '',
  ...rest
}) => {
  return (
    <div className="position-relative w-100">
      <FormGroup row className="py-1">
        <Label md={3} className="text-right mb-0 font-size-sm">
          {label}
        </Label>
        <Col md={9} className="pl-0">
          <FormControl
            as={type}
            type={fieldType}
            placeholder={`${placeholder} ${
              validationConfig?.inline ? '*' : ''
            }`}
            value={value[name]}
            name={name}
            {...rest}
            className={`${classNames} ${inputClass} ${
              errors[name] ? 'border-danger' : ''
            }`}
            {...register(name, validationConfig)}
          />
          {errors[name]?.type === 'required' && (
            <ValidationErrorText
              text={errors[name]?.message || `${placeholder} is required.`}
              extraClass={errorDisplay}
            />
          )}
          {errors[name]?.type === 'maxLength' && (
            <ValidationErrorText
              text={errors[name]?.message}
              extraClass={errorDisplay}
            />
          )}
          {errors[name]?.type === 'pattern' && (
            <ValidationErrorText
              text={errors[name]?.message || errorMessage}
              extraClass={errorDisplay}
            />
          )}
        </Col>
      </FormGroup>
    </div>
  );
};

export default InputValidationAdvance;
