import React, { useState, useEffect } from 'react';
import stringConstants from '../../utils/stringConstants.json';
import { Col, Form, Row } from 'react-bootstrap';
import InputValidation from '../commons/InputValidation';
import { useForm } from 'react-hook-form';
import DropdownValidation from '../commons/DropdownValidation';
import MaterialIcon from '../commons/MaterialIcon';

const ConditionsFields = ({
  setErrorMessage,
  showLoading,
  showModal,
  setSelectedEditData,
  setShowModal,
  isLoading,
  handleUpdateTenant,
  data = [],
  selectedEditData,
  handleCreateTenant,
}) => {
  const defaultOptions = {
    owner: {
      email: '',
    },
    tenant: {
      domain: '',
      description: '',
      type: 'owner',
    },
  };
  const {
    register,
    formState: { errors },
  } = useForm({
    defaultValues: defaultOptions,
  });
  const constants = stringConstants.workflow;
  const [tenantForm, setTenantForm] = useState(defaultOptions);

  useEffect(() => {
    setTenantForm({
      tenant: {
        description: selectedEditData?.description,
        domain: selectedEditData?.domain,
      },
    });
  }, [selectedEditData]);

  const handleChange = (e) => {
    const target = e.target;
    if (target.name !== 'email') {
      const tenantData = {
        ...tenantForm,
        tenant: {
          ...tenantForm?.tenant,
          [target.name]: target.value,
        },
      };
      setTenantForm(tenantData);
    } else {
      const tenantData = {
        ...tenantForm,
        owner: {
          ...tenantForm?.owner,
          email: target.value,
        },
      };
      setTenantForm(tenantData);
    }
  };

  const list = [
    { name: 'asc', value: 'asc' },
    { name: 'askjas', value: 'askjas' },
  ];
  return (
    <Form>
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Row className="mx-0">
        <Col>
          <Row className="align-items-center condition-input">
            <Col md={'auto'} className="px-0">
              <div className="count">1</div>
            </Col>
            <Col md={3} className="pr-0">
              <DropdownValidation
                name="type"
                value={tenantForm?.tenant?.type}
                validationConfig={{
                  required: false,
                  inline: false,
                  onChange: handleChange,
                }}
                errors={errors}
                register={register}
                classNames="font-size-sm rounded-left"
                errorDisplay="mb-0"
                customKeys={['name', 'description']}
                options={list}
                emptyOption="Select Type"
                placeholder="KPI metric"
              />
            </Col>
            <Col md={3} className="px-0">
              <DropdownValidation
                name="type"
                value={tenantForm?.tenant?.type}
                validationConfig={{
                  required: false,
                  inline: false,
                  onChange: handleChange,
                }}
                errors={errors}
                register={register}
                classNames="font-size-sm rounded-0"
                errorDisplay="mb-0"
                customKeys={['name', 'description']}
                options={list}
                emptyOption="Select Type"
                placeholder="KPI metric"
              />
            </Col>
            <Col md={5} className="pl-0 pr-1">
              <InputValidation
                name="domain"
                type="input"
                className="border-left-0"
                placeholder="Enter Component Name"
                value={tenantForm?.tenant?.domain}
                validationConfig={{
                  required: true,
                  inline: false,
                  onChange: handleChange,
                }}
                errors={errors}
                register={register}
                errorDisplay="mb-0"
              />
            </Col>
            <Col md={'auto'} className="px-1">
              <MaterialIcon icon="add" clazz="text-primary cursor-pointer" />
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default ConditionsFields;
