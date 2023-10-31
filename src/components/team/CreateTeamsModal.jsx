import React, { useEffect, useState } from 'react';
import { FormGroup, Label, Col, CardBody } from 'reactstrap';

import RightPanelModal from '../modal/RightPanelModal';
import stringConstants from '../../utils/stringConstants.json';
import { RIGHT_PANEL_WIDTH, isAlphanumeric } from '../../utils/Utils';
import AutoComplete from '../AutoComplete';
import userService from '../../services/user.service';
import { Form, ModalFooter } from 'react-bootstrap';
import ButtonIcon from '../commons/ButtonIcon';
import { useForm } from 'react-hook-form';
import InputValidationAdvance from '../commons/InputValidationAdvance';
import ControllerValidation from '../commons/ControllerValidation';

const errorAlphanumeric = stringConstants.settings.users.filters.alphanumeric;

const CreateTeamsModal = ({
  setErrorMessage,
  showModal,
  setShowModal,
  createGroup,
  isUserId,
  setIsUserId,
  isLoading,
  updateTeam,
  isUserDataShow = [],
  teamForm,
  setTeamForm,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: teamForm,
  });
  const [getTeam, setIsGetTeam] = useState([]);
  const constants = stringConstants.settings.teams;
  const [users, setUsers] = useState([]);
  const [team, setTeam] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchState, setSearchState] = useState({
    search: '',
  });
  const result = isUserDataShow?.filter(checkAdult);

  function checkAdult(user) {
    return user.isManager === true
      ? `${user?.user.first_name} ${user?.user.last_name}`
      : '';
  }
  const userGetDropdown = result[0];
  const getUsers = async (search) => {
    const { data } = await userService.getUsers(
      { status: 'active', search },
      { page: 1, limit: 100 }
    );
    setUsers(data?.users);
  };

  const alphanumericError = (input) => {
    const msgError = errorAlphanumeric.error;
    if (input === 'search') {
      setErrorMessage(msgError);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };
  useEffect(() => {
    setTeam(
      team.filter((item) => {
        return item.id !== isUserId.id;
      })
    );
  }, [isUserId]);
  const onInputChange = (e) => {
    const { value, name } = e.target || {};
    isAlphanumeric(value)
      ? setTeamForm({ ...teamForm, [name]: value })
      : alphanumericError(`search`);
    setValue(name, value);
  };
  useEffect(() => {
    if (isUserId?.name) {
      let manager = {};
      const tempAttay = [...getTeam];
      manager = {
        userId: isUserId?.id,
        isManager: true,
      };
      tempAttay.push(manager);
      const data = {
        ...teamForm,
        members: tempAttay,
        isActive: true,
      };
      setValue('members', tempAttay);
      setTeamForm(data);
    }
  }, [isUserId]);
  // Handler of submit
  const onHandleSubmit = () => {
    if (teamForm?.id) {
      updateTeam(teamForm);
    } else {
      createGroup(teamForm);
    }
    setIsUserId('');
    reset(
      setTeamForm({
        name: '',
        description: '',
        members: [],
      })
    );
    setTeam([]);
    setIsGetTeam([]);
  };
  const closeModal = () => {
    setShowModal(false);
    setIsUserId('');
    setTeam([]);
    setUsers([]);
    reset(
      setTeamForm({
        name: '',
        description: '',
        members: [],
      })
    );
  };
  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchState({
        ...searchState,
        search: e.target.value,
      });
      getUsers(e.target.value);
    } else {
      setUsers([]);
      return setCharactersRequire(match?.length);
    }
  };
  const clearState = (name) => {
    if (name === 'isUserId') {
      setIsUserId('');
      setUsers([]);
    }
  };
  useEffect(() => {
    if (userGetDropdown?.user?.name) {
      setIsUserId(userGetDropdown?.user);
      setValue('name', teamForm?.name);
      setValue('description', teamForm?.description);
      setValue('members', isUserId?.id);
    }
  }, [userGetDropdown]);

  useEffect(() => {
    if (!showModal) {
      closeModal();
    }
  }, [!showModal]);

  return (
    <RightPanelModal
      Title={
        teamForm?.id ? constants.edit.title : constants.create.addTeamModalTitle
      }
      onHandleCloseModal={() => closeModal()}
      showModal={showModal}
      setShowModal={setShowModal}
      showOverlay={true}
      buttonLabel={constants.create.btnAddTeam}
      buttonsDisabled={!name}
      containerBgColor={'pb-0'}
      containerWidth={RIGHT_PANEL_WIDTH}
      containerPosition={'position-fixed'}
      headerBgColor="bg-gray-5"
    >
      <CardBody className="right-bar-vh h-100 overflow-y-auto">
        <Form onSubmit={handleSubmit(onHandleSubmit)}>
          <div>
            <InputValidationAdvance
              fieldType="text"
              type="input"
              label="Team Name"
              name="name"
              id="name"
              classNames={`border-left-4 border-left-danger`}
              className="mt-2 mb-2"
              value={teamForm}
              errors={errors}
              validationConfig={{
                required: true,
                inline: false,
                onChange: (e) => {
                  onInputChange(e);
                },
              }}
              register={register}
              placeholder="Team Name" // onChange={onInputChange}
            />
            <FormGroup row>
              <Label md={3} className=" text-right font-size-sm">
                Team Manager *
              </Label>
              <Col md={9} className="pl-0">
                <ControllerValidation
                  name={'members'}
                  errors={errors}
                  form={teamForm}
                  errorDisplay="mb-0"
                  control={control}
                  validationConfig={{
                    required: 'Manager is Required',
                  }}
                  renderer={({ field }) => (
                    <AutoComplete
                      id="isUserId"
                      title={constants.create.dropTextParentTeam}
                      name="members"
                      placeholder="Select Manager"
                      showAvatar={false}
                      fieldState={getFieldState('members')}
                      customKey="name"
                      customTitle={''}
                      charactersRequire={charactersRequire}
                      onChange={(e) => stateChange(e)}
                      validationConfig={{
                        required: true,
                        inline: false,
                      }}
                      clearState={(e) => clearState(e)}
                      search={searchState?.search}
                      data={users}
                      onHandleSelect={(item) => setIsUserId(item)}
                      selected={isUserId?.name}
                    />
                  )}
                />
              </Col>
            </FormGroup>
            <InputValidationAdvance
              fieldType="text"
              type="textarea"
              className="form-control"
              rows={3}
              label={'Team Description'}
              name="description"
              id={'description'}
              classNames={`border-left-4 border-left-danger`}
              value={teamForm}
              errors={errors}
              register={register}
              validationConfig={{
                required: true,
                inline: false,
                onChange: (e) => {
                  onInputChange(e);
                },
              }}
              placeholder="Team description"
            />
          </div>
        </Form>
      </CardBody>
      <ModalFooter>
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
          label={teamForm?.id ? 'Update' : 'Save'}
          color={`primary`}
          loading={isLoading}
        />
      </ModalFooter>
    </RightPanelModal>
  );
};

export default CreateTeamsModal;
