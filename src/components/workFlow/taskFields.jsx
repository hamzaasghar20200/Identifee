import React, { useState, useEffect } from 'react';
import { Label } from 'reactstrap';
import stringConstants from '../../utils/stringConstants.json';
import { Col, Form, Row } from 'react-bootstrap';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { useForm } from 'react-hook-form';
import DropdownValidation from '../commons/DropdownValidation';

const TaskFields = ({
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
                Task Name <Asterick />
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
                Owner <Asterick />
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
            <h5 className="mb-0">Due Date</h5>
          </Label>
          <Row>
            <Col md={7} className="pr-0">
              <div className="d-flex align-items-center justify-content-canter">
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
                <span className="pl-3 font-size-md">+</span>
              </div>
            </Col>
            <Col md={3} className="pr-0">
              <InputValidation
                name="domain"
                type="input"
                placeholder="0000"
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
            <Col md={2}>
              <Label htmlFor="" className="form-label col-form-label">
                <h5 className="mb-0">days</h5>
              </Label>
            </Col>
          </Row>
          <div className="mt-3">
            <Label>
              <input type="checkbox" className="mr-1" /> Notify Owner
            </Label>
          </div>
          <div>
            <Label>
              <input type="checkbox" className="mr-1" /> Reminder
            </Label>
          </div>
          <div>
            <Label>
              <input type="checkbox" className="mr-1" /> Mark as High Priority
            </Label>
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default TaskFields;
