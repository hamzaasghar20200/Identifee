import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { CardBody, CardFooter, Form, FormGroup, Label } from 'reactstrap';
import { toString } from 'lodash';
import organizationService from '../../services/organization.service';
import contactService from '../../services/contact.service';
import {
  SEARCH_FOR_CONTACT,
  SEARCH_FOR_COMPANY,
  OWNER,
  PIPELINE,
  SEARCH_FOR_INSIGHT,
} from '../../utils/constants';
import {
  onGetOwners,
  onInputChangeAmount,
  onInputSearch,
} from '../../views/Deals/contacts/utils';
import DropdownSelect from '../DropdownSelect';
import productService from '../../services/product.service';
import {
  DATE_FORMAT,
  DATE_FORMAT_EJS,
  RIGHT_PANEL_WIDTH,
  emailRegex,
  formatHHMMSS,
  urlRegex,
  valueNumberValidator,
} from '../../utils/Utils';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatepicker from '../inputs/ReactDatpicker';
import AutoComplete from '../AutoComplete';
import ButtonIcon from '../commons/ButtonIcon';
import { renderComponent } from '../peoples/constantsPeople';
import { CheckboxInput } from '../layouts/CardLayout';
import Loading from '../Loading';
import ControllerValidation from '../commons/ControllerValidation';
import DealProductsV2 from '../../views/Deals/pipelines/DealProductsV2';
import userService from '../../services/user.service';
import moment from 'moment';
import IdfFormInput from '../idfComponents/idfFormInput/IdfFormInput';
import { TimePickerComponent } from '@syncfusion/ej2-react-calendars';
import { PricingField } from '../PricingFieldComponent';
import useIsTenant from '../../hooks/useIsTenant';
import AddPicklistOptions from '../peopleProfile/contentFeed/AddPicklistOptions';
import stringConstants from '../../utils/stringConstants.json';
const constants = stringConstants.deals.organizations.profile;

const maxPrice = 99999999.0;

