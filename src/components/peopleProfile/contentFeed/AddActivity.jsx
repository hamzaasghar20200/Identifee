import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './AddActivity.css';
import stringConstants from '../../../utils/stringConstants.json';
import {
  DATE_FORMAT,
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  // TAB_KEYS,
  formatHHMM,
  overflowing,
  DATE_FORMAT_DASHED_TZ,
} from '../../../utils/Utils';
import userService from '../../../services/user.service';
import AddActivityOptions from './AddActivityOptions';
import { ModalFooter, Form } from 'react-bootstrap';
import routes from '../../../utils/routes.json';
import ButtonIcon from '../../commons/ButtonIcon';
import { renderComponent } from '../../peoples/constantsPeople';
import IdfSelectMultiOpp from '../../idfComponents/idfDropdown/IdfSelectMultiOpp';
import SelectRepeats from '../../idfComponents/idfDropdown/idfSelectRepeats';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import moment from 'moment-timezone';
import DateRangeInput from '../../inputs/DateRange/DatePickerInput';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../commons/ControllerValidation';
import { CardBody, Col, FormGroup, Label } from 'reactstrap';
import { CheckboxInput } from '../../layouts/CardLayout';
import ReactDatepicker from '../../inputs/ReactDatpicker';
import activityService from '../../../services/activity.service';
import { useProfileContext } from '../../../contexts/profileContext';
import AutoComplete from '../../AutoComplete';
import {
  emailRegex,
  phoneRegex,
  urlRegex,
  anyRegex,
  timeRegex,
} from '../../../utils/constants';
import DropdownSelect from '../../DropdownSelect';
import AddPicklistOptions from './AddPicklistOptions';
const AddActivity = ({
  moduleMap,
  call,
  event,
  task,
  componentId,
  contactId,
  dataType,
  dealId,
  deal,
  organization,
  getActivityId,
  successMessage,
  setSuccessMessage,
  setActivatedTab,
  errorMessage,
  profileRefresh,
  setErrorMessage,
  setGetActivityId,
  organizationId,
  feedId,
  owner,
  getProfileInfo,
  isModal,
  refreshFeed,
  closeModal,
  allFields = [],
  activityData = {},
  setActiveTab,
  contactInfo,
  fromNavbar,
  setIsTabType,
  setOpenActivity,
  activeTab,
  btnType,
  getData,
  feedInfo,
  searchValue,
  ...props
}) => {
  const currentDate = new Date();
  let end_time = new Date();
  end_time = moment(end_time.setHours(currentDate.getHours() + 1)).format(
    formatHHMM
  );
  const start_time = moment(currentDate).format(formatHHMM);
  const currentDateSet = moment(new Date()).format(DATE_FORMAT);
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const activityObj = {
    free_busy: 'abc',
    notes: '',
    lead: '',
    name: '',
    type: btnType,
    guests: '',
    start_date: `${currentDateSet} ${start_time}`,
    location: '',
    conference_link: '',
    description: '',
  };
  const [activityForm, setActivityForm] = useState(activityObj);
  const [startTime, setStartTime] = useState(
    activityForm?.start_time || start_time
  );
  const [endTime, setEndTime] = useState(activityForm?.end_time || end_time);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: activityForm,
  });
  const { profileInfo } = useProfileContext();
  const history = useHistory();
  const [tagifyValue, setTagifyValue] = useState([]);
  const [tagifyDropdownlist, setTagifyDropdownlist] = useState([]);
  const [anotherGuests, setAnotherGuests] = useState([]);
  const [users, setUsers] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState({
    search: '',
  });
  const [ownerCharactersRequire, setOwnerCharactersRequire] = useState('');
  const [ownerError, setOwnerError] = useState(false);
  const [charactersRequire, setCharactersRequire] = useState('');
  const constants = stringConstants.deals.contacts.profile;
  const [loading, setLoading] = useState(false);
  const [errorTextMessage, setErrorTextMessage] = useState('');
  const [nameSet, setMultipleName] = useState('organization_id');
  const [ownerData, setOwnerData] = useState([]);
  const [repeatChecked, setRepeatChecked] = useState(false);
  const [customFieldData, setCustomFieldData] = useState([]);
  const regex =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  useEffect(() => {
    if (Object.keys(activityData).length !== 0) {
      setActivityForm(activityData);
      setDataEdit();
    }
  }, [activityData]);
  const picklistDefault = [];
  const initialLoad = {};

  const handleCloseModal = () => {
    closeModal();
    const resetObject = {
      type: btnType,
      guests: '',
      start_date: new Date(),
      end_date: new Date(),
      location: '',
      conference_link: '',
      description: '',
      contact_id: '',
      deal_id: '',
      organization_id: '',
      free_busy: 'abc',
      notes: '',
      lead: '',
      name: '',
      start_time: '',
      end_time: '',
    };
    reset(resetObject);
    setActivityForm(resetObject);
    setStartDate(currentDate);
    setEndDate(currentDate);
  };
  const searchGuest = async (search) => {
    const match = search.match(/([A-Za-z])/g);
    if (match && match?.length >= 2) {
      setAnotherGuests(
        search.length ? search.split(' ').join('').split(',') : []
      );

      const allGuest = await userService.getMatchingGuests(search);

      const list = allGuest.data?.map((user) => {
        const name = `${user.first_name} ${user.last_name}`;
        const userItem = {
          value: name,
          name,
          email: user.email || user.email_work || user.email_home,
          avatar: user.avatar,
          id: user.id,
        };
        return userItem;
      });
      setCharactersRequire('');
      setTagifyDropdownlist(list);
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  const relatedToData = async () => {
    let activityIdsGet;
    if (dataType === 'deal') {
      activityIdsGet = {
        ...activityForm,
        deal_id: deal?.id,
      };
      setActivityForm(activityIdsGet);
      setValue('deal_id', deal?.id);
    } else if (dataType === 'contact') {
      activityIdsGet = {
        ...activityForm,
        contact_id: contactInfo?.id,
        free_busy: 'none',
      };
      setActivityForm(activityIdsGet);
      setValue('contact_id', contactInfo?.id);
    } else if (dataType === 'organization') {
      const activityIdsGet = {
        ...activityForm,
        organization_id: organizationId,
        free_busy: 'none',
      };
      setActivityForm(activityIdsGet);
      setValue('organization_id', organizationId);
    } else {
      setValue(`${dataType}_id`, '');
    }
  };
  useEffect(() => {
    if (tagifyValue?.length > 0) {
      const activityGueste = {
        ...activityForm,
        guests: tagifyValue,
      };
      setActivityForm(activityGueste);
      setValue('guests', tagifyValue);
    }
  }, [tagifyValue]);
  const getRedirect = () => {
    if (activityForm?.organization_id) {
      history.push(
        `${routes.companies}/${activityForm?.organization_id}/organization/profile`
      );
    } else if (activityForm?.contact_id) {
      history.push(`${routes.contacts}/${activityForm?.contact_id}/profile`);
    } else if (activityForm?.deal_id) {
      history.push(`${routes.dealsPipeline}/${activityForm?.deal_id}`);
    }
  };
  useEffect(() => {
    if (tagifyValue?.length > 0) {
      const guests = tagifyValue?.map((user) => user.id);
      if (guests?.length > 0) {
        const activityData = {
          ...activityForm,
          guests: guests.join(',') || '',
        };
        setActivityForm(activityData);
        setValue('guests', guests.join(',') || '');
      }
    }
  }, [tagifyValue]);
  const removeCustomFieldsFromActivityForm = () => {
    const tempActivityForm = { ...activityForm };

    customFieldData.forEach((customField) => {
      const keyToRemove = customField.key;
      for (const key in tempActivityForm) {
        if (
          Object.prototype.hasOwnProperty.call(tempActivityForm, key) &&
          key === keyToRemove
        ) {
          delete tempActivityForm[key];
        }
      }
    });
    setActivityForm(tempActivityForm);
    return tempActivityForm;
  };
  const saveAndSend = async () => {
    if (ownerData.length < 1) {
      setOwnerError(true);
      return;
    }
    if (repeatChecked && btnType === 'task') {
      if (!activityForm?.repeat) {
        return;
      }
    }
    try {
      const list = [];
      const owners = [];
      anotherGuests.forEach((guest, i) => {
        list.push({
          id: guest,
          value: guest,
          email: guest,
          alert: !regex.test(guest),
        });
        if (i === anotherGuests.length - 1) {
          setTagifyValue([...tagifyValue, ...list]);
          setAnotherGuests([]);
        }
      });
      ownerData.forEach((item) => {
        owners.push({
          userId: item?.id,
        });
      });
      if (anotherGuests.find((item) => !regex.test(item))) {
        return setErrorMessage(constants.emailsAllowed);
      }
      if (activityForm?.name) {
        if (btnType === 'event' && !validationCheck(activityForm?.end_date)) {
          return setErrorMessage('Check Event Date');
        }
        setLoading(true);
        const updatedActivityForm = removeCustomFieldsFromActivityForm();
        const data = await activityService.addActivity(updatedActivityForm);
        const promises = data.map(async (item) => {
          await activityService.addOwnerActivity(item?.id, owners);
          if (customFieldData) {
            const customFieldPromises = customFieldData
              .filter((field) => field.value !== '')
              .map((field) =>
                activityService.saveCustomField(item.id, {
                  field_id: field.field_id,
                  value: field.value,
                })
              );
            await Promise.all(customFieldPromises);
          }
        });

        await Promise.all(promises);
        setStartDate(new Date());
        setEndDate(new Date());
        reset(
          setActivityForm({
            type: btnType,
            guests: '',
            contact_id: '',
            deal_id: '',
            organization_id: '',
            start_date: '',
            location: '',
            conference_link: '',
            description: '',
            free_busy: 'abc',
            notes: '',
            lead: '',
            name: '',
          })
        );
        handleCloseModal();
        if (fromNavbar) {
          setTimeout(() => {
            handleCloseModal();
            getRedirect();
          }, 2000);
        }
        if (activeTab) {
          getData(btnType);
          if (btnType === 'task') {
            setActiveTab(2);
            setIsTabType('task');
          } else if (btnType === 'call') {
            setActiveTab(3);
            setIsTabType('call');
          } else if (btnType === 'event') {
            setActiveTab(4);
            setIsTabType('event');
          }
        }
        setSuccessMessage(constants.activityAdded);
        if (profileRefresh) profileRefresh(constants.activityAdded);
      }
    } catch (error) {
      setLoading(false);
      if (profileRefresh) profileRefresh(constants.activityError);
      setErrorMessage(constants.activityError);
    }
  };
  const updateAndSend = async () => {
    if (ownerData.length < 1) {
      setOwnerError(true);
      return;
    }
    let data;
    if (btnType === 'event' && !validationCheck(activityForm?.end_date)) {
      return setErrorMessage('Check Event Date');
    }
    if (activityForm?.organization_id === null) {
      delete activityForm?.organization;
      delete activityForm?.organization_id;
    }
    if (activityForm?.contact_id === null) {
      delete activityForm?.contact_id;
      delete activityForm?.contact;
    }
    if (activityForm?.deal_id === null) {
      delete activityForm?.deal_id;
      delete activityForm?.deal;
    }
    delete activityForm?.created_at;
    delete activityForm?.updated_at;
    delete activityForm?.feed_id;
    delete activityForm?.tenant_id;
    delete activityForm?.id;
    delete activityForm?.start_time;
    delete activityForm?.end_time;
    if (btnType === 'event' || btnType === 'call') {
      delete activityForm?.done;
      delete activityForm?.priority;
    } else {
      delete activityData?.guests;
    }
    if (btnType === 'call') {
      delete activityForm?.online_meet;
    }
    if (btnType === 'event') {
      data = {
        ...activityForm,
        end_date: new Date(activityForm?.end_date),
        start_date: new Date(activityForm?.start_date),
      };
      setActivityForm(data);
    }
    const owners = [];
    ownerData.forEach((item) => {
      owners.push({
        userId: item?.id,
      });
    });
    try {
      setLoading(true);
      const updatedActivityForm = removeCustomFieldsFromActivityForm();
      await activityService.updateActivity(
        activityData.id || getActivityId.id,
        data || updatedActivityForm
      );
      if (activityData.id) {
        await activityService.addOwnerActivity(activityData.id, owners);
        if (customFieldData) {
          const promises = customFieldData.map(async (field) => {
            if (field.value === '') {
              await activityService.deleteCustomField(
                activityData.id,
                field.field_id
              );
            } else {
              await activityService.saveCustomField(activityData.id, {
                field_id: field.field_id,
                value: field.value,
              });
            }
          });

          await Promise.all(promises);
        }
      }
      setStartDate(new Date());
      setEndDate(new Date());
      overflowing();
      if (refreshFeed) {
        refreshFeed();
      }
      reset(
        setActivityForm({
          type: btnType,
          guests: '',
          start_date: '',
          contact_id: '',
          deal_id: '',
          organization_id: '',
          location: '',
          conference_link: '',
          description: '',
          free_busy: 'abc',
          notes: '',
          lead: '',
          name: '',
        })
      );
      if (activeTab) {
        setGetActivityId();
        getData(btnType);
      }
      setOwnerData([]);
      closeModal();
      setSuccessMessage(constants.activityUpdated);
      if (profileRefresh) profileRefresh(constants.activityAdded);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error?.response?.status === 401) {
        setErrorMessage(constants.unathorizedError);
        return setTimeout(() => closeModal(false), 2000);
      }
      setErrorMessage(constants.activityError);
    }
  };
  const getUserByIds = async (guests = '') => {
    if (guests === '') {
      return;
    }

    const guestIds = guests.split(',');
    const result = [];
    const guestUuid = guestIds.filter((guestId) => {
      if (regex.test(guestId)) {
        result.push({
          value: guestId,
          name: guestId,
          email: guestId,
          avatar: '',
          id: guestId,
        });
      }

      return !regex.test(guestId);
    });

    if (guestUuid.length === 0) {
      return [...result];
    }

    const { data: response } = await userService.getGuestsByIds(
      guestUuid.toString()
    );

    const otherData = [...response.users, ...response.contacts]?.map((user) => {
      const name = `${user.first_name} ${user.last_name}`;
      const userItem = {
        value: name,
        name,
        email: user.email || user.email_work || user.email_home,
        avatar: user.avatar,
        id: user.id,
      };

      return userItem;
    });

    return [...otherData, ...result];
  };
  const setDataEdit = async () => {
    delete activityData?.rich_note;
    const loadData = (guestes) => {
      const startDateSet = moment(activityData?.start_date);
      const startDateWithoutTZ = activityData?.start_date.split('T')[0];
      const startTimeFormatted = startDateSet.utc().format(formatHHMM);
      const endDateSet = moment(activityData?.end_date);
      const endDateWithoutTZ = activityData?.end_date.split('T')[0];
      const endTimeFormatted = endDateSet.utc().format(formatHHMM);
      const activityDataGet = {
        ...activityForm,
        ...activityData,
        description: activityData?.description,
        notes: activityData?.notes,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        free_busy: 'abc',
      };
      setStartTime(startTimeFormatted);
      setEndTime(endTimeFormatted);
      setValue('name', activityData?.name);
      setValue('description', activityData?.description);
      setValue('notes', activityData?.notes);
      setOwnerData(activityData?.owners);
      setStartDate(new Date(startDateWithoutTZ));
      setEndDate(new Date(endDateWithoutTZ));
      setActivityForm(activityDataGet);
      setTagifyValue(guestes);
    };
    if (feedId) {
      try {
        const guestes = await getUserByIds(activityData.guests);
        loadData(guestes);
      } catch (e) {
        loadData([]);
      }
    }
  };
  const onSelect = (e) => {
    const { name, value } = e.target;
    setMultipleName(name);
    setValue(name, value);
    const activityData = {
      ...activityForm,
      [name]: value,
    };
    setActivityForm(activityData);
  };
  const clearState = (name) => {
    setValue(name, '');
    const activityData = {
      ...activityForm,
      [name]: '',
    };
    delete activityForm[name];
    delete activityData[name];
    setActivityForm(activityData);
  };
  const onHandleChange = (e) => {
    const target = e.target;
    let activityData;
    if (
      target.name === 'priority' ||
      target.name === 'done' ||
      target.name === 'online_meet'
    ) {
      activityData = {
        ...activityForm,
        [target.name]: target.checked,
      };
    } else {
      activityData = {
        ...activityForm,
        [target.name]: target.value,
      };
    }
    setValue(target.name, target.value);
    setActivityForm(activityData);
  };
  const onHandleCustomField = (e, id, value_type, field_type) => {
    const target = e.target;
    let value = '';
    if (value_type === 'string' && target.value !== '') {
      value = target.value;
      if (field_type === 'CURRENCY') {
        value = '$' + value;
      }
    }
    if (value_type === 'number' && target.value !== '') {
      value = parseInt(target.value);
    }
    activityData = {
      ...activityForm,
      [target.name]: target.value,
    };
    setActivityForm(activityData);
    let updated = false;
    const fieldData = customFieldData.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return {
          field_id: id,
          value,
          key: target.name,
        };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFieldData(fieldData);
    } else {
      setCustomFieldData([
        ...customFieldData,
        { field_id: id, value, key: target.name },
      ]);
    }
  };
  const onHandleCustomCheckBox = (e, id) => {
    const target = e.target;
    setCustomFieldData([
      ...customFieldData,
      { field_id: id, value: target.checked, key: target.name },
    ]);
    activityData = {
      ...activityForm,
      [target.name]: target.checked,
    };
    setActivityForm(activityData);
  };
  const onHandlePicklistSingle = (item, id, fieldName) => {
    let picked;
    if (item.name === '-None-') {
      picked = '';
    } else {
      picked = [{ value: item.name }];
    }
    let updated = false;
    const fieldData = customFieldData.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFieldData(fieldData);
    } else {
      setCustomFieldData([
        ...customFieldData,
        { field_id: id, value: picked, key: fieldName },
      ]);
    }
    activityData = {
      ...activityForm,
      [fieldName]: picked,
    };
    setActivityForm(activityData);
    setValue(fieldName, picked);
  };
  const selectPicklistValue = (fieldName, value_option, id) => {
    if (activityForm[fieldName] === '') {
      return '-None-';
    }
    if (
      activityForm[fieldName] &&
      activityForm[fieldName][0] &&
      typeof activityForm[fieldName][0].value === 'string'
    ) {
      return activityForm[fieldName][0].value;
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (
      defaultItem &&
      defaultItem.value &&
      !feedId &&
      !(fieldName in initialLoad)
    ) {
      initialLoad[fieldName] = 'yes';
      handlePicklistDefault(
        {
          field_id: id,
          value: [{ value: defaultItem.value }],
          key: fieldName,
        },
        fieldName
      );
      return defaultItem.value;
    }

    return '-None-';
  };
  const onHandlePicklistMulti = (val, id, fieldName) => {
    let picked;
    if (val.length === 0) {
      picked = '';
    } else {
      picked = val;
    }
    let updated = false;
    const fieldData = customFieldData.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFieldData(fieldData);
    } else {
      const tempCustom = [
        ...customFieldData,
        { field_id: id, value: picked, key: fieldName },
      ];
      setCustomFieldData(tempCustom);
    }
    activityData = {
      ...activityForm,
      [fieldName]: picked,
    };
    setActivityForm(activityData);
    setValue(fieldName, picked);
  };
  const selectPicklistMultiValue = (fieldName, value_option, id) => {
    if (activityForm[fieldName] === '') {
      return [];
    }
    if (activityForm[fieldName]) {
      return activityForm[fieldName];
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (
      defaultItem &&
      defaultItem.value &&
      !feedId &&
      !(fieldName in initialLoad)
    ) {
      initialLoad[fieldName] = 'yes';
      handlePicklistDefault(
        {
          field_id: id,
          value: [{ value: defaultItem.value }],
          key: fieldName,
        },
        fieldName
      );
      return [{ value: defaultItem.value }];
    }

    return [];
  };
  const handlePicklistDefault = (data, fieldName) => {
    picklistDefault.push(data);
    setCustomFieldData([...customFieldData, ...picklistDefault]);
    activityData = {
      ...activityData,
      ...activityForm,
      [fieldName]: data.value,
    };
    setActivityForm(activityData);
    setValue(fieldName, [data]);
  };
  const onHandleCustomDate = (date, id, fieldName) => {
    date = new Date(date);
    const currentTime = new Date();

    date.setHours(currentTime.getHours());
    date.setMinutes(currentTime.getMinutes());
    date.setSeconds(currentTime.getSeconds());
    if (date === '') {
      setCustomFieldData([...customFieldData, { field_id: id, value: '' }]);
    } else {
      setCustomFieldData([
        ...customFieldData,
        { field_id: id, value: new Date(date).toISOString(), key: fieldName },
      ]);
    }
    const activityData = {
      ...activityForm,
      [fieldName]: new Date(date),
    };
    setActivityForm(activityData);
    setValue(fieldName, date);
  };
  const getPattern = (field_type) => {
    if (field_type === 'EMAIL') {
      return emailRegex;
    } else if (field_type === 'PHONE') {
      return phoneRegex;
    } else if (field_type === 'TIME') {
      return timeRegex;
    } else if (field_type === 'URL') {
      return urlRegex;
    } else {
      return anyRegex;
    }
  };
  const getPatternErrorMessage = (field_type) => {
    if (field_type === 'EMAIL') {
      return 'Invalid email address.';
    } else if (field_type === 'PHONE') {
      return 'Phone number must be 123-123-1234.';
    } else if (field_type === 'TIME') {
      return 'Time must be HH:MM:SS AM/PM.';
    } else if (field_type === 'URL') {
      return 'Invalid URL.';
    } else {
      return 'Invalid Input.';
    }
  };
  const onActivitySelect = (value) => {
    const activitData = {
      ...activityForm,
      bad_email: value,
    };
    setActivityForm(activitData);
    setValue('bad_email', value);
  };
  const handleStartDateSelect = (value) => {
    if (value) {
      setStartDate(value);
      const activityStartDate = {
        ...activityForm,
        start_date: new Date(value),
      };
      setActivityForm(activityStartDate);
      setValue('start_date', value);
    }
  };
  const handleSetDateSelect = (value) => {
    if (value) {
      setStartDate(value);
      const activityStartDate = {
        ...activityForm,
        start_date: `${moment(value).format(DATE_FORMAT)} ${startTime}`,
      };
      setActivityForm(activityStartDate);
      setValue('start_date', value);
    }
  };
  const handleEndDateSelect = (value) => {
    setEndDate(value);
    const activityStartDate = {
      ...activityForm,
      end_date: `${moment(value).format(DATE_FORMAT)} ${endTime}`,
    };
    setActivityForm(activityStartDate);
    validationCheck(`${moment(value).format(DATE_FORMAT)} ${endTime}`);
    setValue('end_date', value);
  };
  const handleStartTimeSelect = (e, focus) => {
    if (!e?.value) {
      return;
    }
    const value = focus ? e?.value : e?.target?.value;
    const dateSet = moment(activityForm?.start_date).format(DATE_FORMAT);
    const timeSet = moment(value).format(formatHHMM);
    const uiDateTime = moment(`${dateSet} ${timeSet}`).format(
      DATE_FORMAT_DASHED_TZ
    );
    const activityStartDate = {
      ...activityForm,
      start_date: uiDateTime,
    };
    setStartTime(timeSet);
    setActivityForm(activityStartDate);
    setValue('start_time', value);
  };
  const handleEndTimeSelect = (e, focus) => {
    if (!e?.value) {
      return;
    }
    const value = focus ? e?.value : e?.target?.value;
    const dateSet = moment(activityForm?.end_date).format(DATE_FORMAT);
    const activityStartDate = {
      ...activityForm,
      end_date: `${dateSet} ${moment(value).format(formatHHMM)}`,
    };
    setEndTime(moment(value).format(formatHHMM));
    validationCheck(
      activityStartDate?.end_date,
      moment(value).format(formatHHMM)
    );
    setActivityForm(activityStartDate);
    setValue('end_time', value);
  };
  const validationCheck = (endDate, start_Date) => {
    if (endDate && activityForm.start_date) {
      const startDate = moment(
        new Date(activityForm.start_date),
        'MM/DD/YYYY hh:mm A'
      );
      const endDateFormatted = moment(new Date(endDate), 'MM/DD/YYYY hh:mm A');

      if (endDateFormatted.isSameOrBefore(startDate)) {
        return setErrorTextMessage('End Date must be greater than Start Date');
      } else {
        setErrorTextMessage('');
        return true;
      }
    }
  };
  useEffect(() => {
    validationCheck(activityForm?.end_date);
  }, [activityForm?.start_date, activityForm?.end_date]);
  useEffect(() => {
    const arr = [...ownerData];
    arr.push(profileInfo);
    setOwnerData(arr);
  }, [profileInfo]);
  useEffect(() => {
    if (feedId) {
      const groups = Object.keys(allFields);
      if (groups.length) {
        for (const grp of groups) {
          const fields = allFields[grp];
          fields.forEach((field) => {
            const { columnName, key } = field;
            const fieldName = columnName
              ? columnName.toLowerCase()
              : key?.toLowerCase().replace(/\s+/g, '');
            setValue(fieldName, activityData[fieldName]);
          });
        }
      }
    }
  }, [activityData]);
  useEffect(() => {
    if (btnType === 'event' && !activityForm?.end_date) {
      const activityIdsGet = {
        ...activityForm,
        end_date: `${currentDateSet} ${endTime}`,
      };
      relatedToData();
      setActivityForm(activityIdsGet);
      setValue('end_date', currentDateSet);
    } else {
      relatedToData();
    }
  }, [!activityForm?.end_date, currentDateSet]);
  const getUsers = async (search) => {
    const { data } = await userService.getUsers(
      { status: 'active', search },
      { page: 1, limit: 100 }
    );
    setUsers(data?.users);
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setOwnerCharactersRequire('');
      setOwnerSearch({
        ...ownerSearch,
        search: e.target.value,
      });
      getUsers(e.target.value);
    } else {
      setUsers([]);
      return setOwnerCharactersRequire(match?.length);
    }
  };
  useEffect(() => {
    setOwnerData([profileInfo]);
  }, []);
  return (
    <>
      <CardBody className="right-bar-vh h-100 overflow-y-auto">
        <Form
          onSubmit={
            feedId ? handleSubmit(updateAndSend) : handleSubmit(saveAndSend)
          }
        >
          {Object.keys(allFields).map((key, index) => {
            return (
              <div key={`fields-${index}`}>
                {moduleMap ? (
                  <h5 className="pb-0">
                    {key
                      .replace(/Task/g, moduleMap.task.singular)
                      .replace(/Call/g, moduleMap.call.singular)
                      .replace(/Event/g, moduleMap.event.singular)}
                  </h5>
                ) : (
                  <h5 className="pb-0">
                    {key
                      .replace(/Call/g, call)
                      .replace(/Task/g, task)
                      .replace(/Event/g, event)}
                  </h5>
                )}

                {allFields[key]?.length > 0 &&
                  allFields[key]?.map((field) => {
                    const {
                      field_type,
                      columnName,
                      key,
                      mandatory,
                      isCustom,
                      id,
                      value_type,
                      type,
                      value_option,
                    } = field;
                    const fieldName = columnName
                      ? columnName.toLowerCase()
                      : key?.toLowerCase().replace(/\s+/g, '');
                    return (
                      <>
                        <div className="text-right">
                          {(key === 'Owner' ||
                            key === 'Host' ||
                            key === 'Task Owner') && (
                            <FormGroup row className="align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <AutoComplete
                                  id="isUserId"
                                  title={'Select Owner'}
                                  name="isUserId"
                                  placeholder="Select Owner"
                                  showAvatar={false}
                                  customKey="name"
                                  customTitle={''}
                                  charactersRequire={ownerCharactersRequire}
                                  onChange={(e) => stateChange(e)}
                                  clearState={(e) => clearState(e)}
                                  search={ownerSearch?.search}
                                  data={users}
                                  onHandleSelect={(item) => {
                                    setOwnerData([item]);
                                    setOwnerError(false);
                                  }}
                                  selected={ownerData[0]?.name}
                                />
                                {ownerError && (
                                  <p className="text-danger mt-2 text-sm text-left">
                                    Please Select Owner
                                  </p>
                                )}
                              </Col>
                            </FormGroup>
                          )}
                        </div>
                        {key !== 'Participants' &&
                          key !== 'Host' &&
                          key !== 'Related To' &&
                          key !== 'Repeat' &&
                          key !== 'Owner' &&
                          key !== 'Task Owner' &&
                          key !== 'Free Busy' &&
                          key !== 'Conference Link' &&
                          key !== 'Location' &&
                          columnName !== 'guests' &&
                          field_type !== 'DATE' &&
                          field_type !== 'CHECKBOX' &&
                          key !== 'Customer Name' &&
                          field_type !== 'PICKLIST' &&
                          field_type !== 'PICKLIST_MULTI' &&
                          renderComponent(field_type, {
                            value: activityForm || activityObj,
                            id: fieldName,
                            name: fieldName,
                            label: key,
                            className: 'text-capitalize',
                            classNames: mandatory
                              ? 'border-left-4 border-left-danger'
                              : '',
                            key: columnName,
                            placeholder: key,
                            validationConfig: {
                              required: mandatory,
                              inline: false,
                              pattern: getPattern(field_type),
                              onChange: (e) => {
                                if (isCustom) {
                                  onHandleCustomField(e, id, value_type);
                                } else {
                                  onHandleChange(e);
                                }
                              },
                            },
                            errors,
                            errorMessage: getPatternErrorMessage(field_type),
                            register,
                            errorDisplay: 'mb-0',
                            fieldType: field_type,
                            type: field_type === 'TEXT' ? 'textarea' : 'input',
                            disabled: key === 'Call Type',
                            onChange: (e) => {
                              if (isCustom) {
                                onHandleCustomField(
                                  e,
                                  id,
                                  value_type,
                                  field_type
                                );
                              }
                            },
                          })}
                        {key !== 'Repeat' && field_type === 'CHECKBOX' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {/* {key} */}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <CheckboxInput
                                    label={key}
                                    id={fieldName}
                                    name={fieldName}
                                    onChange={(e) => {
                                      if (isCustom) {
                                        onHandleCustomCheckBox(e, id);
                                      } else {
                                        onHandleChange(e);
                                      }
                                    }}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    checked={
                                      isCustom
                                        ? activityForm[fieldName] === true
                                        : (fieldName === 'priority' &&
                                            activityForm?.priority === true) ||
                                          (fieldName === 'done' &&
                                            activityForm?.done === true) ||
                                          (fieldName === 'online_meet' &&
                                            activityForm?.online_meet === true)
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {field_type === 'PICKLIST' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <DropdownSelect
                                    data={value_option.map((item, i) => {
                                      return {
                                        id: i,
                                        name: item.value,
                                      };
                                    })}
                                    onHandleSelect={(item) => {
                                      onHandlePicklistSingle(
                                        item,
                                        id,
                                        fieldName
                                      );
                                    }}
                                    select={selectPicklistValue(
                                      fieldName,
                                      value_option,
                                      id,
                                      fieldName
                                    )}
                                    placeholder="Select Option"
                                    customClasses={
                                      'w-100 overflow-y-auto max-h-300'
                                    }
                                    validationConfig={{ required: mandatory }}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {field_type === 'PICKLIST_MULTI' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <AddPicklistOptions
                                    dropdownList={value_option.filter(
                                      (item) => item.value !== '-None-'
                                    )}
                                    validationConfig={{ required: mandatory }}
                                    fieldState={getFieldState(fieldName)}
                                    placeholder={'Add Options'}
                                    value={selectPicklistMultiValue(
                                      fieldName,
                                      value_option,
                                      id,
                                      fieldName
                                    )}
                                    setValue={(e) =>
                                      onHandlePicklistMulti(e, id, fieldName)
                                    }
                                    tooltip={constants.tooltipTagInput}
                                    labelSize="full"
                                    onChange={(e) => {}}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {(key === 'Participants' ||
                          columnName === 'guests') && (
                          <FormGroup row className="align-items-center">
                            <Label
                              md={3}
                              className="text-right font-size-sm mb-0"
                            >
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <AddActivityOptions
                                    tagifyDropdownlist={tagifyDropdownlist}
                                    constants={constants}
                                    tagifyValue={tagifyValue}
                                    charactersRequire={charactersRequire}
                                    setAnotherGuests={setAnotherGuests}
                                    setTagifyValue={setTagifyValue}
                                    searchGuest={searchGuest}
                                    setBadEmail={onActivitySelect}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    endDate={activityForm?.end_date}
                                    expand={true}
                                    isOpen={true}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {(key === 'Date & Time' || field_type === 'DATE') &&
                          btnType !== 'event' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <ControllerValidation
                                    name={fieldName}
                                    errors={errors}
                                    form={activityForm}
                                    errorDisplay="mb-0"
                                    control={control}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    renderer={({ field }) => (
                                      <ReactDatepicker
                                        id={fieldName}
                                        name={fieldName}
                                        format={DATE_FORMAT_EJS}
                                        autoComplete="off"
                                        todayButton="Today"
                                        validationConfig={{
                                          required: mandatory
                                            ? `${key} is required.`
                                            : '',
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        value={
                                          isCustom
                                            ? activityForm[fieldName]
                                            : startDate || currentDate
                                        }
                                        className="form-control"
                                        placeholder={DATE_FORMAT_EJS_UPDATED}
                                        onChange={(date) => {
                                          if (isCustom) {
                                            onHandleCustomDate(
                                              date,
                                              id,
                                              fieldName
                                            );
                                          } else {
                                            handleStartDateSelect(date);
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                  {((columnName === null &&
                                    field_type === 'TIME') ||
                                    !isCustom) && (
                                    <div className="date-picker input-time w-100">
                                      <TimePickerComponent
                                        id={`start-time`}
                                        cssClass="e-custom-style"
                                        openOnFocus={true}
                                        value={
                                          isCustom
                                            ? activityForm[fieldName]
                                            : startTime
                                        }
                                        format="hh:mm a"
                                        placeholder="Start Time"
                                        onChange={(e) =>
                                          handleStartTimeSelect(e, true)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                        {key === 'Date & Time' && btnType === 'event' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <div className="date-picker input-time activity-date-picker align-items-center w-100">
                                    <ReactDatepicker
                                      id="start_date"
                                      name="start_date"
                                      format={DATE_FORMAT_EJS}
                                      todayButton="Today"
                                      autoComplete="off"
                                      value={startDate || currentDate}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key} is required.`
                                          : '',
                                      }}
                                      fieldState={getFieldState(fieldName)}
                                      className="form-control mr-1"
                                      placeholder={DATE_FORMAT_EJS_UPDATED}
                                      onChange={(date) =>
                                        handleSetDateSelect(date)
                                      }
                                    />
                                    <DateRangeInput
                                      id={`start-date-1`}
                                      name={columnName}
                                      format={DATE_FORMAT_EJS}
                                      className="calendar-activity text-left"
                                      placeholder={key}
                                      feedId={feedId}
                                      startTime={
                                        activityForm?.start_time || startTime
                                      }
                                      timePickerChange={handleStartTimeSelect}
                                      endTimePicker={handleEndTimeSelect}
                                      endTime={
                                        activityForm?.end_time || endTime
                                      }
                                    />
                                    <ReactDatepicker
                                      id="end_date"
                                      name="end_date"
                                      format={DATE_FORMAT_EJS}
                                      todayButton="Today"
                                      autoComplete="off"
                                      value={endDate || currentDate}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key} is required.`
                                          : '',
                                      }}
                                      fieldState={getFieldState(fieldName)}
                                      className="form-control"
                                      placeholder={DATE_FORMAT_EJS_UPDATED}
                                      onChange={(date) =>
                                        handleEndDateSelect(date)
                                      }
                                    />
                                  </div>
                                )}
                              />
                              {errorTextMessage && (
                                <p className="text-danger mt-2 text-sm">
                                  {errorTextMessage}
                                </p>
                              )}
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Related To' && type !== 'call' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={dataType ? `${dataType}_id` : nameSet}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <IdfSelectMultiOpp
                                    label={key}
                                    name={dataType ? `${dataType}_id` : nameSet}
                                    onChange={onSelect}
                                    clearState={(e) => clearState(e)}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                      onChange: onSelect,
                                    }}
                                    fieldState={getFieldState(
                                      dataType ? `${dataType}_id` : nameSet
                                    )}
                                    value={
                                      (dataType === 'deal' && {
                                        ...deal,
                                        title: deal?.name,
                                      }) ||
                                      (dataType === 'organization' && {
                                        ...organization,
                                        title: organization?.name,
                                      }) ||
                                      (dataType === 'contact' && {
                                        ...contactInfo,
                                        title: `${contactInfo?.first_name} ${contactInfo?.last_name}`,
                                      })
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Customer Name' && type === 'call' && (
                          <FormGroup row className="align-items-center">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={dataType ? `${dataType}_id` : nameSet}
                                errors={errors}
                                form={activityForm}
                                errorDisplay="mb-0"
                                control={control}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                renderer={({ field }) => (
                                  <IdfSelectMultiOpp
                                    label={key}
                                    name={dataType ? `${dataType}_id` : nameSet}
                                    onChange={onSelect}
                                    clearState={(e) => clearState(e)}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                      onChange: onSelect,
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    value={
                                      (dataType === 'deal' && {
                                        ...deal,
                                        title: deal?.name,
                                      }) ||
                                      (dataType === 'organization' && {
                                        ...organization,
                                        title: organization?.name,
                                      }) ||
                                      (dataType === 'contact' && {
                                        ...contactInfo,
                                        title: `${contactInfo?.first_name} ${contactInfo?.last_name}`,
                                      })
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {((!feedId && key === 'Repeat' && btnType === 'task') ||
                          (!feedId &&
                            btnType === 'event' &&
                            key === 'Repeat')) && (
                          <FormGroup
                            row
                            className="py-1 align-items-center flex-wrap"
                          >
                            <Col md={3}></Col>
                            <Col md={9} className="pl-0 d-block">
                              <SelectRepeats
                                label={key}
                                activityForm={activityForm}
                                setActivityForm={setActivityForm}
                                startDate={activityForm?.start_date}
                                setRepeatChecked={setRepeatChecked}
                              />
                            </Col>
                          </FormGroup>
                        )}
                      </>
                    );
                  })}
              </div>
            );
          })}
        </Form>
      </CardBody>
      <ModalFooter>
        <ButtonIcon
          label="Cancel"
          type="button"
          color="white"
          classnames="btn-white mx-1 btn-sm"
          onclick={isModal ? handleCloseModal : ''}
        />
        <ButtonIcon
          classnames="btn-sm"
          type="button"
          onClick={
            feedId ? handleSubmit(updateAndSend) : handleSubmit(saveAndSend)
          }
          label={feedId ? 'Update' : 'Save'}
          color={`primary`}
          loading={loading}
        />
      </ModalFooter>
    </>
  );
};

export default AddActivity;
