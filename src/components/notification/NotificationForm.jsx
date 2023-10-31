import React, { useState, useEffect } from 'react';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import notificationService from '../../services/notification.service';
import IdfTooltip from '../idfComponents/idfTooltip';
import stringConstants from '../../utils/stringConstants.json';
import { Form, FormCheck } from 'react-bootstrap';
import MaterialIcon from '../commons/MaterialIcon';
import ButtonIcon from '../commons/ButtonIcon';
import { Card, CardBody, CardFooter, CardHeader } from 'reactstrap';
import IconTextLoader from '../loaders/IconText';
import Skeleton from 'react-loading-skeleton';

const NotificationsType = {
  AlertOnly: 'AlertOnly',
  AlertAndEmail: 'AlertAndEmail',
};

const constants = stringConstants.settings.notifications;

const NotificationsFormSkeleton = () => {
  return (
    <Card>
      <CardHeader className="justify-content-between">
        <Skeleton height="10" width={100} className="d-inline-block" />
        <Skeleton height="10" width={150} className="d-inline-block" />
      </CardHeader>
      <CardBody>
        <IconTextLoader count={4} />
      </CardBody>
      <CardFooter className="text-right">
        <Skeleton height="20" width={150} className="d-inline-block" />
      </CardFooter>
    </Card>
  );
};

const NotificationForm = ({ fromNavbar = false }) => {
  const [settings, setSettings] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationType, setNotificationType] = useState(
    NotificationsType.AlertAndEmail
  );
  const defaultSettings = {
    associations: false,
    dealsUpdates: false,
    separateActivities: false,
    mentionsAndComments: false,
  };
  const updateObjectValues = (obj, onOff) => {
    const keys = Object.keys(obj);
    for (const key of keys) {
      obj[key] = onOff;
    }
    return obj;
  };

  const checkIsAllSelected = (obj) => {
    return Object.values(obj).some((value) => value === true);
  };

  const getSettings = async () => {
    setPageLoading(true);
    try {
      const { settings } = await notificationService.getSettings();
      setNotificationType(
        checkIsAllSelected(settings)
          ? NotificationsType.AlertAndEmail
          : NotificationsType.AlertOnly
      );
      setSettings(settings || defaultSettings);
    } catch (error) {
      console.log(error);
      setSettings(defaultSettings);
      setNotificationType(
        checkIsAllSelected(defaultSettings)
          ? NotificationsType.AlertAndEmail
          : NotificationsType.AlertOnly
      );
    } finally {
      setPageLoading(false);
    }
  };

  const handleNotificationType = (e) => {
    const { value } = e.target;
    // set settings object values to true/false
    const updatedSettings = { ...settings };
    setNotificationType(value);
    setSettings(
      updateObjectValues(
        updatedSettings,
        value === NotificationsType.AlertAndEmail
      )
    );
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      await notificationService.addSettings(settings);
      setSuccessMessage(constants.successMessage);
    } catch (error) {
      setErrorMessage(constants.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  const LabelAndToolTip = ({ label, tooltip }) => {
    return (
      <div className="d-inline-flex align-items-center">
        <label
          className={`mr-1 font-size-sm font-weight-medium ${
            fromNavbar ? 'mb-1' : 'mb-0'
          }`}
        >
          {label}
        </label>
        <IdfTooltip placement="bottom" text={tooltip}>
          <MaterialIcon icon="info" />
        </IdfTooltip>
      </div>
    );
  };

  const NotificationRow = ({ children }) => {
    return (
      <div
        className={`d-flex my-2 mb-3 ${
          fromNavbar
            ? 'flex-column align-items-start'
            : 'align-items-center justify-content-between'
        }`}
      >
        {children}
      </div>
    );
  };

  const ToggleSwitch = ({ name, value, onChange }) => {
    return (
      <FormCheck
        type="switch"
        id={name}
        name={name}
        checked={value}
        custom={true}
        onChange={onChange}
      />
    );
  };

  const onToggleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: !settings[e.target.name],
    });
  };

  const SettingsToggles = [
    {
      name: 'dealsUpdates',
      value: settings.dealsUpdates,
      label: 'Deal updates',
      tooltip: 'Receive notification when deals are updated.',
      onChange: onToggleChange,
    },
    {
      name: 'separateActivities',
      value: settings.separateActivities,
      label: 'Activity reminders',
      tooltip: 'Receive notification when an activity needs to be completed.',
      onChange: onToggleChange,
    },
    {
      name: 'mentionsAndComments',
      value: settings.mentionsAndComments,
      label: 'Mentions in comments and notes',
      tooltip:
        'Receive notification when you’re mentioned in comments and notes sections.',
      onChange: onToggleChange,
    },
    {
      name: 'associations',
      value: settings.associations,
      label: 'Assigned to deal, people, and organization',
      tooltip:
        'Receive notification when you are assigned a deal, people, and organization.',
      onChange: onToggleChange,
    },
  ];
  return (
    <>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>

      {pageLoading ? (
        <NotificationsFormSkeleton />
      ) : (
        <Card id="password" className={`${fromNavbar ? 'border-0' : ''}`}>
          <CardHeader
            className={`${fromNavbar ? 'flex-column align-items-start' : ''}`}
          >
            <div className="mb-0">
              <LabelAndToolTip
                label="Notification type"
                tooltip="Choose how you want to receive notifications."
              />
            </div>
            <div>
              <Form.Control
                as="select"
                className="comfort"
                value={notificationType}
                onChange={handleNotificationType}
              >
                <option key={1} value={NotificationsType.AlertOnly}>
                  Show Alert
                </option>
                <option key={2} value={NotificationsType.AlertAndEmail}>
                  Alert and Email notification
                </option>
              </Form.Control>
            </div>
          </CardHeader>
          <CardBody>
            {SettingsToggles.map((setting) => (
              <NotificationRow key={setting.name}>
                <LabelAndToolTip
                  label={setting.label}
                  tooltip={setting.tooltip}
                />
                <ToggleSwitch
                  onChange={setting.onChange}
                  value={settings[setting.name]}
                  name={setting.name}
                />
              </NotificationRow>
            ))}
          </CardBody>
          <CardFooter>
            <div className="text-right">
              <ButtonIcon
                label={constants.saveButton}
                loading={loading}
                className="btn btn-sm btn-primary"
                data-dismiss="modal"
                onclick={onSubmit}
              />
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default NotificationForm;
