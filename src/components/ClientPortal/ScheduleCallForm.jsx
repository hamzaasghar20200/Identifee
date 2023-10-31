import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import Avatar from '../Avatar';
import { capitalize } from '../../utils/Utils';
import ButtonIcon from '../commons/ButtonIcon';
import activityService from '../../services/activity.service';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import MaterialIcon from '../commons/MaterialIcon';

const DAYS = [
  { id: 7, text: 'sunday', isSelected: false },
  { id: 1, text: 'monday', isSelected: false },
  { id: 2, text: 'tuesday', isSelected: false },
  { id: 3, text: 'wednesday', isSelected: false },
  { id: 4, text: 'thursday', isSelected: false },
  { id: 5, text: 'friday', isSelected: false },
  { id: 6, text: 'saturday', isSelected: false },
];
const TIME_PERIODS = [
  { id: 1, text: 'morning', isSelected: true },
  { id: 2, text: 'afternoon', isSelected: false },
  { id: 3, text: 'evening', isSelected: false },
];

const scheduleCallExtraOptions = [
  {
    id: 'schedule-option-1',
    icon: 'place',
    description: 'Details provided upon confirmation',
  },
  {
    id: 'schedule-option-2',
    icon: 'schedule',
    description: '30 minutes meeting',
  },
];

const ScheduleCallForm = ({
  data,
  setErrorMessage,
  setSuccessMessage,
  hideModal,
}) => {
  const [days, setDays] = useState(DAYS);
  const [timePeriods, setTimePeriods] = useState(TIME_PERIODS);
  const [requesting, setRequesting] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [scheduleCallOptions, setScheduleCallOptions] = useState(
    scheduleCallExtraOptions
  );
  const primaryOwnerContact = `${data?.first_name} ${data?.last_name}`;

  useEffect(() => {
    if (data?.phone) {
      const newScheduleOptions = [
        ...scheduleCallOptions,
        { id: 'schedule-option-3', icon: 'call', description: data?.phone },
      ];

      setScheduleCallOptions(newScheduleOptions);
    }
  }, [data]);

  const initForm = () => {
    setDays(
      [...days].map((d) => ({ ...d, isSelected: d.id === new Date().getDay() }))
    );
    setTimePeriods(TIME_PERIODS);
    setNotes('');
  };

  useEffect(() => {
    // get current day from date and select in UI
    setDays(
      [...days].map((d) => ({ ...d, isSelected: d.id === new Date().getDay() }))
    );
  }, []);

  const handleTimePeriodChange = (e, timePeriod) => {
    setTimePeriods(
      [...timePeriods].map((tp) => ({
        ...tp,
        isSelected: tp.id === timePeriod.id ? !tp.isSelected : tp.isSelected,
      }))
    );
  };

  const handleDayChange = (e, day) => {
    e.preventDefault();
    setDays(
      [...days].map((d) => ({
        ...d,
        isSelected: d.id === day.id ? !d.isSelected : d.isSelected,
      }))
    );
  };

  const handleRequestCall = async () => {
    setRequesting(true);
    try {
      const requestPayload = {
        availability: {
          days: days.filter((s) => s.isSelected).map((s) => s.text),
          timePeriods: timePeriods
            .filter((s) => s.isSelected)
            .map((tp) => tp.text),
        },
        notes,
      };
      await activityService.createActivityRequest(requestPayload);
      initForm();
      setShowDoneModal(true);
    } catch (e) {
      console.log(e);
      setErrorMessage(
        'Error creating a call request. Please check console for errors.'
      );
    } finally {
      setRequesting(false);
    }
  };

  const DoneBody = () => {
    return (
      <div>
        <div className="d-flex flex-column justify-content-center align-items-center">
          <MaterialIcon icon="check_circle" clazz="font-size-4em" />
          <h5 className="text-center font-weight-medium my-4">
            Your request has been submitted. The bank rep will contact you at
            the estimated date and time.
          </h5>
          <ButtonIcon
            label="Done"
            color="primary"
            classnames="btn-sm"
            onclick={() => {
              hideModal(); // hide parent modal
              setShowDoneModal(false);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <DeleteConfirmationModal
        showModal={showDoneModal}
        setShowModal={setShowDoneModal}
        setSelectedCategories={() => {}}
        event={() => setShowDoneModal(false)}
        itemsConfirmation={[]}
        itemsReport={[]}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        customBody={<DoneBody />}
        positiveBtnText=""
        showModalFooter={false}
      />
      <Row>
        <Col>
          <Row className="mb-3 px-3 pt-3 align-items-center">
            <Col xs="auto" className="m-auto">
              <Avatar user={data} classModifiers="avatar-xl" />
            </Col>
            <Col className="pl-0">
              <h4 className="font-weight-semi-bold mb-0">
                <p className="text-block mb-0">{primaryOwnerContact}</p>
              </h4>
              {data?.title && (
                <span className="text-muted font-size-sm2">{data?.title}</span>
              )}
            </Col>
          </Row>

          {scheduleCallExtraOptions?.map((option) => (
            <Row key={option.id} className="px-4 my-3 align-items-center">
              <Col>
                <div className="media align-items-center">
                  <i className="material-icons-outlined font-size-xxl mr-2">
                    {option.icon}
                  </i>
                  <div className="media-body">
                    <span className="d-block text-dark font-weight-medium">
                      {option.description}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          ))}
          <Row className="px-4 my-3 align-items-center">
            <Col>
              <div className="media align-items-center">
                <i className="material-icons-outlined font-size-xxl mr-2">
                  email
                </i>
                <div className="media-body">
                  <span className="d-block text-dark font-weight-medium">
                    {data.email}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col className="border-left overflow-x-hidden">
          <Row className="px-0 pt-4">
            <Col>
              <h4
                className="font-weight-semi-bold mb-0"
                data-uw-styling-context="true"
              >
                Select a date &amp; time
              </h4>
              <p className="text-muted font-size-sm2 mb-2">
                Please choose the available days
              </p>
            </Col>
          </Row>
          <div className="d-flex align-items-center gap-2">
            {days.map((day) => (
              <a
                key={day.id}
                style={{ lineHeight: 'initial', width: 32, height: 32 }}
                onClick={(e) => handleDayChange(e, day)}
                className={`d-flex justify-content-center font-weight-medium btn cursor-pointer btn-outline-primary align-items-center rounded-circle ${
                  day.isSelected ? 'bg-primary text-white' : ''
                }`}
              >
                {day.text.charAt(0).toUpperCase()}
              </a>
            ))}
          </div>
          <Row className="px-0 pt-3">
            <Col>
              <p className="text-muted font-size-sm2 mb-1">
                Please choose time of day available
              </p>
            </Col>
          </Row>
          <div className="d-flex align-items-center gap-2 pr-3">
            {timePeriods.map((tp) => (
              <Form.Check
                key={tp.id}
                inline
                label={`${capitalize(tp.text)}s`}
                name={tp.text}
                className="fs-7 mr-2"
                type="checkbox"
                checked={tp.isSelected}
                onChange={(e) => handleTimePeriodChange(e, tp)}
              />
            ))}
          </div>
          <div className="py-3 pr-3">
            <Form.Control
              as="textarea"
              className="min-h-120"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Question or Feedback"
            />
            <ButtonIcon
              icon="call"
              color="primary"
              classnames="btn-sm mt-2 w-100"
              label="Request a Call"
              loading={requesting}
              onclick={handleRequestCall}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ScheduleCallForm;
