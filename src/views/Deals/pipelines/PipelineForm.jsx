import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Col, Form, FormGroup, Label } from 'reactstrap';

import { ALL_LABEL, CANCEL_LABEL } from '../../../utils/constants';
import { labels } from '../contacts/Contacts.constants';
import { onGetOwners, onInputSearch } from '../contacts/utils';
import {
  // DATE_FORMAT,
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  emailRegex,
  formatHHMMSS,
  urlRegex,
  valueNumberValidator,
} from '../../../utils/Utils';
import ReactDatepicker from '../../../components/inputs/ReactDatpicker';
import AutoComplete from '../../../components/AutoComplete';
import { renderComponent } from '../../../components/peoples/constantsPeople';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../../components/commons/ControllerValidation';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import { PricingField } from '../../../components/PricingFieldComponent';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import IdfFormInput from '../../../components/idfComponents/idfFormInput/IdfFormInput';
import { CheckboxInput } from '../../../components/layouts/CardLayout';
import stringConstants from '../../../utils/stringConstants.json';
import DropdownSelect from '../../../components/DropdownSelect';
import AddPicklistOptions from '../../../components/peopleProfile/contentFeed/AddPicklistOptions';
const constants = stringConstants.deals.organizations.profile;

const maxPrice = 99999999.0;

