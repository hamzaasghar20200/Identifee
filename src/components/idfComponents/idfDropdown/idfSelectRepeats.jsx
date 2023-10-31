// import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment-timezone';
import React, { useEffect, useState } from 'react';
import { Col, Label, Row } from 'reactstrap';
import {
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  DATE_FORMAT_REPEAT,
} from '../../../utils/Utils';
import ReactDatepicker from '../../inputs/ReactDatpicker';
import { CheckboxInput } from '../../layouts/CardLayout';
import '../../peopleProfile/contentFeed/AddActivity.css';
const currentDate = new Date();
const SelectRepeats = ({
  label,
  startDate = { currentDate },
  activityForm,
  setActivityForm,
  ...props
}) => {
  const tomorrowDate = new Date(startDate)?.setDate(
    new Date(startDate)?.getDate() + 1
  );
  const [isRepeatWeek, setRepeatWeek] = useState('Every Day');
  const [IsRepeatDate, setIsRepeatedDate] = useState(tomorrowDate);
  const [errorMessage, setErrorMessage] = useState('');
  const defaultSelectData = () => {
    if (startDate) {
      const tomorrowDate = new Date(startDate)?.setDate(
        new Date(startDate)?.getDate() + 1
      );
      const nextSevenDays = new Date(startDate)?.setDate(
        new Date(startDate)?.getDate() + 7
      );
      const nextMonth = new Date(startDate)?.setDate(
        new Date(startDate)?.getDate() + 30
      );
      const nextYear = new Date(startDate)?.setDate(
        new Date(startDate)?.getDate() + 360
      );
      IsRepeatDate
        ? validationCheck(
            isRepeatWeek === 'Every Day'
              ? tomorrowDate
              : isRepeatWeek === 'Every Week'
              ? nextSevenDays
              : isRepeatWeek === 'Every Month'
              ? nextMonth
              : nextYear
          )
        : validationCheck(
            isRepeatWeek === 'Every Day'
              ? ''
              : isRepeatWeek === 'Every Week'
              ? ''
              : isRepeatWeek === 'Every Month'
              ? ''
              : ''
          );
    }
  };
  useEffect(() => {
    defaultSelectData();
  }, [startDate, isRepeatWeek]);
  const [isRepeatCheck, setRepeatCheck] = useState(false);
  const repeatWeeks = [
    {
      name: 'Every Day',
    },
    {
      name: 'Every Week',
    },
    {
      name: 'Every Month',
    },
    {
      name: 'Every Year',
    },
  ];

  const handleChange = (value) => {
    if (value) {
      setIsRepeatedDate(value);
      validationCheck(value);
    }
  };
  const validationCheck = (repeatDate) => {
    const dueDate = moment(startDate).format(DATE_FORMAT_REPEAT);
    // const formatedValue = moment(startDate).format(DATE_FORMAT_REPEAT);
    const date1 = new Date(startDate);
    date1.setHours(0, 0, 0, 0);
    const date2 = new Date(repeatDate);
    // To calculate the time difference of two dates
    const Difference_In_Time = date2 - date1;

    // To calculate the no. of days between two dates
    const Difference_In_Days = Math.floor(
      Difference_In_Time / (1000 * 3600 * 24)
    );
    // To display the final no. of days (result)
    if (repeatDate) {
      if (isRepeatWeek === 'Every Week' && Difference_In_Days < 7) {
        const repeatData = {
          ...activityForm,
          repeat: '',
        };
        setActivityForm(repeatData);
        return setErrorMessage(
          "'Until' date should be greater than 1 week from 'Due Date'"
        );
      } else if (isRepeatWeek === 'Every Day' && Difference_In_Days < 1) {
        const repeatData = {
          ...activityForm,
          repeat: '',
        };
        setActivityForm(repeatData);
        return setErrorMessage(
          "'Until' date should be greater than 'Due Date'"
        );
      } else if (isRepeatWeek === 'Every Month' && Difference_In_Days < 30) {
        const repeatData = {
          ...activityForm,
          repeat: '',
        };
        setActivityForm(repeatData);
        return setErrorMessage(
          "'Until' date should be greater than 1 month from 'Due Date'"
        );
      } else if (isRepeatWeek === 'Every Year' && Difference_In_Days < 365) {
        const repeatData = {
          ...activityForm,
          repeat: '',
        };
        setActivityForm(repeatData);
        return setErrorMessage(
          "'Until' date should be greater than 1 year from 'Due Date'"
        );
      } else if (isRepeatWeek === '') {
        return setErrorMessage('Please select duration');
      } else if (
        (isRepeatWeek === 'Every Week' && Difference_In_Days >= 7) ||
        (isRepeatWeek === 'Every Day' && Difference_In_Days >= 1) ||
        (isRepeatWeek === 'Every Month' && Difference_In_Days >= 30) ||
        (isRepeatWeek === 'Every Year' && Difference_In_Days >= 365)
      ) {
        setErrorMessage('');
        const repeatWeek =
          (isRepeatWeek === 'Every Day' && 'DAILY') ||
          (isRepeatWeek === 'Every Week' && 'WEEKLY') ||
          (isRepeatWeek === 'Every Month' && 'MONTHLY') ||
          (isRepeatWeek === 'Every Year' && 'YEARLY');
        const repeatData = {
          ...activityForm,
          repeat: `FREQ=${repeatWeek};UNTIL=${moment(repeatDate).format(
            DATE_FORMAT_REPEAT
          )};DTSTART=${dueDate}`,
        };
        setActivityForm(repeatData);
      } else {
        const repeatData = {
          ...activityForm,
          repeat: `FREQ=${isRepeatWeek};UNTIL=${moment(repeatDate).format(
            DATE_FORMAT_REPEAT
          )};DTSTART=${dueDate}`,
        };
        setActivityForm(repeatData);
      }
    } else {
      if (!isRepeatWeek) {
        setErrorMessage('');
      } else {
        setErrorMessage('Please select until date');
      }
    }
  };
  useEffect(() => {
    if (IsRepeatDate) {
      validationCheck(IsRepeatDate);
    }
  }, [isRepeatWeek, startDate, IsRepeatDate]);
  return (
    <>
      <CheckboxInput
        id={label}
        label={label}
        name="repeat"
        onChange={(e) => {
          setRepeatWeek('Every Day');
          setIsRepeatedDate('');
          setRepeatCheck(e.target.checked);
          props.setRepeatChecked && props.setRepeatChecked(e.target.checked);
        }}
      />
      {isRepeatCheck ? (
        <>
          <Row className="align-items-center flex-wrap w-100">
            <Col lg={5} className="pr-0">
              <select
                className={
                  errorMessage !== ''
                    ? 'border-danger border rounded form-control'
                    : 'form-control'
                }
                name="repeatWeekly"
                onChange={(e) => setRepeatWeek(e.target.value)}
              >
                {repeatWeeks?.map((item, i) => (
                  <option value={item?.name} key={i}>
                    {item?.name}
                  </option>
                ))}
              </select>
            </Col>
            <Col lg={2}>
              <Label className="mb-0">Until</Label>
            </Col>
            <Col lg={5} className="pl-0">
              <div
                className={
                  errorMessage !== ''
                    ? 'border-danger rounded border input-time w-100 date-picker'
                    : `input-time w-100 date-picker`
                }
              >
                <ReactDatepicker
                  id="end_date"
                  name="end_date"
                  format={DATE_FORMAT_EJS}
                  todayButton="Today"
                  autoComplete="off"
                  value={IsRepeatDate || tomorrowDate}
                  className="form-control mx-0 mb-0 z-index-12"
                  placeholder={DATE_FORMAT_EJS_UPDATED}
                  onChange={(date) => handleChange(date)}
                />
              </div>
            </Col>
            {errorMessage !== '' ? (
              <Col lg={12}>
                <h6 className="text-danger mt-2 text-sm">{errorMessage}</h6>
              </Col>
            ) : (
              ''
            )}
          </Row>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default SelectRepeats;
