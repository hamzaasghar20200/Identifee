import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import React from 'react';
import { Col, FormGroup, Label } from 'reactstrap';
import { DATE_FORMAT, DATE_FORMAT_EJS } from '../../../utils/Utils';

const IdfDatePicker = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  inputClass,
  format = DATE_FORMAT,
}) => {
  const onHandleChange = (e) => {
    if (e?.value) {
      onChange({
        target: {
          value: moment(e.value).format(format),
          name,
          id: name,
        },
      });
    }
  };

  return (
    <FormGroup row>
      <Label md={3} className="text-right mb-0 font-size-sm">
        {label}
      </Label>
      <Col md={9} className="pl-0">
        <DatePickerComponent
          id={name}
          name={name}
          format={DATE_FORMAT_EJS}
          className={`calendar-activity form-control idf-date ${inputClass}`}
          placeholder={placeholder}
          openOnFocus={true}
          value={value[name] || ''}
          onChange={onHandleChange}
        />
      </Col>
    </FormGroup>
  );
};

export default IdfDatePicker;
