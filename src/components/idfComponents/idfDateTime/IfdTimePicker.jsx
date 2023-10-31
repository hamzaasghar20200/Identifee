import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment';
import React from 'react';
import { Col, FormGroup, Label } from 'reactstrap';

const IdfTimePicker = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  format = 'hh:mm:ss A',
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
        <div className="date-picker input-time w-100">
          <TimePickerComponent
            id={name}
            name={name}
            format={'hh:mm:ss a'}
            cssClass={`e-custom-style`}
            placeholder={placeholder}
            openOnFocus={true}
            value={value[name] || ''}
            onChange={onHandleChange}
          />
        </div>
      </Col>
    </FormGroup>
  );
};

export default IdfTimePicker;
