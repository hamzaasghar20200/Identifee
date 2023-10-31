import React, { useState, useEffect } from 'react';
import { Label } from 'reactstrap';
import stringConstants from '../../utils/stringConstants.json';
import { Col, Form, Row } from 'react-bootstrap';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { useForm } from 'react-hook-form';
import DropdownValidation from '../commons/DropdownValidation';

const UpdateFields = ({
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
        <Col className="border-right">
          <div>
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Name <Asterick />
              </h5>
            </Label>
            <InputValidation
              name="domain"
              type="input"
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
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Module <Asterick />
              </h5>
            </Label>
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
              classNames="font-size-sm"
              errorDisplay="mb-0"
              customKeys={['name', 'description']}
              options={list}
              emptyOption="Select Type"
              placeholder="KPI metric"
            />
          </div>
          <Label htmlFor="" className="form-label col-form-label">
            <h5 className="mb-0">
              Update <Asterick />
            </h5>
          </Label>
          <Row>
            <Col md={4} className="pr-0">
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
            <Col md={8} className="pl-0">
              <InputValidation
                name="domain"
                type="input"
                className="rounded-right"
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
          </Row>
        </Col>
      </Row>
    </Form>
  );
};

export default UpdateFields;
