import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';

import './DatePickerInput.css';
import { CardLabel } from '../../layouts/ActivityLayout';
const DateRangeInput = ({
  label,
  labelSize,
  steps,
  id,
  startTime,
  timePickerChange,
  endTimePicker,
  endTime,
}) => {
  return (
    <CardLabel label={label} labelSize={labelSize}>
      <div
        className={`input-time position-relative align-items-center ml-1 mt-1`}
      >
        <TimePickerComponent
          id={`start-time-${id}`}
          cssClass="e-custom-style"
          openOnFocus={true}
          value={startTime}
          format="hh:mm a"
          placeholder="Start Time"
          onChange={(e) => timePickerChange(e, true)}
          step={steps}
        />
        <p className="mb-0">To</p>
        <TimePickerComponent
          id={`end-time-${id}`}
          cssClass="e-custom-style"
          openOnFocus={true}
          value={endTime}
          format="hh:mm a"
          placeholder="End Time"
          onChange={(e) => endTimePicker(e, true)}
          step={steps}
        />
      </div>
    </CardLabel>
  );
};

export default DateRangeInput;