const PipelineForm = ({
  moduleMap,
  moduleData,
  setEditMode,
  deal,
  onHandleSubmit,
  fields,
  loading,
  setLoading,
  customDataFields,
  setCustomDataFields,
  dealFormData,
  dispatch,
}) => {
  const [data, setData] = useState([]);
  const [, setSelectStage] = useState(ALL_LABEL);
  const [selectOwner, setSelectOwner] = useState('');
  const [charactersContact, setCharactersContact] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: deal,
  });
  const [filter, setFilter] = useState({
    search: '',
    users: [],
  });

  useEffect(() => {
    const groups = Object.keys(fields);
    if (groups.length) {
      for (const grp of groups) {
        const field = fields[grp];
        field.forEach((item) => {
          const { columnName, key } = item;
          const fieldName = columnName
            ? columnName.toLowerCase()
            : key?.toLowerCase().replace(/\s+/g, '');
          setValue(fieldName, deal[fieldName]);
        });
      }
    }
  }, [fields]);
  useEffect(() => {
    if (deal) {
      getStage();
      getOwner();
    }
  }, [deal]);

  useEffect(() => {
    onGetOwners(filter, setData);
  }, [filter]);

  const getStage = () => {
    const stage = labels.find((label) => label.name === deal.deal_type);

    setSelectStage(stage?.title);
  };

  const getOwner = () => {
    setSelectOwner(
      `${deal.assigned_user.first_name} ${deal.assigned_user.last_name}`
    );
  };

  const onSubmit = async () => {
    setLoading(true);
    const newDealFormData = {
      ...dealFormData,
      sales_stage: dealFormData.deal_type,
    };

    onHandleSubmit(newDealFormData);
    reset(newDealFormData);
  };

  const onChangeClosingDate = (selectedDate, fieldName) => {
    console.log(selectedDate);
    dispatch({
      ...dealFormData,
      [fieldName]: selectedDate,
    });
  };

  const amountHandler = (e) => {
    let { value, name } = e.target;

    value = valueNumberValidator(value, 2, maxPrice);

    e.target.value = value;
    dispatch({ ...dealFormData, [name]: value });
  };
  const onChange = (e) => {
    const { value, name } = e.target;
    dispatch({ ...dealFormData, [name]: value });
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
    } else if (field_type === 'TIME') {
      value = moment(value).format(formatHHMMSS);
    }
    let updated = false;
    dispatch({ ...dealFormData, [target.name]: target.value });
    const fieldData = customDataFields.map((item) => {
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
      setCustomDataFields(fieldData);
    } else {
      setCustomDataFields([...fieldData, { field_id: id, value }]);
    }
  };
  const onHandleCustomCheckBox = (e, id) => {
    const target = e.target;
    dispatch({ ...dealFormData, [target.name]: target.checked });

    const isDuplicate = customDataFields.some((field) => field.field_id === id);

    if (!isDuplicate) {
      setCustomDataFields([
        ...customDataFields,
        { field_id: id, value: target.checked },
      ]);
    }
    setValue(target.name, target.checked);
  };
  const onHandleCustomDate = (date, id, fieldName) => {
    if (date === '') {
      setCustomDataFields([...customDataFields, { field_id: id, value: '' }]);
    } else {
      setCustomDataFields([
        ...customDataFields,
        { field_id: id, value: new Date(date) },
      ]);
    }
    setValue(fieldName, new Date(date));
    dispatch({ ...dealFormData, [fieldName]: new Date(date) });
  };
  const handleContactChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersContact('');
      onInputSearch(e, filter, setFilter);
    } else {
      return setCharactersContact(match?.length);
    }
  };
  const clearState = (name) => {
    setValue('assigned_user_id', '');
    dispatch({
      ...dealFormData,
      assigned_user_id: '',
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
    const fieldData = customDataFields.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomDataFields(fieldData);
    } else {
      setCustomDataFields([
        ...customDataFields,
        { field_id: id, value: picked, key: fieldName },
      ]);
    }
    dispatch({ ...dealFormData, [fieldName]: picked });
    setValue(fieldName, picked);
  };

  const selectPicklistValue = (fieldName, value_option, id) => {
    if (dealFormData[fieldName] === '') {
      return '-None-';
    }
    if (
      dealFormData[fieldName] &&
      dealFormData[fieldName][0] &&
      typeof dealFormData[fieldName][0].value === 'string'
    ) {
      return dealFormData[fieldName][0].value;
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
    const fieldData = customDataFields.map((item) => {
      if (item.field_id === id) {
        updated = true;
        return { field_id: id, value: picked, key: fieldName };
      } else {
        return item;
      }
    });
    if (updated) {
      setCustomDataFields(fieldData);
    } else {
      const tempCustom = [
        ...customDataFields,
        { field_id: id, value: picked, key: fieldName },
      ];
      setCustomDataFields(tempCustom);
    }
    dispatch({ ...dealFormData, [fieldName]: picked });
    setValue(fieldName, picked);
  };
  const selectPicklistMultiValue = (fieldName, value_option, id) => {
    if (dealFormData[fieldName] === '') {
      return [];
    }
    if (dealFormData[fieldName]) {
      return dealFormData[fieldName];
    }

    return [];
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {Object.keys(fields).map((key, index) => {
        return (
          <div className="card-body bg-light" key={`feilds-${index}`}>
            {
              <h5 className="pb-0">
                {moduleMap ? key.replace(/Deal/g, moduleMap) : key}
              </h5>
            }
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
                    key !== 'Pipeline & Stage' &&
                    key !== 'Contact Person' &&
                    field_type !== 'CHECKBOX' &&
                    field_type !== 'PHONE' &&
                    field_type !== 'CURRENCY' &&
                    field_type !== 'DATE' &&
                    field_type !== 'PICKLIST' &&
                    field_type !== 'PICKLIST_MULTI' &&
                    field_type !== 'TIME' ? (
                      <div key={item?.id}>
                        {renderComponent(field_type, {
                          value: dealFormData,
                          className: 'text-capitalize',
                          label: key,
                          inputClass: mandatory
                            ? 'border-left-4 border-left-danger'
                            : '',
                          validationConfig: {
                            required: mandatory,
                            inline: false,
                            onChange: (e) =>
                              isCustom
                                ? onHandleCustomField(e, id, value_type)
                                : fieldName === 'amount'
                                ? amountHandler(e)
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
                          type: field_type === 'TEXT' ? 'textarea' : 'input',
                          name: fieldName,
                          placeholder: field_type === 'NUMBER' ? '0' : key,
                        })}
                      </div>
                    ) : (
                      ''
                    )}
                    {item?.key === 'Contact Person' && (
                      <FormGroup row className="py-1 align-items-center">
                        <Label
                          md={3}
                          className="text-right mb-0 font-size-sm"
                          htmlFor={fieldName}
                        >
                          {item?.key}
                        </Label>
                        <Col md={9} className="pl-0">
                          <ControllerValidation
                            name={fieldName}
                            validationConfig={{
                              required: item?.mandatory
                                ? `${item?.key} is required.`
                                : '',
                            }}
                            errors={errors}
                            form={dealFormData}
                            errorDisplay="mb-0"
                            control={control}
                            renderer={({ field }) => (
                              <AutoComplete
                                id={fieldName}
                                placeholder={'Search for owner'}
                                selected={selectOwner}
                                customKey="name"
                                clearState={clearState}
                                name={fieldName}
                                charactersRequire={charactersContact}
                                onChange={(e) =>
                                  handleContactChange(e, filter, setFilter)
                                }
                                data={data}
                                validationConfig={{
                                  required: item?.mandatory
                                    ? `${item?.key} is required.`
                                    : '',
                                }}
                                fieldState={getFieldState(fieldName)}
                                onHandleSelect={(item) =>
                                  dispatch({
                                    ...dealFormData,
                                    assigned_user_id: item?.id,
                                  })
                                }
                              />
                            )}
                          />
                        </Col>
                      </FormGroup>
                    )}
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
                            checked={dealFormData[fieldName]}
                          />
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
                              form={dealFormData}
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
                                    onHandlePicklistSingle(item, id, fieldName);
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
                              form={dealFormData}
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
                                    onHandlePicklistMulti(e, id, fieldName)
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
                            value={dealFormData}
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
                              form={dealFormData}
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
                                  value={
                                    dealFormData[fieldName] &&
                                    new Date(dealFormData[fieldName])
                                  }
                                  className="form-control"
                                  placeholder={DATE_FORMAT_EJS_UPDATED}
                                  onChange={(date) =>
                                    isCustom
                                      ? onHandleCustomDate(date, id, fieldName)
                                      : onChangeClosingDate(date, fieldName)
                                  }
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
                              value={dealFormData[fieldName] || '12:00 PM'}
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
                            ? onHandleCustomField(e, id, value_type, field_type)
                            : onChange(e)
                        }
                        validationConfig={{
                          required: mandatory,
                          inline: false,
                        }}
                        value={dealFormData}
                      />
                    )}
                  </>
                );
              })}
          </div>
        );
      })}
      <div className="card-footer text-right">
        <button
          type="button"
          className="btn btn-white btn-sm mr-2"
          onClick={() => {
            setEditMode(false);
          }}
        >
          {CANCEL_LABEL}
        </button>
        <ButtonIcon
          type="submit"
          classnames="btn-sm"
          label={'Save'}
          loading={loading}
          color="primary"
        />
      </div>
    </Form>
  );
};

export default PipelineForm;
