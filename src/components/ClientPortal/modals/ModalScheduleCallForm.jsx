import React, { Fragment, useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ButtonIcon from '../../commons/ButtonIcon';
import { Form } from 'react-bootstrap';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import MaterialIcon from '../../commons/MaterialIcon';
import activityService from '../../../services/activity.service';
import Avatar from '../../Avatar';

const DAYS = [
  { id: 7, text: 'sunday', isSelected: false },
  { id: 1, text: 'monday', isSelected: false },
  { id: 2, text: 'tuesday', isSelected: false },
  { id: 3, text: 'wednesday', isSelected: false },
  { id: 4, text: 'thursday', isSelected: false },
  { id: 5, text: 'friday', isSelected: false },
  { id: 6, text: 'saturday', isSelected: false },
];
const timePeriods = [
  { id: 1, text: 'morning', isSelected: true },
  { id: 2, text: 'afternoon', isSelected: false },
  { id: 3, text: 'evening', isSelected: false },
];

const scheduleCallExtraOptions = [
  {
    id: 'schedule-option-1',
    icon: 'location_on',
    description: 'Details provided upon confirmation',
  },
];

const ModalScheduleCallForm = (props) => {
  const [days, setDays] = useState(DAYS);
  const [value, setValue] = useState(['morning']);
  const [notes, setNotes] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [scheduleCallOptions, setScheduleCallOptions] = useState(
    scheduleCallExtraOptions
  );

  useEffect(() => {
    if (!props.data?.phone) {
      const newScheduleOptions = [
        ...scheduleCallOptions,
        {
          id: 'schedule-option-3',
          icon: 'call',
          description: props.data?.phone,
        },
      ];

      setScheduleCallOptions(newScheduleOptions);
    }
  }, [props.data]);

  const initForm = () => {
    setDays(
      [...days].map((d) => ({ ...d, isSelected: d.id === new Date().getDay() }))
    );
    setValue(value);
    setNotes('');
  };

  useEffect(() => {
    // get current day from date and select in UI
    setDays(
      [...days].map((d) => ({ ...d, isSelected: d.id === new Date().getDay() }))
    );
  }, []);

  const handleDayChange = (e, day) => {
    e.preventDefault();
    setDays(
      [...days].map((d) => ({
        ...d,
        isSelected: d.id === day.id ? !d.isSelected : d.isSelected,
      }))
    );
  };

  const handleTimePeriodChange = (val) => {
    setValue(val);
  };

  const handleRequestCall = async () => {
    setRequesting(true);
    try {
      const requestPayload = {
        availability: {
          days: days.filter((s) => s.isSelected).map((s) => s.text),
          timePeriods: value,
        },
        notes,
      };
      await activityService.createActivityRequest(requestPayload);
      initForm();
      props.onModalSuccessMsg();
    } catch (e) {
      console.log(e);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Fragment>
      <Modal
        {...props}
        size="lg"
        backdrop="static"
        keyboard={false}
        aria-labelledby="request_call"
        centered
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton className="p-3">
          <Modal.Title id="request_call">Request a Call</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="modal-request-call">
            <div className="row gy-2">
              <div className="col-xxl-5 col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                <div className="rep-info d-flex flex-column justify-content-center align-items-center gap-3 h-100">
                  <Avatar user={props.data} />
                  <div className="text-center mb-3">
                    {props.data?.name && (
                      <h2 className="mb-0">{props.data?.name}</h2>
                    )}
                    {props.data?.title && (
                      <p className="text-muted mb-0">{props.data?.title}</p>
                    )}
                  </div>
                  {scheduleCallExtraOptions?.map((option) => (
                    <p
                      key={option.id}
                      className="d-flex justify-content-center gap-2 text-muted mb-0"
                    >
                      <MaterialIcon
                        clazz={'text-blue'}
                        icon={option.icon}
                        filled
                      />
                      {option.description}
                    </p>
                  ))}
                  {props.data?.email && (
                    <p className="d-flex justify-content-center gap-2 mb-0">
                      <MaterialIcon clazz={'text-blue'} icon="mail" filled />
                      {props.data?.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-xxl-7 col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                <h4
                  className="font-weight-semi-bold mb-0"
                  data-uw-styling-context="true"
                >
                  Select a date &amp; time
                </h4>
                <p className="text-muted font-size-sm2 mb-3">
                  Please choose the available days
                </p>
                <div className="d-flex align-items-center gap-2 mb-4">
                  {days.map((day) => (
                    <a
                      key={day.id}
                      style={{ lineHeight: 'initial', width: 55, height: 42 }}
                      onClick={(e) => handleDayChange(e, day)}
                      className={`d-flex justify-content-center font-weight-medium btn cursor-pointer btn-light text-black align-items-center ${
                        day.isSelected ? 'btn-light-blue text-blue' : ''
                      }`}
                    >
                      {day.text.charAt(0).toUpperCase()}
                    </a>
                  ))}
                </div>
                <p className="text-muted font-size-sm2 mb-2">
                  Please choose time of day available
                </p>
                <ToggleButtonGroup
                  type="checkbox"
                  value={value}
                  onChange={handleTimePeriodChange}
                  className="light p-0 d-flex mb-3"
                >
                  {timePeriods.map((tp) => (
                    <ToggleButton
                      variant={'light'}
                      className="col avl-slots"
                      key={tp.id}
                      value={tp.text}
                    >
                      {tp.text.toUpperCase()}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Form.Control
                  as="textarea"
                  className="min-h-120 comment-area mb-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Question or Feedback"
                />
                <ButtonIcon
                  icon="call"
                  color="primary"
                  classnames="btn-lg mt-2 w-100"
                  label="Request a Call"
                  loading={requesting}
                  onClick={handleRequestCall}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};

export default ModalScheduleCallForm;
