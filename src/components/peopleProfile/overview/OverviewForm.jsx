import React, { useState, useEffect } from 'react';

import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import {
  DATE_FORMAT_EJS,
  DATE_FORMAT_EJS_UPDATED,
  emailRegex,
  formatHHMMSS,
  urlRegex,
} from '../../../utils/Utils';
import contactService from '../../../services/contact.service';
import stringConstants from '../../../utils/stringConstants.json';
import { renderComponent, VIEW_CARD } from '../../peoples/constantsPeople';
import AutoComplete from '../../AutoComplete';
import {
  SEARCH_FOR_COMPANY,
  SEARCH_FOR_INSIGHT,
} from '../../../utils/constants';
import organizationService from '../../../services/organization.service';
import {
  onInputSearch,
  removeCustomFieldsFromActivityForm,
} from '../../../views/Deals/contacts/utils';
import IdfSelectLabel from '../../idfComponents/idfDropdown/IdfSelectLabel';
import { CardBody, CardFooter, Col, Form, FormGroup, Label } from 'reactstrap';
import ButtonIcon from '../../commons/ButtonIcon';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../../commons/ControllerValidation';
import IdfFormInput from '../../idfComponents/idfFormInput/IdfFormInput';
import { CheckboxInput } from '../../layouts/CardLayout';
import { PricingField } from '../../PricingFieldComponent';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import ReactDatepicker from '../../inputs/ReactDatpicker';
import moment from 'moment';
import useIsTenant from '../../../hooks/useIsTenant';
import DropdownSelect from '../../DropdownSelect';
import AddPicklistOptions from '../contentFeed/AddPicklistOptions';