const DealForm = ({
  moduleData,
  moduleMap,
  dispatch,
  dealFormData,
  profileInfo,
  searchValue,
  toggleModalSize,
  customDataFields,
  setCustomDataFields,
  initialDeals = {},
  selectedStage,
  handleSubmit,
  setValue,
  errors,
  loading,
  getFieldState,
  isLoading,
  register,
  control,
  onClose,
  selectOrganization,
  setSelectOrganization,
  selectContactPerson,
  setSelectContactPerson,
  fields,
  pipelines,
  pipeline,
  selectedPipeline,
  setSearchOrg,
  setSearchContact,
  setSelectedPipeline,
  pipelineStages,
  setPipelineStages,
  searchOrg,
  searchContact,
  selectTitle,
  setSelectTitle,
  fromNavbar,
  getOrganizationId,
  setOrganizationsId,
  getContactId,
  contactProfile,
  setContactId,
  setContainerWidth,
  picklistDefault = [],
  initialLoad = {},
  getPipelineStages,
  selectedOrg,
  setSelectedOrg,
  ...props
}) => {
  const picklistInitialValue = [];
  const [, setData] = useState([]);
  const [allOrganizations, setAllOrganizations] = useState([]);
  const [allContacts, setAllContact] = useState([]);
  // const [closingDate, setClosingDate] = useState(new Date());
  const [selectOwner, setSelectOwner] = useState('');
  const [charactersRequire, setCharactersRequire] = useState('');
  const [charactersContact, setCharactersContact] = useState('');
  const [, setProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [getDealProducts, setGetDealProducts] = useState([]);
  const [productsTotalAmount, setProductsTotalAmount] = useState(0);
  const [addProductsClicked, setAddProductsClicked] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);

  const handleClose = () => {
    setAllOrganizations([]);
    setAllContact([]);
    setSelectOwner('');
    setGetDealProducts([]);
    setCharactersRequire('');
    setDealProducts([]);
    setProductsTotalAmount(0);
    const dealsReset = {
      name: '',
      currency: 'USD',
      tenant_deal_stage_id: '',
      contact_organization_id: '',
      date_closed: '',
      assigned_user_id: '',
    };
    dispatch(dealsReset);
    onClose();
  };
  const getProductsList = async () => {
    const resp = await productService
      .getProducts(null, { limit: 10 })
      .catch((err) => console.log(err));
    setProducts(resp?.data?.products);
  };

  async function onGetOrganzations() {
    if (searchOrg?.search) {
      setLoadingOrg(true);
      const response = await organizationService
        .getOrganizations(searchOrg, { limit: 10 })
        .catch((err) => err);

      setLoadingOrg(false);
      const { organizations } = response?.data;
      setAllOrganizations(organizations?.filter((o) => !!o.name));
    }
  }

  async function onGetContacts() {
    if (searchContact?.search) {
      setLoadingContact(true);
      const response = await contactService
        .getContact(searchContact, { limit: 10 })
        .catch((err) => err);

      setLoadingContact(false);
      const { contacts } = response?.data;
      setAllContact(
        contacts?.map((c) => ({ ...c, name: `${c.first_name} ${c.last_name}` }))
      );
    }
  }

  useEffect(() => {
    getProductsList();
    setDealProducts([
      {
        description: {},
        price: 0,
        quantity: 1,
      },
    ]);
  }, []);
  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));
    setSelectOwner(user);
    return user;
  };
  const getTotal = (items) => {
    return [...items].reduce((total, b) => total + b.quantity * b.price, 0);
  };
  useEffect(() => {
    (async () => {
      const me = await getCurrentUser().catch((err) => console.log(err));
      dispatch({
        ...dealFormData,
        assigned_user_id: me?.id,
        currency: 'USD',
        contact_organization_id:
          profileInfo?.id || contactProfile?.organization?.id,
        contact_person_id: contactProfile?.id,
        date_closed: new Date(),
        lead_source: PIPELINE.toLowerCase(),
        amount: '',
      });
      setValue('currency', dealFormData?.currency);
      setValue(
        'contact_organization_id',
        profileInfo?.id || contactProfile?.organization?.id
      );
      setValue('contact_person_id', contactProfile?.id);
      getOrganizationContacts();
    })();
  }, [fields]);
  useEffect(() => {
    (async () => {
      dispatch({
        ...dealFormData,
        products: getDealProducts.map((p) => ({
          product_id: p?.product?.id,
          quantity: parseFloat(p.quantity),
          price: parseFloat(p.price),
        })),
        amount: valueNumberValidator(
          getTotal(getDealProducts).toString(),
          2,
          maxPrice
        ),
      });
    })();
  }, [getDealProducts]);
  useEffect(() => {
    const newDealProducts = dealProducts?.map((product) => ({
      id: product.id,
      product_id: product.description.id,
      quantity: parseFloat(product.quantity),
      price: parseFloat(product.price),
    }));

    dispatch({
      ...dealFormData,
      products: newDealProducts,
    });

    dispatch({
      ...dealFormData,
      amount: valueNumberValidator(toString(productsTotalAmount), 2, maxPrice),
    });
  }, [productsTotalAmount]);

  useEffect(() => {
    onGetOwners(null, setData);
  }, []);

  useEffect(() => {
    onGetOrganzations();
  }, [searchOrg]);

  useEffect(() => {
    (async () => {
      if (!dealFormData?.contact_organization_id) {
        return await onGetContacts();
      }
      await getOrganizationContacts();
    })();
  }, [searchContact, dealFormData?.contact_organization_id]);

  useEffect(() => {
    if (dealFormData?.contact_organization_id) {
      getOrganizationContacts();
    }
  }, [dealFormData?.contact_organization_id]);

  const getOrganizationContacts = async () => {
    if (dealFormData?.contact_organization_id) {
      const organizationContacts = await contactService
        .getContactsByorganizationId(
          {
            organizationId: dealFormData.contact_organization_id,
            ...searchContact,
          },
          {
            page: 1,
            limit: 10,
          }
        )
        .catch((err) => {
          console.log(err);
        });

      const { contacts } = organizationContacts || {};
      setAllContact(
        contacts?.map((c) => ({ ...c, name: `${c.first_name} ${c.last_name}` }))
      );
    }
  };
  const amountHandler = (e) => {
    let value = e.target.value <= 0 ? '' : e.target.value;

    value = valueNumberValidator(value, 2, maxPrice);

    e.target.value = value;
    onInputChangeAmount(e, dispatch, dealFormData);
  };

  const onChangeClosingDate = (date) => {
    dispatch({
      ...dealFormData,
      date_closed: new Date(date),
    });
  };

  const toggleAddProducts = (e) => {
    e?.preventDefault();
    if (addProductsClicked) {
      setProductsTotalAmount(0);
      setDealProducts([
        {
          description: {},
          price: 0,
          quantity: 1,
        },
      ]);
    }
    setContainerWidth(addProductsClicked ? RIGHT_PANEL_WIDTH : 840);
    setAddProductsClicked(!addProductsClicked);
    // toggleModalSize(!addProductsClicked);
  };

  const handlePipelineStageSelect = (item) => {
    setSelectTitle(item?.name);
    dispatch({
      ...dealFormData,
      tenant_deal_stage_id: item?.id,
    });
    setValue('tenant_deal_stage_id', item?.id);
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
  const handlePipelineSelect = (item) => {
    setSelectedPipeline(item);
    setSelectTitle('');
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
    dispatch({ ...dealFormData, [fieldName]: dataField.value });
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

  useEffect(() => {
    if (selectedPipeline?.id) {
      getPipelineStages();
    }
  }, [selectedPipeline]);
  const onChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      ...dealFormData,
      [name]: value,
    });
  };
  const loader = () => {
    if (isLoading) return <Loading />;
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
  const handleContactChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);

    if (match && match.length >= 2) {
      setCharactersContact('');
      onInputSearch(e, searchContact, setSearchContact);
    } else {
      return setCharactersContact(match?.length);
    }
  };
  const createOrganization = async () => {
    const organization = {
      name: getOrganizationId,
      assigned_user_id: selectOwner?.id,
    };
    const { data } = await organizationService.createOrganization(organization);
    setValue('contact_organization_id', data?.id);
    dispatch({
      ...dealFormData,
      contact_organization_id: data?.id,
    });
  };
  const createNewUser = async () => {
    const user = {
      first_name: getContactId,
      last_name: '',
      assigned_user_id: selectOwner?.id,
      organization_id: dealFormData?.contact_organization_id,
    };
    const { data } = await contactService.createContact(user);
    dispatch({
      ...dealFormData,
      contact_person_id: data?.id,
    });
  };
  useEffect(() => {
    if (getOrganizationId) {
      createOrganization();
    }
  }, [getOrganizationId]);
  useEffect(() => {
    if (getContactId) {
      createNewUser();
    }
  }, [getContactId]);
  const clearState = (name) => {
    if (name === 'contact_organization_id') {
      setValue('contact_organization_id', '');
      dispatch({
        ...dealFormData,
        contact_organization_id: '',
      });
      setSelectOrganization('');
    } else if (name === 'contact_person_id') {
      setValue('contact_person_id', '');
      dispatch({
        ...dealFormData,
        contact_person_id: '',
      });
      setSelectContactPerson('');
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <>
      {isLoading ? (
        loader()
      ) : (
        <>
          <CardBody className="right-bar-vh h-100 overflow-y-auto">
            <Form onSubmit={handleSubmit}>
              {Object.keys(fields).map((key, index) => {
                return (
                  <div key={`fields-${index}`}>
                    <h5 className="pb-0">
                      {key.replace(/Deal/g, capitalizeFirstLetter(moduleMap))}
                    </h5>
                    <div>
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
                            columnName ||
                            key?.toLowerCase().replace(/\s+/g, '');

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
                                    label: key.replace(
                                      /Deal/,
                                      moduleData.deal.singular
                                    ),
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
                                          : fieldName === 'amount'
                                          ? amountHandler(e)
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
                                      field_type === 'TEXT'
                                        ? 'textarea'
                                        : 'input',
                                    disabled:
                                      field_type === 'NUMBER' &&
                                      fieldName === 'amount'
                                        ? addProductsClicked === true
                                        : '',
                                    name: fieldName,
                                    placeholder:
                                      field_type === 'NUMBER'
                                        ? '0'
                                        : key.replace(
                                            /Deal/,
                                            moduleData.deal.singular
                                          ),
                                  })}
                                </div>
                              ) : (
                                ''
                              )}
                              {field_type === 'PHONE' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm fw-normal"
                                  >
                                    {key}
                                  </Label>
                                  <Col md={9} className="pl-0">
                                    <IdfFormInput
                                      className="mb-0 w-100"
                                      placeholder={key}
                                      value={dealFormData}
                                      name={item?.columnName}
                                      maxLength={14}
                                      onChange={(e) => onChange(e)}
                                      autocomplete="off"
                                    />
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
                                          dealFormData[fieldName] || '12:00 PM'
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
                                  value={dealFormData}
                                />
                              )}
                              {field_type === 'PICKLIST' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
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
                                      form={dealFormData}
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
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
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
                                      form={dealFormData}
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
                                  </Col>
                                </FormGroup>
                              )}
                              {field_type === 'CHECKBOX' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  ></Label>
                                  <Col md={9} className="pl-0">
                                    <ControllerValidation
                                      name={fieldName}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key} is required.`
                                          : '',
                                      }}
                                      errors={errors}
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <CheckboxInput
                                          id={fieldName}
                                          onChange={(e) =>
                                            isCustom
                                              ? onHandleCustomCheckBox(e, id)
                                              : onChange(e)
                                          }
                                          label={key}
                                          name={fieldName}
                                          validationConfig={{
                                            required: mandatory
                                              ? `${key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          checked={dealFormData[fieldName]}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {key === 'Company' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
                                    {key.replace(
                                      /Company/,
                                      moduleData.organization.singular
                                    )}
                                  </Label>
                                  <Col md={9} className="pl-0">
                                    <ControllerValidation
                                      name={fieldName}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key.replace(
                                              /Company/,
                                              moduleData.organization.singular
                                            )} is required.`
                                          : '',
                                      }}
                                      errors={errors}
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <AutoComplete
                                          id="contact_organization_id"
                                          placeholder={
                                            useIsTenant().isSynovusBank
                                              ? SEARCH_FOR_INSIGHT
                                              : SEARCH_FOR_COMPANY.replace(
                                                  /Company/,
                                                  moduleData.organization
                                                    .singular
                                                )
                                          }
                                          name="contact_organization_id"
                                          onChange={(e) => stateChange(e)}
                                          charactersRequire={charactersRequire}
                                          data={allOrganizations}
                                          clearState={(e) => clearState(e)}
                                          loading={loadingOrg}
                                          type={
                                            moduleData.organization.singular
                                          }
                                          onHandleSelect={(item) => {
                                            dispatch({
                                              ...dealFormData,
                                              contact_organization_id: item?.id,
                                            });

                                            setSelectOrganization(item);
                                            setValue(
                                              'contact_organization_id',
                                              item?.id
                                            );
                                          }}
                                          validationConfig={{
                                            required: mandatory
                                              ? `${key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          customKey="name"
                                          selected={selectedOrg.orgName}
                                          search={searchOrg.search}
                                          createItem={(data) => {
                                            setOrganizationsId(data);
                                          }}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {key === 'Pipeline & Stage' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
                                    {key.replace(
                                      /Pipeline/g,
                                      moduleData.deal.singular
                                    )}
                                  </Label>
                                  <Col md={9} className="pl-0">
                                    <ControllerValidation
                                      name={fieldName}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key.replace(
                                              /Pipeline/g,
                                              moduleData.deal.singular
                                            )} is required.`
                                          : '',
                                      }}
                                      errors={errors}
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <Row>
                                          <FormGroup className="col w-50">
                                            <DropdownSelect
                                              data={pipelines}
                                              customTitle="name"
                                              name={fieldName}
                                              hideIcon={true}
                                              allOption={false}
                                              validationConfig={{
                                                required: mandatory
                                                  ? `${key.replace(
                                                      /Pipeline/g,
                                                      moduleData.deal.singular
                                                    )} is required.`
                                                  : '',
                                              }}
                                              fieldState={getFieldState(
                                                fieldName
                                              )}
                                              customClasses="w-100"
                                              placeholder={`Select ${moduleData.deal.singular}`}
                                              toggleButtonClasses="rounded-right-0"
                                              onHandleSelect={(item) =>
                                                handlePipelineSelect(item)
                                              }
                                              select={
                                                selectedPipeline?.name ||
                                                pipeline?.name
                                              }
                                            />
                                          </FormGroup>
                                          <FormGroup className="col w-50 pl-0">
                                            <DropdownSelect
                                              data={pipelineStages}
                                              customTitle="title"
                                              hideIcon={true}
                                              validationConfig={{
                                                required: mandatory
                                                  ? `${key} is required.`
                                                  : '',
                                              }}
                                              fieldState={getFieldState(
                                                'stage'
                                              )}
                                              allOption={false}
                                              customClasses="w-100"
                                              toggleButtonClasses="rounded-left-0"
                                              placeholder={`Select ${moduleData.deal.singular}  Stage`}
                                              onHandleSelect={(item) =>
                                                handlePipelineStageSelect(item)
                                              }
                                              select={selectTitle}
                                            />
                                          </FormGroup>
                                        </Row>
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {key === 'Contact Person' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
                                    {key.replace(
                                      /Contact/,
                                      moduleData.contact.singular
                                    )}
                                  </Label>
                                  <Col md={9} className="pl-0">
                                    <ControllerValidation
                                      name={fieldName}
                                      validationConfig={{
                                        required: mandatory
                                          ? `${key.replace(
                                              /Contact/,
                                              moduleData.contact.singular
                                            )} is required.`
                                          : '',
                                      }}
                                      errors={errors}
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <AutoComplete
                                          id="contact_person_id"
                                          placeholder={SEARCH_FOR_CONTACT.replace(
                                            /contact/,
                                            moduleData.contact.singular
                                          )}
                                          loading={loadingContact}
                                          name="contact_person_id"
                                          clearState={(e) => clearState(e)}
                                          type={moduleData.contact.singular}
                                          charactersRequire={charactersContact}
                                          showAvatar={true}
                                          customKey="name"
                                          onChange={(e) =>
                                            handleContactChange(e)
                                          }
                                          validationConfig={{
                                            required: mandatory
                                              ? `${key.replace(
                                                  /Contact/,
                                                  moduleData.contact.singular
                                                )} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          data={allContacts}
                                          onHandleSelect={async (item) => {
                                            if (item?.organization_id) {
                                              setLoadingOrg(true);
                                              setSelectedOrg({
                                                orgName: '',
                                              });
                                              const response =
                                                await organizationService
                                                  .getOrganizationById(
                                                    item?.organization_id
                                                  )
                                                  .catch((err) => err);
                                              setSelectOrganization(response);
                                              setValue(
                                                'contact_organization_id',
                                                response?.id
                                              );
                                              setSelectedOrg({
                                                orgName: response.name,
                                              });
                                              setLoadingOrg(false);
                                            }
                                            dispatch({
                                              ...dealFormData,
                                              contact_person_id: item?.id,
                                              contact_organization_id:
                                                item?.organization_id,
                                            });
                                            setSelectContactPerson(item);
                                          }}
                                          search={searchContact.search}
                                          selected={
                                            selectContactPerson?.first_name
                                              ? `${selectContactPerson.first_name} ${selectContactPerson.last_name}`
                                              : '' || contactProfile?.first_name
                                              ? `${contactProfile.first_name} ${contactProfile.last_name}`
                                              : ''
                                          }
                                          createItem={(data) => {
                                            setContactId(data);
                                          }}
                                        />
                                      )}
                                    />
                                  </Col>
                                </FormGroup>
                              )}
                              {field_type === 'DATE' && (
                                <FormGroup row className="py-1">
                                  <Label
                                    md={3}
                                    className="text-right font-size-sm"
                                  >
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
                                      form={dealFormData}
                                      errorDisplay="mb-0"
                                      control={control}
                                      renderer={({ field }) => (
                                        <ReactDatepicker
                                          id={fieldName}
                                          name={fieldName}
                                          format={DATE_FORMAT_EJS}
                                          minDate={new Date()}
                                          todayButton="Today"
                                          autoComplete="off"
                                          validationConfig={{
                                            required: mandatory
                                              ? `${key} is required.`
                                              : '',
                                          }}
                                          fieldState={getFieldState(fieldName)}
                                          value={dealFormData[fieldName]}
                                          className="form-control mx-0 mb-0"
                                          placeholder={DATE_FORMAT}
                                          onChange={(date) =>
                                            isCustom
                                              ? onHandleCustomDate(
                                                  date,
                                                  id,
                                                  fieldName
                                                )
                                              : onChangeClosingDate(date)
                                          }
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
                  </div>
                );
              })}
              {!addProductsClicked && (
                <div className="py-2">
                  <ButtonIcon
                    color="link"
                    icon="add"
                    type="button"
                    onclick={(e) => toggleAddProducts(e)}
                    label={moduleData.product.singular}
                    classnames={`border-0 px-2 btn-block font-weight-semi-bold text-left bg-gray-5 rounded text-primary`}
                  />
                </div>
              )}
              {addProductsClicked && (
                <div className="mt-3">
                  <DealProductsV2
                    moduleData={moduleData}
                    heading={`Associated ${moduleData.product.singular}`}
                    mode={2}
                    toggle={toggleAddProducts}
                    setGetDealProducts={setGetDealProducts}
                  />
                </div>
              )}
              <FormGroup className="mb-2">
                <Label>{OWNER}</Label>
                <IdfOwnersHeader
                  id="assigned_user_id"
                  name="assigned_user_id"
                  showAvatar={true}
                  isClickable={false}
                  mainOwner={selectOwner}
                  addBtnStyles={'bg-gray-5 add-icon'}
                  allowDelete
                  {...props}
                />
              </FormGroup>
            </Form>
          </CardBody>
          <CardFooter className="bg-gray-5">
            <div className="d-flex gap-2 justify-content-end align-items-center">
              <button
                type="button"
                className="btn btn-sm btn-white"
                data-dismiss="modal"
                onClick={() => handleClose()}
              >
                Cancel
              </button>
              <ButtonIcon
                type="button"
                onclick={handleSubmit}
                classnames="btn-sm"
                label={'Save'}
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

export default DealForm;
