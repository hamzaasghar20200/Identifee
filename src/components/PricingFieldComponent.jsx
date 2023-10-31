import React from 'react';
import { Col, InputGroup } from 'react-bootstrap';
import { Input, Label, FormGroup } from 'reactstrap';

import MaterialIcon from './commons/MaterialIcon';

export const PricingField = ({
  name,
  id,
  disabled,
  onChange,
  placeholder,
  inputClass,
  validationConfig,
  fieldState,
  label,
  value,
}) => {
  return (
    <>
      <FormGroup row className="py-1">
        <Label md={3} className="text-right mb-0 font-size-sm">
          {label}
        </Label>
        <Col md={9} className="pl-0">
          <InputGroup
            className={`${inputClass} ${
              validationConfig?.required
                ? 'border-left-4 border-left-danger rounded'
                : ''
            } ${
              fieldState?.invalid && !fieldState?.error?.ref?.value
                ? 'border-danger'
                : ''
            }`}
          >
            <InputGroup.Prepend>
              <InputGroup.Text as={'label'}>
                <MaterialIcon icon="attach_money" clazz="fs-6" />
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Input
              type="number"
              name={name}
              id={id}
              disabled={disabled}
              onChange={onChange}
              placeholder={placeholder}
              value={value[name]}
            />
          </InputGroup>
        </Col>
      </FormGroup>
    </>
  );
};
