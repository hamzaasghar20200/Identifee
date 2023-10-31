import React, { useEffect, useState } from 'react';
import {
  CardBody,
  CardFooter,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';

import RightPanelModal from '../modal/RightPanelModal';
import stringConstants from '../../utils/stringConstants.json';
import { RIGHT_PANEL_WIDTH, isAlphanumeric } from '../../utils/Utils';
import { DropdownTreeView } from '../prospecting/v2/common/DropdownTreeView';
import { useForm } from 'react-hook-form';
import InputValidationAdvance from '../commons/InputValidationAdvance';
import ButtonIcon from '../commons/ButtonIcon';
import ControllerValidation from '../commons/ControllerValidation';

const errorAlphanumeric = stringConstants.settings.users.filters.alphanumeric;

const CreateGroupModal = ({
  setErrorMessage,
  showModal,
  setShowModal,
  createGroup,
  data = [],
  siblingAccess,
  setIsDropdownId,
  isDropdownId,
  isAddSingleRole = '',
  perantId,
  isLoading,
  setSblingAccess,
}) => {
  const groupObj = {
    group_name: '',
    parent_id: '',
    description: '',
  };
  const [groupForm, setGroupForm] = useState(groupObj);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getFieldState,
    formState: { errors },
  } = useForm({
    defaultValues: groupForm,
  });
  const constants = stringConstants.settings.groups;

  const alphanumericError = (input) => {
    const msgError = errorAlphanumeric.error;
    if (input === 'search') {
      setErrorMessage(msgError);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };
  const onInputChange = (e) => {
    const { value, name } = e.target || {};
    isAlphanumeric(value)
      ? setGroupForm({ ...groupForm, [name]: value })
      : alphanumericError(`search`);
    setValue(name, value);
  };

  // Handler of submit
  const onHandleSubmit = () => {
    createGroup(groupForm);
    setIsDropdownId('');
    reset(
      setGroupForm({
        group_name: '',
        parent_id: null,
        description: '',
      })
    );
    setSblingAccess(false);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    reset(
      setGroupForm({
        group_name: '',
        parent_id: null,
        description: '',
      })
    );
    setIsDropdownId('');
  };
  useEffect(() => {
    if (perantId) {
      setGroupForm({
        ...groupForm,
        parent_id: perantId,
      });
      setValue('parent_id', perantId);
    }
  }, [perantId]);
  console.log(isAddSingleRole);
  return (
    <RightPanelModal
      Title={constants.create.addGroupModalTitle}
      onHandleCloseModal={() => closeModal()}
      showModal={showModal}
      buttonLabel={constants.create.roleAddGroup}
      handleSubmit={() => handleSubmit()}
      allowCloseOutside={false}
      setShowModal={setShowModal}
      showOverlay={true}
      containerBgColor={'pb-0'}
      containerWidth={RIGHT_PANEL_WIDTH}
      containerPosition={'position-fixed'}
      headerBgColor="bg-gray-5"
    >
      <CardBody>
        <Form onSubmit={handleSubmit(onHandleSubmit)}>
          <InputValidationAdvance
            fieldType="text"
            type="input"
            label="Role Name"
            name="group_name"
            id="group_name"
            classNames={`border-left-4 border-left-danger`}
            className="mt-2 mb-2"
            value={groupForm}
            errors={errors}
            validationConfig={{
              required: true,
              inline: false,
              onChange: (e) => {
                onInputChange(e);
              },
            }}
            register={register}
            placeholder="Role Name"
          />

          <FormGroup row className="align-items-center">
            <Label md={3} className="mt-0 text-right">
              Reports to
            </Label>
            <Col md={9} className="pl-0">
              <ControllerValidation
                name={'parent_id'}
                errors={errors}
                form={groupForm}
                errorDisplay="mb-0"
                control={control}
                validationConfig={{
                  required: 'Role Id is Required',
                }}
                renderer={({ field }) => (
                  <DropdownTreeView
                    data={data}
                    validationConfig={{
                      required: true,
                      inline: false,
                    }}
                    fieldState={getFieldState('parent_id')}
                    setIsDropdownId={setIsDropdownId}
                    isDropdownId={isDropdownId}
                    editRoleData={isAddSingleRole}
                  />
                )}
              />
            </Col>
          </FormGroup>
          <FormGroup row className="mx-0">
            <Label
              md={9}
              htmlFor="has_sibling_access"
              className="form-label ml-auto"
            >
              <Input
                type="checkbox"
                name="has_sibling_access"
                id="has_sibling_access"
                value={siblingAccess}
                checked={siblingAccess}
                onChange={() => setSblingAccess(!siblingAccess)}
              />{' '}
              <span className="font-weight-normal">
                {' '}
                Let users in this role see each other&apos;s data
              </span>
            </Label>
          </FormGroup>
          <InputValidationAdvance
            fieldType="text"
            type="textarea"
            label="Description"
            name="description"
            id="description"
            rows={3}
            classNames={`border-left-4 border-left-danger`}
            className="mt-2 mb-2"
            value={groupForm}
            errors={errors}
            validationConfig={{
              required: true,
              inline: false,
              onChange: (e) => {
                onInputChange(e);
              },
            }}
            register={register}
            placeholder="A few words about this role"
          />
        </Form>
      </CardBody>
      <CardFooter className="text-right">
        <ButtonIcon
          label="Cancel"
          type="button"
          color="white"
          classnames="btn-white mx-1 btn-sm"
          onclick={showModal ? closeModal : ''}
        />
        <ButtonIcon
          classnames="btn-sm"
          type="button"
          onclick={handleSubmit(onHandleSubmit)}
          label={'Save'}
          color={`primary`}
          loading={isLoading}
        />
      </CardFooter>
    </RightPanelModal>
  );
};

export default CreateGroupModal;
