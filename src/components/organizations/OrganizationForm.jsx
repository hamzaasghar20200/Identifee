import React, { useEffect } from 'react';
import { Col, Label, FormGroup, CardFooter, Form, CardBody } from 'reactstrap';
import IdfSearchDirections from '../idfComponents/idfSearch/IdfSearchDirections';
import IdfSelectLabel from '../idfComponents/idfDropdown/IdfSelectLabel';
import { renderComponent, VIEW_CARD } from '../peoples/constantsPeople';
import stringConstants from '../../utils/stringConstants.json';
import organizationService from '../../services/organization.service';
import ButtonIcon from '../commons/ButtonIcon';
import Loading from '../Loading';
import ControllerValidation from '../commons/ControllerValidation';
import {
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  emailRegex,
  formatHHMMSS,
  urlRegex,
} from '../../utils/Utils';
import moment from 'moment';
import { PricingField } from '../PricingFieldComponent';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import ReactDatepicker from '../inputs/ReactDatpicker';
import IdfFormInput from '../idfComponents/idfFormInput/IdfFormInput';
import { CheckboxInput } from '../layouts/CardLayout';
import { removeCustomFieldsFromActivityForm } from '../../views/Deals/contacts/utils';
import DropdownSelect from '../DropdownSelect';
import AddPicklistOptions from '../peopleProfile/contentFeed/AddPicklistOptions';
import { useModuleContext } from '../.././contexts/moduleContext';
const constants = stringConstants.deals.organizations.profile;
const OrganizationForm = ({
  fields,
  data,
  setEditMode,
  getProfileInfo,
  setProfileInfo,
  setSuccessMessage,
  editMode,
  labelType,
  onHandleSubmit,
  handleSubmit,
  me,
  fromNavBar,
  control,
  setErrorMessage,
  getFieldState,
  onClose,
  loading,
  customDataFields,
  setCustomDataFields,
  customFields,
  isFieldsObj,
  updateLabel,
  setOrganizationFields,
  refresh,
  register,
  setValue,
  errors,
  setLoading,
  isLoading,
  setIsFieldsObj,
  organizationObj = {},
  picklistDefault = [],
  initialLoad = {},
  ...props
}) => {
  const { moduleMap } = useModuleContext();
  const picklistInitialValue = [];
  const onChange = (e) => {
    const target = e.target;
    if (target.name === 'employees') {
      const employees = e.target.value <= 0 ? 0 : parseInt(e.target.value);
      const dataSet = {
        ...isFieldsObj,
        employees,
      };
      setIsFieldsObj(dataSet);
    } else {
      const dataSet = {
        ...isFieldsObj,
        [target.name]: target?.value,
      };
      setIsFieldsObj(dataSet);
    }
    setValue(target.name, target.value);
  };
  const onAddressChange = (e) => {
    const target = e.target;
    const dataSet = {
      ...isFieldsObj,
      [target.name]: target?.value,
    };
    setIsFieldsObj(dataSet);
    setValue(target.name, target.value);
  };
  const labelSelect = (item) => {
    const dataSet = {
      ...isFieldsObj,
      label: item?.item,
      label_id: item?.item?.id,
    };
    setIsFieldsObj(dataSet);
    setValue('label', item?.item);
  };
  const handleSetData = (data) => {
    const dataSet = {
      ...isFieldsObj,
      ...data,
    };
    setIsFieldsObj(dataSet);
  };
  useEffect(() => {
    if (data !== {}) {
      handleSetData(data);
    }
  }, [data]);
  const handleUpdate = async () => {
    setLoading(true);
    const updateFields = removeCustomFieldsFromActivityForm(
      isFieldsObj,
      customDataFields
    );
    delete updateFields?.fields;
    try {
      await organizationService.updateOrganization(data.id, updateFields);
      setSuccessMessage(
        constants.profileForm.updated.replace(
          /Company/g,
          moduleMap.organization.singular
        )
      );
      await Promise.all(
        customDataFields?.map(async (item) => {
          if (item.value === '$' || item.value === '') {
            await organizationService.deleteCustomField(data.id, item.field_id);
          } else {
            await new Promise((resolve) => {
              organizationService
                .updateCustomField(data.id, item)
                .then(resolve);
            });
          }
        })
      );
      setEditMode(VIEW_CARD);
      getProfileInfo();
      setLoading(false);
    } catch (error) {
      setErrorMessage(
        constants.profileForm.updateError.replace(
          /Company/g,
          moduleMap.organization.singular
        )
      );
    } finally {
      setCustomDataFields([]);
      setIsFieldsObj({});
      setLoading(false);
    }
  };
  const loader = () => {
    if (isLoading) return <Loading />;
  };
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
          setValue(fieldName, isFieldsObj[fieldName]);
        });
      }
    }
  }, [fields]);
  const clearState = (name) => {
    setIsFieldsObj({ ...isFieldsObj, [name]: '' });
    setValue(name, '');
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
    setIsFieldsObj({ ...isFieldsObj, [target.name]: target.value });
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
    setIsFieldsObj({ ...isFieldsObj, [target.name]: target.checked });

    const isDuplicate = customDataFields.some((field) => field.field_id === id);

    if (!isDuplicate) {
      setCustomDataFields([
        ...customDataFields,
        { field_id: id, value: target.checked },
      ]);
    }
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
    setIsFieldsObj({ ...isFieldsObj, [fieldName]: new Date(date) });
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
    setIsFieldsObj({
      ...isFieldsObj,
      [fieldName]: picked,
    });
    setValue(fieldName, picked);
  };

  const selectPicklistValue = (fieldName, value_option, id) => {
    if (isFieldsObj[fieldName] === '') {
      return '-None-';
    }
    if (
      isFieldsObj[fieldName] &&
      isFieldsObj[fieldName][0] &&
      typeof isFieldsObj[fieldName][0].value === 'string'
    ) {
      return isFieldsObj[fieldName][0].value;
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (
      defaultItem &&
      defaultItem.value &&
      !editMode &&
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
    setIsFieldsObj({
      ...isFieldsObj,
      [fieldName]: picked,
    });
    setValue(fieldName, picked);
  };
  const selectPicklistMultiValue = (fieldName, value_option, id) => {
    if (isFieldsObj[fieldName] === '') {
      return [];
    }
    if (isFieldsObj[fieldName]) {
      return isFieldsObj[fieldName];
    }

    const defaultItem = value_option.find(
      (item) => item.default === true && item.value !== '-None-'
    );

    if (
      defaultItem &&
      defaultItem.value &&
      !editMode &&
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

  const handlePicklistDefault = (dataField, fieldName) => {
    organizationObj = {
      ...organizationObj,
      ...isFieldsObj,
      [fieldName]: dataField.value,
    };
    setIsFieldsObj(organizationObj);
    picklistInitialValue.push({ key: dataField.key, value: dataField.value });
    picklistDefault.push(dataField);
    setCustomDataFields([...customDataFields, ...picklistDefault]);
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
      {isLoading ? (
        loader()
      ) : (
        <>
          <CardBody
            className={editMode ? '' : 'right-bar-vh h-100 overflow-y-auto'}
          >
            <Form
              onSubmit={
                editMode
                  ? handleSubmit(handleUpdate)
                  : handleSubmit(onHandleSubmit)
              }
            >
              {Object.keys(fields).map((key, index) => {
                return (
                  <div key={`fields-${index}`}>
                    <h5 className="pb-0">
                      {moduleMap.organization &&
                        key
                          .replace(/Company/g, moduleMap.organization.singular)
                          .replace(/Companies/g, moduleMap.organization.plural)}
                    </h5>
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
                            {columnName !== 'address_city' &&
                              columnName !== 'label_id' &&
                              columnName !== 'address_street' &&
                              columnName !== 'address_state' &&
                              columnName !== 'address_country' &&
                              field_type !== 'CHECKBOX' &&
                              field_type !== 'PHONE' &&
                              field_type !== 'CURRENCY' &&
                              field_type !== 'DATE' &&
                              field_type !== 'TIME' &&
                              field_type !== 'PICKLIST' &&
                              field_type !== 'PICKLIST_MULTI' && (
                                <>
                                  {renderComponent(item?.field_type, {
                                    id: fieldName,
                                    value: isFieldsObj,
                                    label: item?.key,
                                    name: fieldName,
                                    placeholder: item?.key,
                                    className: 'text-capitalize',
                                    inputClass: mandatory
                                      ? 'border-left-4 border-left-danger'
                                      : '',
                                    validationConfig: {
                                      required: mandatory,
                                      inline: false,
                                      onChange: (e) =>
                                        isCustom
                                          ? onHandleCustomField(
                                              e,
                                              id,
                                              value_type
                                            )
                                          : onChange(e),
                                      pattern:
                                        field_type === 'EMAIL'
                                          ? {
                                              value: emailRegex,
                                              message:
                                                'Please enter a valid email.',
                                            }
                                          : field_type === 'URL'
                                          ? {
                                              value: urlRegex,
                                              message:
                                                'Please enter a valid URL',
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
                                      item?.field_type === 'TEXT'
                                        ? 'textarea'
                                        : 'input',
                                  })}
                                </>
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
                                    checked={isFieldsObj[fieldName]}
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
                                    value={isFieldsObj}
                                    name={item?.columnName}
                                    maxLength={14}
                                    onChange={(e) => onChange(e)}
                                    autocomplete="off"
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {field_type === 'DATE' && (
                              <FormGroup
                                row
                                className="py-1 align-items-center"
                              >
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <div className="date-picker input-time w-100">
                                    <ControllerValidation
                                      name={fieldName}
                                      errors={errors}
                                      form={isFieldsObj}
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
                                          value={isFieldsObj[fieldName]}
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
                            {field_type === 'TIME' && (
                              <FormGroup
                                row
                                className="py-1 align-items-center"
                              >
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <div className="date-picker input-time w-100">
                                    <TimePickerComponent
                                      id={`start-time`}
                                      cssClass="e-custom-style"
                                      openOnFocus={true}
                                      value={
                                        isFieldsObj?.start_time || '12:00 PM'
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
                                value={isFieldsObj}
                              />
                            )}
                            {item.columnName === 'address_city' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm fw-normal"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    selected={isFieldsObj?.address_city}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    clearState={(e) => clearState(e)}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'address_street' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm fw-normal"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    selected={isFieldsObj?.address_street}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    clearState={(e) => clearState(e)}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    name={fieldName}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'address_country' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm fw-normal"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    selected={isFieldsObj?.address_country}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    clearState={(e) => clearState(e)}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {field_type === 'PICKLIST' && (
                              <FormGroup
                                row
                                className="py-1 align-items-center"
                              >
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <div className="date-picker input-time w-100">
                                    <ControllerValidation
                                      name={fieldName}
                                      errors={errors}
                                      form={isFieldsObj}
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
                              <FormGroup
                                row
                                className="py-1 align-items-center"
                              >
                                <Label
                                  md={3}
                                  className="text-right font-size-sm"
                                >
                                  {key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <div className="date-picker input-time w-100">
                                    <ControllerValidation
                                      name={fieldName}
                                      errors={errors}
                                      form={isFieldsObj}
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
                            {item.columnName === 'address_state' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm fw-normal"
                                >
                                  {item?.key}
                                </Label>
                                <Col md={9} className="pl-0">
                                  <IdfSearchDirections
                                    fromNavBar
                                    selected={isFieldsObj?.address_state}
                                    onChange={onAddressChange}
                                    isFieldsObj={isFieldsObj}
                                    setIsFieldsObj={setIsFieldsObj}
                                    placeholder={item?.key}
                                    clearState={(e) => clearState(e)}
                                    name={fieldName}
                                    validationConfig={{
                                      required: item?.mandatory
                                        ? `${item?.key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    {...props}
                                  />
                                </Col>
                              </FormGroup>
                            )}
                            {item.columnName === 'label_id' && (
                              <FormGroup row className="py-1">
                                <Label
                                  md={3}
                                  className="text-right font-size-sm fw-normal"
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
                                    form={isFieldsObj}
                                    errorDisplay="mb-0"
                                    control={control}
                                    renderer={({ field }) => (
                                      <IdfSelectLabel
                                        fromNavBar
                                        value={isFieldsObj?.label}
                                        onChange={(label) => labelSelect(label)}
                                        name={fieldName}
                                        type={labelType}
                                        validationConfig={{
                                          required: item?.mandatory
                                            ? `${item?.key} is required.`
                                            : '',
                                        }}
                                        fieldState={getFieldState(fieldName)}
                                        placeholder={item?.key}
                                        {...props}
                                      />
                                    )}
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
          <CardFooter className="bg-gray-5">
            <div className="d-flex gap-2 justify-content-end align-items-center">
              {editMode ? (
                <button
                  type="button"
                  className="btn btn-white btn-sm mr-2"
                  onClick={() => {
                    setIsFieldsObj({});
                    setCustomDataFields([]);
                    setEditMode(VIEW_CARD);
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-white"
                  data-dismiss="modal"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}

              <ButtonIcon
                type="button"
                onClick={
                  editMode
                    ? handleSubmit(handleUpdate)
                    : handleSubmit(onHandleSubmit)
                }
                classnames="btn-sm"
                label={editMode ? 'Update' : 'Save'}
                loading={loading}
                color="primary"
              />
            </div>
          </CardFooter>
        </>
      )}
    </>
  );
};

export default OrganizationForm;
