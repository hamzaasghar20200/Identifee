import React, { useEffect, useState } from 'react';
import { CardBody, CardFooter, Label, Col, FormGroup } from 'reactstrap';
import ButtonIcon from '../../components/commons/ButtonIcon';
import userService from '../../services/user.service';
import { ROLE_LABEL, PROFILE_LABEL } from '../../utils/constants';
import { DropdownTreeView } from '../prospecting/v2/common/DropdownTreeView';
import RightPanelModal from './RightPanelModal';
import InputValidation from '../commons/InputValidation';
import { useForm } from 'react-hook-form';
import ControllerValidation from '../commons/ControllerValidation';
import { RIGHT_PANEL_WIDTH, emailRegex } from '../../utils/Utils';
import IdfSelectProfile from '../idfComponents/idfDropdown/IdfSelectProfile';
import AutoComplete from '../AutoComplete';
import teamsService from '../../services/teams.service';

const InviteFormGroup = ({ label, component }) => {
  return (
    <FormGroup row className="py-1">
      <Label md={3} className="text-right font-size-sm">
        {label}
      </Label>
      <Col md={9} className="pl-0">
        {component}
      </Col>
    </FormGroup>
  );
};
const InvitationModal = ({
  showModal,
  setShowModal,
  data,
  isShowTreeView,
  setIsShowTreeView,
  getUsers,
  setErrorMessage = () => {},
  setSuccessMessage = () => {},
}) => {
  const defaultInviteObject = {
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    groupId: '',
    tenant: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: defaultInviteObject,
  });

  const [inviteFormData, setInviteFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setRoleSelection] = useState({});
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [savingTeam, setSavingTeam] = useState(false);
  const onHandleCloseModal = () => {
    setShowModal(false);
    setIsShowTreeView('');
    setRoleSelection({});
    reset(defaultInviteObject);
    setInviteFormData({});
    setSelectedTeam([]);
  };
  const handleTeamSelect = async (team) => {
    const newTeams = [...selectedTeam, team];
    setSelectedTeam(newTeams);
  };
  const getTeams = async () => {
    setSavingTeam(true);
    const { data } = await teamsService.getTeams({ page: 1, limit: 50 });
    // add All option in dropdown
    setTeams(data);
    setSavingTeam(false);
  };
  useEffect(() => {
    getTeams();
  }, []);
  const onSubmit = async () => {
    const teams = [];
    selectedTeam?.forEach((item) => {
      teams.push({
        isManager: false,
        teamId: item?.id,
      });
    });
    setIsLoading(true);
    try {
      const { firstName, lastName, email, groupId, roleId } = inviteFormData;
      const invitationInfo = {
        firstName,
        lastName,
        email,
        roleId,
        groupId: groupId || isShowTreeView.id,
      };
      const data = await userService.invite([invitationInfo]);
      if (data) {
        await userService.inviteTeamUsers(data[0]?.id, teams);
      }
      setSuccessMessage('Invite sent successfully.');
      onHandleCloseModal();
      getUsers();
    } catch (err) {
      if (err.response.status === 409) {
        setErrorMessage('User Already Exist');
      } else {
        setErrorMessage(
          'Error sending invite. Please check console for details.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onHandleChangeSelect = (e) => {
    const { value } = e.target;
    setRoleSelection(value);
    setInviteFormData({ ...inviteFormData, roleId: value.id });
    setValue('roleId', value.id);
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData({ ...inviteFormData, [name]: value });
    setValue(name, value);
  };
  const clearState = (name) => {
    if (name === 'roleId') {
      setInviteFormData({ ...inviteFormData, [name]: '' });
      setValue(name, '');
    } else {
      setSelectedTeam([]);
    }
  };
  return (
    <RightPanelModal
      showModal={showModal}
      setShowModal={onHandleCloseModal}
      showOverlay={true}
      containerBgColor={'pb-0'}
      containerWidth={RIGHT_PANEL_WIDTH}
      containerPosition={'position-fixed'}
      headerBgColor="bg-gray-5"
      Title={
        <div className="d-flex py-2 align-items-center">
          <h3 className="mb-0">Invite User</h3>
        </div>
      }
    >
      <CardBody className="overflow-y-auto">
        <div>
          <InviteFormGroup
            label="First Name"
            component={
              <InputValidation
                name="firstName"
                type="input"
                placeholder=""
                value={inviteFormData.firstName || ''}
                errorDisplay="mb-0"
                classNames="mr-2"
                validationConfig={{
                  required: 'First Name cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label="Last Name"
            component={
              <InputValidation
                name="lastName"
                type="input"
                placeholder=""
                value={inviteFormData.lastName || ''}
                classNames="mr-2"
                errorDisplay="mb-0"
                validationConfig={{
                  required: 'Last Name cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label="Email"
            component={
              <InputValidation
                name="email"
                type="input"
                placeholder=""
                value={inviteFormData.email || ''}
                classNames="mr-2"
                errorDisplay="mb-0"
                validationConfig={{
                  required: 'Email cannot be empty.',
                  inline: false,
                  borderLeft: true,
                  onChange: handleOnChange,
                  pattern: {
                    value: emailRegex,
                    message: 'Please enter a valid email.',
                  },
                }}
                errors={errors}
                register={register}
              />
            }
          />

          <InviteFormGroup
            label={ROLE_LABEL}
            component={
              <ControllerValidation
                name="groupId"
                errors={errors}
                form={inviteFormData}
                errorDisplay="mb-0"
                control={control}
                validationConfig={{
                  required: 'Role is required.',
                }}
                renderer={({ field }) => (
                  <>
                    <DropdownTreeView
                      data={data}
                      setIsDropdownId={(selected) => {
                        setValue('groupId', selected.id);
                        setInviteFormData({
                          ...inviteFormData,
                          groupId: selected.id,
                        });
                        setIsShowTreeView(selected);
                      }}
                      isDropdownId={isShowTreeView}
                      validationConfig={{
                        required: 'Role is required.',
                      }}
                      fieldState={getFieldState('groupId')}
                    />
                  </>
                )}
              />
            }
          />
          <InviteFormGroup
            label={PROFILE_LABEL}
            component={
              <ControllerValidation
                name="roleId"
                errors={errors}
                form={inviteFormData}
                errorDisplay="mb-0"
                control={control}
                validationConfig={{
                  required: 'Profile is required.',
                }}
                renderer={({ field }) => (
                  <>
                    <IdfSelectProfile
                      name="roleId"
                      onChange={onHandleChangeSelect}
                      value={selectedRole}
                      clearState={(e) => clearState(e)}
                      validationConfig={{
                        required: 'Profile is required.',
                      }}
                      fieldState={getFieldState('roleId')}
                      query={{ page: 1, limit: 1000, self: true }} // TODO: Define if the roles dropdown will have pagination
                    />
                  </>
                )}
              />
            }
          />
          <InviteFormGroup
            label={'Team'}
            component={
              <AutoComplete
                id={`team_id`}
                placeholder="Select Team"
                name={`team_id`}
                data={teams}
                loading={savingTeam}
                onChange={(items, itemToRemove) => {
                  const allOption = items.find((t) => t.id === -1);
                  if (allOption) {
                    setSelectedTeam(teams.filter((t) => t.id !== -1));
                  } else {
                    setSelectedTeam(items.filter((t) => t.id !== -1));
                  }
                }}
                clearState={(e) => clearState(e)}
                customKey="name"
                isMultiple={true}
                selected={selectedTeam}
                onHandleSelect={(item) => handleTeamSelect(item)}
              />
            }
          />
        </div>
      </CardBody>
      <CardFooter className="bg-gray-5">
        <div className="d-flex gap-2 justify-content-end align-items-center">
          <button
            className="btn btn-sm btn-white"
            data-dismiss="modal"
            onClick={() => {
              reset(defaultInviteObject);
              onHandleCloseModal();
            }}
          >
            Cancel
          </button>
          <ButtonIcon
            type="button"
            classnames="btn-sm"
            label="Send Invite"
            loading={isLoading}
            color="primary"
            onclick={handleSubmit(onSubmit)}
          />
        </div>
      </CardFooter>
    </RightPanelModal>
  );
};

export default InvitationModal;
