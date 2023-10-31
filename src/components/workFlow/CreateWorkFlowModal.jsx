import React, { useState, useEffect } from 'react';
import { Label } from 'reactstrap';

import SimpleModal from '../modal/SimpleModal';
import stringConstants from '../../utils/stringConstants.json';
import { Col, Row } from 'react-bootstrap';
import InputValidation from '../commons/InputValidation';
import Asterick from '../commons/Asterick';
import { useForm } from 'react-hook-form';
import DropdownValidation from '../commons/DropdownValidation';

const CreateWorkFlowModal = ({
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
    domain: '',
    description: '',
    type: 'owner',
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultOptions,
  });
  const constants = stringConstants.workflow;
  const [tenantForm, setTenantForm] = useState(defaultOptions);

  useEffect(() => {
    setTenantForm({
      description: selectedEditData.description,
      modules: selectedEditData.modules?.split(','),
      domain: selectedEditData.domain,
    });
  }, [selectedEditData]);

  const handleChange = (e) => {
    const target = e.target;
    if (target.name !== 'email') {
      const tenantData = {
        ...tenantForm,
        [target.name]: target.value,
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

  // Handler of submit
  const handleFormSubmit = async () => {
    if (selectedEditData.id) {
      handleUpdateTenant(tenantForm);
    } else {
      handleCreateTenant(tenantForm);
    }
    setTenantForm({});
    reset(defaultOptions);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedEditData('');
    setTenantForm({
      name: '',
      domain: '',
      description: '',
      use_logo: false,
      modules: [],
      logo: '',
      icon: '',
      type: '',
      colors: '',
    });
    reset(defaultOptions);
  };
  const list = [
    { name: 'asc', value: 'asc' },
    { name: 'askjas', value: 'askjas' },
  ];
  return (
    <SimpleModal
      modalTitle={
        selectedEditData?.id
          ? constants.edit.title
          : constants.create.addWorkFlowModalTitle
      }
      onHandleCloseModal={() => closeModal()}
      open={showModal}
      buttonLabel={constants.create.btnAddWorkFlow}
      buttonsDisabled={!tenantForm?.name}
      handleSubmit={handleSubmit(handleFormSubmit)}
      allowCloseOutside={false}
      isLoading={showLoading}
    >
      <span className="font-size-sm">{constants.create.textGroupName}</span>
      <Row>
        <Col className="border-right">
          <div>
            <Label htmlFor="" className="form-label col-form-label">
              <h5 className="mb-0">
                Workflow Name <Asterick />
              </h5>
            </Label>
            <InputValidation
              name="domain"
              type="input"
              placeholder="Enter Component Name"
              value={tenantForm?.domain}
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
              value={tenantForm?.type}
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
            <h5 className="mb-0">Description</h5>
          </Label>
          <InputValidation
            name="description"
            type="textarea"
            placeholder="Description"
            value={tenantForm?.description}
            validationConfig={{
              required: false,
              onChange: handleChange,
              maxLength: {
                value: 255,
                message: 'Description cannot exceed 255 characters.',
              },
            }}
            errors={errors}
            register={register}
            classNames="min-h-120"
          />
        </Col>
      </Row>
    </SimpleModal>
  );
};

export default CreateWorkFlowModal;