const OverviewForm = ({
  overviewData,
  setEditMode,
  getProfileInfo,
  isFieldsData,
  fieldData,
  breakLoop,
  moduleMap,
  labelType,
  ...props
}) => {
  const constants = stringConstants.deals.contacts.profile;
  const [errorMessage, setErrorMessage] = useState('');
  const [formValue, setFormValue] = useState(overviewData);
  const [loading, setLoading] = useState(false);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [searchOrg, setSearchOrg] = useState({
    search: '',
  });
  const [customFieldData, setCustomFieldData] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: formValue,
  });
  useEffect(() => {
    if (Object.keys(overviewData)) {
      setFormValue(overviewData);
    }
  }, [overviewData]);
  const [loadingOrg, setLoadingOrg] = useState(false);
  async function onGetOrganzations() {
    setLoadingOrg(true);
    const response = await organizationService
      .getOrganizations(searchOrg, { limit: 10 })
      .catch((err) => err);

    setLoadingOrg(false);

    const { organizations } = response?.data;
    setAllOrganizations(organizations.filter((o) => !!o.name));
  }
  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg]);
  useEffect(() => {
    setFormValue({ ...overviewData, ...formValue });
  }, [overviewData, isFieldsData]);

  const onHandleSubmit = async () => {
    setLoading(true);
    const updateFields = removeCustomFieldsFromActivityForm(
      formValue,
      customFieldData
    );
    delete updateFields.fields;
    try {
      const promises = [
        contactService.updateContact(overviewData.id, {
          ...updateFields,
        }),
      ];
      await Promise.all(
        promises,
        customFieldData?.map(async (item) => {
          if (item.value === '$' || item.value === '') {
            await contactService.deleteCustomField(
              overviewData.id,
              item.field_id
            );
          } else {
            await new Promise((resolve) => {
              contactService
                .updateCustomField(overviewData?.id, item)
                .then(resolve);
            });
          }
        })
      );
      setEditMode(VIEW_CARD);
      getProfileInfo(
        constants.contactUpdated.replace(/Contact/g, moduleMap.contact.singular)
      );
      reset(formValue);
    } catch (error) {
      setErrorMessage(constants.errorContactUpdated).replace(
        /contact/g,
        moduleMap.contact.singular
      );
    }
    setLoading(false);
  };
  const handleChange = (e) => {
    const target = e.target;
    const overViewFormData = {
      ...formValue,
      [target.name]: target.value,
    };
    setFormValue(overViewFormData);
  };
  const handleOrganizationSelected = (item) => {
    const selectOrg = {
      ...formValue,
      organization_id: item?.id,
    };
    setFormValue(selectOrg);
  };
  const handleOrganizationCreating = (item) => {
    const selectOrg = {
      ...formValue,
      contact_organization_new: item?.organization_id,
    };
    setFormValue(selectOrg);
  };
  useEffect(() => {
    const groups = Object.keys(isFieldsData);
    if (groups.length) {
      for (const grp of groups) {
        const fields = isFieldsData[grp];
        fields.forEach((field) => {
          const { columnName, key } = field;
          const fieldName = columnName
            ? columnName.toLowerCase()
            : key?.toLowerCase().replace(/\s+/g, '');
          setValue(fieldName, formValue[fieldName]);
        });
      }
    }
  }, [isFieldsData]);
  const clearState = (name) => {
    if (name === 'organization_id') {
      setValue('organization_id', '');
      const data = {
        ...formValue,
        organization: {},
        organization_id: '',
      };
      setFormValue(data);
    }
  };
  const onHandleCustomDate = (date, id, fieldName) => {
    if (date === '') {
      setCustomFieldData([...customFieldData, { field_id: id, value: '' }]);
    } else {
      setCustomFieldData([
        ...customFieldData,
        { field_id: id, value: new Date(date) },
      ]);
    }
    const contactData = {
      ...formValue,
      [fieldName]: new Date(date),
    };
    setFormValue(contactData);
  };
  const onHandleCustomField = (e, id, value_type, field_type) => {
    const target = e.target;
    let value = '';
    if (field_type === 'CURRENCY') {
      value = parseInt(target.value);
    }
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
    const contactData = {
      ...formValue,
      [target.name]: target.value,
    };
    setFormValue(contactData);
    const fieldData = customFieldData.map((item) => {
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
      setCustomFieldData(fieldData);
    } else {
      setCustomFieldData([...fieldData, { field_id: id, value }]);
    }
  };

  const onHandleCustomCheckBox = (e, id) => {
    const target = e.target;
    setCustomFieldData([
      ...customFieldData,
      { field_id: id, value: target.checked },
    ]);
    const contactData = {
      ...formValue,
      [target.name]: target.checked,
    };
    setFormValue(contactData);
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
    setFormValue({
      ...formValue,
      [fieldName]: picked,
    });
    setValue(fieldName, picked);
  };

  const selectPicklistValue = (fieldName, value_option, id) => {
    if (formValue[fieldName] === '') {
      return '-None-';
    }
    if (
      formValue[fieldName] &&
      formValue[fieldName][0] &&
      typeof formValue[fieldName][0].value === 'string'
    ) {
      return formValue[fieldName][0].value;
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
    setFormValue({
      ...formValue,
      [fieldName]: picked,
    });
    setValue(fieldName, picked);
  };
  const selectPicklistMultiValue = (fieldName, value_option, id) => {
    if (formValue[fieldName] === '') {
      return [];
    }
    if (formValue[fieldName]) {
      return formValue[fieldName];
    }

    return [];
  };

  return (
    <>
      <CardBody>
        {Object.keys(isFieldsData).map((NameKey, index) => {
          return (
            <div key={`fields-${index}`}>
              <AlertWrapper>
                <Alert
                  message={errorMessage}
                  setMessage={setErrorMessage}
                  color="danger"
                />
              </AlertWrapper>
              <Form onSubmit={handleSubmit(onHandleSubmit)}>
                <h5 className="pb-0">
                  {NameKey.replace(/Contact/g, moduleMap.contact.singular)}
                </h5>
                {isFieldsData[NameKey]?.length > 0 &&
                  isFieldsData[NameKey]?.slice(0, breakLoop).map((field) => {
                    const {
                      field_type,
                      columnName,
                      key,
                      mandatory,
                      isCustom,
                      id,
                      value_type,
                      value_option,
                    } = field;
                    const fieldName =
                      field?.columnName ||
                      field?.key?.toLowerCase().replace(/\s+/g, '');
                    return (
                      <>
                        {key !== 'Company' &&
                          key !== 'Label' &&
                          field_type !== 'PHONE' &&
                          field_type !== 'CHECKBOX' &&
                          field_type !== 'CURRENCY' &&
                          field_type !== 'DATE' &&
                          field_type !== 'TIME' &&
                          field_type !== 'PICKLIST' &&
                          field_type !== 'PICKLIST_MULTI' &&
                          renderComponent(field_type, {
                            value: formValue,
                            name: fieldName,
                            label: key,
                            className: 'text-capitalize',
                            inputClass: mandatory
                              ? 'border-left-4 border-left-danger'
                              : '',
                            validationConfig: {
                              required: mandatory,
                              inline: false,
                              onChange: (e, date) =>
                                isCustom
                                  ? field_type === 'DATE'
                                    ? onHandleCustomDate(date, id, fieldName)
                                    : onHandleCustomField(
                                        e,
                                        id,
                                        value_type,
                                        field_type
                                      )
                                  : handleChange(e),
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
                            key: columnName,
                            placeholder: key,
                          })}
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
                                  form={formValue}
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
                                      value={formValue[fieldName]}
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
                                  value={formValue?.start_time || '12:00 PM'}
                                  format="hh:mm a"
                                  placeholder="Start Time"
                                  onChange={(date) =>
                                    onHandleCustomDate(
                                      date,
                                      id,
                                      fieldName,
                                      field_type
                                    )
                                  }
                                />
                              </div>
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Company' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key.replace(
                                /Company/g,
                                moduleMap.organization.singular
                              )}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
                                renderer={({ field }) => (
                                  <AutoComplete
                                    id="organization_id"
                                    placeholder={
                                      useIsTenant().isSynovusBank
                                        ? SEARCH_FOR_INSIGHT
                                        : SEARCH_FOR_COMPANY
                                    }
                                    name="organization_id"
                                    loading={loadingOrg}
                                    type="comapny"
                                    clearState={(name) => clearState(name)}
                                    onChange={(e) =>
                                      onInputSearch(e, searchOrg, setSearchOrg)
                                    }
                                    data={allOrganizations}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    selected={formValue?.organization?.name}
                                    onHandleSelect={(item) =>
                                      handleOrganizationSelected(item)
                                    }
                                    customKey="name"
                                    extraTitles={[
                                      'address_city',
                                      'address_state',
                                    ]}
                                    search={searchOrg.search}
                                    createItem={(data) =>
                                      handleOrganizationCreating(data)
                                    }
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {key === 'Label' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
                                renderer={({ field }) => (
                                  <IdfSelectLabel
                                    fromNavBar
                                    value={formValue?.label}
                                    onChange={handleChange}
                                    name="label_id"
                                    type={labelType}
                                    validationConfig={{
                                      required: mandatory
                                        ? `${key} is required.`
                                        : '',
                                    }}
                                    fieldState={getFieldState(fieldName)}
                                    placeholder={field?.key}
                                    {...props}
                                    required={field?.mandatory}
                                  />
                                )}
                              />
                            </Col>
                          </FormGroup>
                        )}
                        {field_type === 'PICKLIST' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
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
                            </Col>
                          </FormGroup>
                        )}
                        {field_type === 'PICKLIST_MULTI' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <ControllerValidation
                                name={fieldName}
                                validationConfig={{
                                  required: mandatory
                                    ? `${key} is required.`
                                    : '',
                                }}
                                errors={errors}
                                form={formValue}
                                errorDisplay="mb-0"
                                control={control}
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
                            </Col>
                          </FormGroup>
                        )}
                        {field_type === 'PHONE' && (
                          <FormGroup row className="py-1">
                            <Label md={3} className="text-right font-size-sm">
                              {key}
                            </Label>
                            <Col md={9} className="pl-0">
                              <IdfFormInput
                                className="mb-0 w-100"
                                placeholder={key}
                                value={formValue}
                                name={columnName}
                                maxLength={14}
                                onChange={handleChange}
                                autocomplete="off"
                              />
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
                                : handleChange(e)
                            }
                            validationConfig={{
                              required: mandatory,
                              inline: false,
                            }}
                            value={formValue}
                          />
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
                                  }
                                }}
                                label={key}
                                name={fieldName}
                                checked={formValue[fieldName]}
                              />
                            </Col>
                          </FormGroup>
                        )}
                      </>
                    );
                  })}
              </Form>
            </div>
          );
        })}
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={() => {
              setEditMode(VIEW_CARD);
            }}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            classnames="btn-sm"
            label={'Save'}
            loading={loading}
            color="primary"
            onClick={handleSubmit(onHandleSubmit)}
          />
        </div>
      </CardFooter>
    </>
  );
};

export default OverviewForm;
