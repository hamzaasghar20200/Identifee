import React, { useEffect, useState } from 'react';
import { CardBody, CardFooter, Form, FormGroup, Label } from 'reactstrap';
import { Col } from 'react-bootstrap';

import organizationService from '../../services/organization.service';
import userService from '../../services/user.service';
import {
  OWNER,
  SEARCH_FOR_COMPANY,
  SEARCH_FOR_INSIGHT,
} from '../../utils/constants';
import {
  onHandleSelect,
  onInputChange,
  onInputSearch,
} from '../../views/Deals/contacts/utils';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import IdfSelectLabel from '../idfComponents/idfDropdown/IdfSelectLabel';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import AutoComplete from '../AutoComplete';
import { renderComponent } from './constantsPeople';
import { CheckboxInput } from '../layouts/CardLayout';
import ButtonIcon from '../commons/ButtonIcon';
import {
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  emailRegex,
  formatHHMMSS,
  urlRegex,
} from '../../utils/Utils';
import IdfFormInput from '../idfComponents/idfFormInput/IdfFormInput';
import { PricingField } from '../PricingFieldComponent';
import ReactDatepicker from '../inputs/ReactDatpicker';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import ControllerValidation from '../commons/ControllerValidation';
import moment from 'moment';
import useIsTenant from '../../hooks/useIsTenant';
import DropdownSelect from '../DropdownSelect';
import stringConstants from '../../utils/stringConstants.json';
import AddPicklistOptions from '../peopleProfile/contentFeed/AddPicklistOptions';
const constants = stringConstants.deals.organizations.profile;
const PeopleForm = ({
  dispatch,
  moduleMap,
  peopleFormData,
  refresh,
  fields,
  onClose,
  loading,
  register,
  handleSubmit,
  setValue,
  getFieldState,
  control,
  errors,
  onHandleSubmit,
  searchValue,
  customFields = [],
  peopleForm = {},
  picklistDefault = [],
  initialLoad = {},
  setCustomFields,
  ...props
}) => {
  const picklistInitialValue = [];
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [selectOwner, setSelectOwner] = useState('');
  const [loadingOrg, setLoadingOrg] = useState(false);
  async function onGetOrganzations() {
    if (searchOrg?.search) {
      setLoadingOrg(true);
      const response = await organizationService
        .getOrganizations(searchOrg, { limit: 10 })
        .catch((err) => err);

      setLoadingOrg(false);

      const { organizations } = response?.data;
      setAllOrganizations(organizations.filter((o) => !!o.name));
    }
  }

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg?.search]);

  useEffect(() => {
    (async () => {
      const me = await getCurrentUser().catch((err) => console.log(err));
      dispatch({
        type: 'set',
        input: 'assigned_user_id',
        payload: me?.id,
      });

      setSelectOwner(me);
    })();
  }, []);
  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return user;
  };

  const onChange = (e) => {
    onInputChange(e, dispatch);
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      onInputSearch(e, searchOrg, setSearchOrg);
    } else {
      return setCharactersRequire(match?.length);
    }
  };
  const clearState = (name) => {
    if (name === 'organization_id') {
      setValue('organization_id', '');
      dispatch({
        type: 'set',
        input: name,
        payload: '',
      });
    }
  };
  const onHandleCustomField = (e, id, value_type, field_type) => {
    const target = e.target;
    let value = '';
    if (value_type === 'string' && target.value !== '') {
      value = target.value;
    }
    if (value_type === 'number' && target.value !== '') {
      value = parseInt(target.value);
    }
    if (field_type === 'CURRENCY') {
      value = `$${target.value}`;
    }
    if (field_type === 'TIME') {
      value = moment(value).format(formatHHMMSS);
    }
    let updated = false;
    onInputChange(e, dispatch);
    const fieldData = customFields.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return {
          field_id: id,
          value,
        };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFields(fieldData);
    } else {
      setCustomFields([...fieldData, { field_id: id, value }]);
    }
  };
  const onHandleCustomCheckBox = (e, id) => {
    const target = e.target;
    onInputChange(e, dispatch);

    const isDuplicate = customFields.some((field) => field.field_id === id);

    if (!isDuplicate) {
      setCustomFields([
        ...customFields,
        { field_id: id, value: target.checked },
      ]);
    }
  };
  const onHandleCustomDate = (date, id, fieldName) => {
    if (date === '') {
      setCustomFields([...customFields, { field_id: id, value: '' }]);
    } else {
      setCustomFields([
        ...customFields,
        { field_id: id, value: new Date(date) },
      ]);
    }
    setValue(fieldName, new Date(date));
    dispatch({
      type: 'set',
      input: fieldName,
      payload: new Date(date),
    });
  };

  const onHandlePicklistSingle = (item, id, fieldName) => {
    let picked;
    if (item.name === '-None-') {
      picked = '';
    } else {
      picked = [{ value: item.name }];
    }
    let updated = false;
    const fieldData = customFields.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFields(fieldData);
    } else {
      setCustomFields([
        ...customFields,
        { field_id: id, value: picked, key: fieldName },
      ]);
    }
    dispatch({
      type: 'set',
      input: fieldName,
      payload: picked,
    });
    setValue(fieldName, picked);
  };

  const selectPicklistValue = (fieldName, value_option, id) => {
    if (peopleFormData[fieldName] === '') {
      return '-None-';
    }
    if (
      peopleFormData[fieldName] &&
      peopleFormData[fieldName][0] &&
      typeof peopleFormData[fieldName][0].value === 'string'
    ) {
      return peopleFormData[fieldName][0].value;
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (defaultItem && defaultItem.value && !(fieldName in initialLoad)) {
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
    const fieldData = customFields.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomFields(fieldData);
    } else {
      const tempCustom = [
        ...customFields,
        { field_id: id, value: picked, key: fieldName },
      ];
      setCustomFields(tempCustom);
    }
    dispatch({
      type: 'set',
      input: fieldName,
      payload: picked,
    });
    setValue(fieldName, picked);
  };
  const selectPicklistMultiValue = (fieldName, value_option, id) => {
    if (peopleFormData[fieldName] === '') {
      return [];
    }
    if (peopleFormData[fieldName]) {
      return peopleFormData[fieldName];
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (defaultItem && defaultItem.value && !(fieldName in initialLoad)) {
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

  const handlePicklistDefault = (dataField, fieldName) => {
    dispatch({
      type: 'set',
      input: fieldName,
      payload: dataField.value,
    });
    picklistInitialValue.push({ key: dataField.key, value: dataField.value });
    picklistDefault.push(dataField);
    setCustomFields([...customFields, ...picklistDefault]);
  };
  useEffect(() => {
    if (picklistInitialValue.length !== 0) {
      handleInitialValue(picklistInitialValue);
    }
  }, [picklistInitialValue]);

  const handleInitialValue = (items) => {
    if (Array.isArray(items) && items.length !== 0) {
      for (const item of items) {
        setValue(item.key, item.value);
      }
    }
  };

  return (
    <>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <CardBody className="right-bar-vh h-100 overflow-y-auto w-100">
        <Form onSubmit={handleSubmit(onHandleSubmit)}>
          {Object.keys(fields).map((key, index) => {
            return (
              <div key={`fields-${index}`}>
                <h5 className="pb-0">
                  {moduleMap.contact &&
                    key
                      .replace(/Contact/g, moduleMap.contact.singular)
                      .replace(/Contacts/g, moduleMap.contact.plural)}
                </h5>
                <>
                  {fields[key]?.length > 0 &&
                    fields[key]?.map((item) => {
                      const {
                        field_type,
                        columnName,
                        key,
                        mandatory,
                        isCustom,
                        id,
                        value_type,
                        value_option,
                      } = item;
                      const fieldName =
                        columnName || key?.toLowerCase().replace(/\s+/g, '');
                      return (
                        <>
                          {key !== 'Company' &&
                            key !== 'Label' &&
                            field_type !== 'CHECKBOX' &&
                            field_type !== 'PHONE' &&
                            field_type !== 'CURRENCY' &&
                            field_type !== 'DATE' &&
                            field_type !== 'TIME' &&
                            field_type !== 'PICKLIST' &&
                            field_type !== 'PICKLIST_MULTI' &&
                            renderComponent(field_type, {
                              value: peopleFormData,
                              label: key,
                              className: 'text-capitalize',
                              inputClass: mandatory
                                ? 'border-left-4 border-left-danger'
                                : '',
                              name: fieldName,
                              refresh,
                              placeholder: key,
                              validationConfig: {
                                required: mandatory,
                                inline: false,
                                onChange: (e) =>
                                  isCustom
                                    ? onHandleCustomField(e, id, value_type)
                                    : onChange(e),
                                pattern:
                                  field_type === 'EMAIL'
                                    ? {
                                        value: emailRegex,
                                        message: 'Please enter a valid email.',
                                      }
                                    : field_type === 'URL'
                                    ? {
                                        value: urlRegex,
                                        message: 'Please enter a valid URL',
                                      }
                                    : '',
                              },
                              errors,
                              register,
                              errorDisplay: 'mb-0',
                              fieldType:
                                field_type.toLowerCase() === 'url'
                                  ? 'text'
                                  : field_type.toLowerCase(),
                              type:
                                field_type === 'TEXT' ? 'textarea' : 'input',
                            })}
                          {field_type === 'CHECKBOX' && (
                            <FormGroup row className="py-1">
                              <Label
                                md={3}
                                className="text-right font-size-sm fw-normal"
                              >
                                {/* {item?.key} */}
                              </Label>
                              <Col md={9} className="pl-0">
                                <CheckboxInput
                                  id={fieldName}
                                  onChange={(e) => {
                                    if (isCustom) {
                                      onHandleCustomCheckBox(e, id);
                                    } else {
                                      onChange(e);
                                    }
                                  }}
                                  label={item?.key}
                                  name={fieldName}
                                  checked={peopleFormData[fieldName]}
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {key === 'Company' && (
                            <FormGroup row className="py-1">
                              <Label
                                md={3}
                                className="text-right font-size-sm fw-normal"
                              >
                                {item?.key.replace(
                                  /Company/g,
                                  moduleMap.organization.singular
                                )}
                              </Label>
                              <Col md={9} className="pl-0">
                                <AutoComplete
                                  id="organization_id"
                                  placeholder={
                                    useIsTenant().isSynovusBank
                                      ? SEARCH_FOR_INSIGHT
                                      : SEARCH_FOR_COMPANY.replace(
                                          /Company/g,
                                          moduleMap.organization.singular
                                        )
                                  }
                                  name="organization_id"
                                  loading={loadingOrg}
                                  type="company"
                                  charactersRequire={charactersRequire}
                                  onChange={(e) => stateChange(e)}
                                  clearState={(e) => clearState(e)}
                                  data={allOrganizations}
                                  onHandleSelect={(item) => {
                                    onHandleSelect(
                                      item,
                                      'organization_id',
                                      dispatch
                                    );
                                    dispatch({
                                      type: 'set',
                                      input: 'contact_organization_new',
                                      payload: null,
                                    });
                                  }}
                                  customKey="name"
                                  extraTitles={[
                                    'address_city',
                                    'address_state',
                                  ]}
                                  selected=""
                                  search={searchOrg.search}
                                  createItem={(data) => {
                                    dispatch({
                                      type: 'set',
                                      input: 'contact_organization_new',
                                      payload: data,
                                    });
                                  }}
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {key === 'Label' && (
                            <FormGroup row className="py-1">
                              <Label
                                md={3}
                                className="text-right font-size-sm fw-normal"
                              >
                                {item?.key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <IdfSelectLabel
                                  type="contact"
                                  onChange={(item) =>
                                    onHandleSelect(item, 'label_id', dispatch)
                                  }
                                  refresh={refresh}
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'PHONE' && (
                            <FormGroup row className="py-1">
                              <Label
                                md={3}
                                className="text-right font-size-sm fw-normal"
                              >
                                {item?.key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <IdfFormInput
                                  className="mb-0 w-100"
                                  placeholder={item?.key}
                                  value={peopleFormData}
                                  name={item?.columnName}
                                  maxLength={14}
                                  onChange={(e) => onChange(e)}
                                  autocomplete="off"
                                />
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'DATE' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <ControllerValidation
                                    name={fieldName}
                                    errors={errors}
                                    form={peopleFormData}
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
                                        minDate={new Date()}
                                        autoComplete="off"
                                        todayButton="Today"
                                        validationConfig={{
                                          required: mandatory
                                            ? `${key} is required.`
                                            : '',
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        value={peopleFormData[fieldName]}
                                        className="form-control"
                                        placeholder={DATE_FORMAT_EJS_UPDATED}
                                        onChange={(date) => {
                                          if (isCustom) {
                                            onHandleCustomDate(
                                              date,
                                              id,
                                              fieldName
                                            );
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'PICKLIST' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <ControllerValidation
                                    name={fieldName}
                                    errors={errors}
                                    form={peopleFormData}
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
                                          id
                                        )}
                                        placeholder="Select Option"
                                        customClasses={
                                          'w-100 overflow-y-auto max-h-300'
                                        }
                                        validationConfig={{
                                          required: mandatory,
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                      />
                                    )}
                                  />
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'PICKLIST_MULTI' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <ControllerValidation
                                    name={fieldName}
                                    errors={errors}
                                    form={peopleFormData}
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
                                        validationConfig={{
                                          required: mandatory,
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        placeholder={'Add Options'}
                                        value={selectPicklistMultiValue(
                                          fieldName,
                                          value_option,
                                          id,
                                          fieldName
                                        )}
                                        setValue={(e) =>
                                          onHandlePicklistMulti(
                                            e,
                                            id,
                                            fieldName
                                          )
                                        }
                                        tooltip={constants.tooltipTagInput}
                                        labelSize="full"
                                        onChange={(e) => {}}
                                      />
                                    )}
                                  />
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'TIME' && (
                            <FormGroup row className="py-1 align-items-center">
                              <Label md={3} className="text-right font-size-sm">
                                {key}
                              </Label>
                              <Col md={9} className="pl-0">
                                <div className="date-picker input-time w-100">
                                  <TimePickerComponent
                                    id={`start-time`}
                                    cssClass="e-custom-style"
                                    openOnFocus={true}
                                    value={
                                      peopleFormData?.start_time || '12:00 PM'
                                    }
                                    format="hh:mm a"
                                    placeholder="Start Time"
                                    onChange={(e) =>
                                      onHandleCustomField(
                                        e,
                                        id,
                                        value_type,
                                        field_type
                                      )
                                    }
                                  />
                                </div>
                              </Col>
                            </FormGroup>
                          )}
                          {field_type === 'CURRENCY' && (
                            <PricingField
                              label={key}
                              name={fieldName}
                              placeholder={key}
                              errors={errors}
                              register={register}
                              onChange={(e) =>
                                isCustom
                                  ? onHandleCustomField(
                                      e,
                                      id,
                                      value_type,
                                      field_type
                                    )
                                  : onChange(e)
                              }
                              validationConfig={{
                                required: mandatory,
                                inline: false,
                              }}
                              value={peopleFormData}
                            />
                          )}
                        </>
                      );
                    })}
                </>
              </div>
            );
          })}
          <FormGroup row className="py-1">
            <Label md={3} className="text-right font-size-sm fw-normal">
              {OWNER}
            </Label>
            <Col md={9} className="pl-0">
              <IdfOwnersHeader
                id="assigned_user_id"
                name="assigned_user_id"
                showAvatar={true}
                mainOwner={selectOwner}
                isClickable={false}
                {...props}
              />
            </Col>
          </FormGroup>
        </Form>
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={onClose}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            onClick={handleSubmit(onHandleSubmit)}
            classnames="btn-sm"
            label={'Save'}
            loading={loading}
            color="primary"
          />
        </div>
      </CardFooter>
    </>
  );
};

export default PeopleForm;
