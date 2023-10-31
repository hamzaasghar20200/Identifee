import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardFooter, Row } from 'reactstrap';

import userService from '../../../services/user.service';
import authService from '../../../services/auth.service';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import Avatar from '../../../components/Avatar';
import FormItem from '../../../components/profile/FormItem';
import ModalConfirm from '../../../components/modal/ModalConfirmDefault';
import ModalInput from '../../../components/modal/InputModal';
import {
  USER_UPDATE_SUCCESS,
  SERVER_ERROR,
  ERROR_FIRST_NAME_REQUIRED,
  ERROR_LAST_NAME_REQUIRED,
  badgeColorStatus,
  NAME_UNKNOWN_USER,
  SEND_EMAIL_SUCCESS,
  LABEL_BUTTON_RESEND_INVITATION,
  TEXT_INFO_MODAL_CANCEL,
  TEXT_INFO_MODAL_RESEND,
  TEXT_INFO_MODAL_SUSPEND,
  USER_SUSPENDED,
  USER_ACTIVE,
  LABEL_BUTTON_ACTIVATE_USER,
  STATUS_ACTIVE,
  STATUS_INVITED,
  STATUS_SUSPENDED,
  NAME_INVITED_USER,
  TEXT_INFO_MODAL_ACTIVE,
} from '../../../utils/constants';
import stringConstants from '../../../utils/stringConstants.json';
import { isEmpty, isDefined } from '../../../utils/Utils';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import IdfModalResetPass from '../../../components/idfComponents/idfModals/idfModalResetPass';
import IdfModalShowPass from '../../../components/idfComponents/idfModals/idfModalShowPass';
import { DropdownTreeView } from '../../../components/prospecting/v2/common/DropdownTreeView';
import groupsService from '../../../services/groups.service';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { useProfileContext } from '../../../contexts/profileContext';
import PageTitle from '../../../components/commons/PageTitle';
import IdfSelectProfile from '../../../components/idfComponents/idfDropdown/IdfSelectProfile';
import AutoComplete from '../../../components/AutoComplete';
import teamsService from '../../../services/teams.service';
const InfoCard = ({ user, onClickResent, loading }) => {
  const Badge = () => {
    const badgeStatus = user?.status
      ? badgeColorStatus.filter((b) => b.status === user?.status.toLowerCase())
      : null;

    let classnames = '';

    if (badgeStatus?.length > 0) {
      const color = badgeStatus[0].color;
      classnames = `bg-${color}`;
    }

    if (user) {
      return (
        <span className={`badge rounded-pill px-3 py-2 fw-bold ${classnames}`}>
          {user?.status === 'invite_cancelled'
            ? 'CANCELLED INVITE'
            : user?.status?.toUpperCase()}
        </span>
      );
    }
    return <></>;
  };

  const Media = () => {
    const [openModelEdit, setOpenModelEdit] = useState(false);
    const [isloading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const OpenEditModel = (e) => {
      setOpenModelEdit(true);
    };
    const handleSubmit = async (email) => {
      setIsLoading(true);
      try {
        const data = { email };
        await userService.updateUserInfoById(user.id, data);
        setSuccessMessage(SEND_EMAIL_SUCCESS);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
        setOpenModelEdit(false);
      }
    };
    return (
      <div className="media">
        {user && (
          <Avatar
            user={user}
            classModifiers="mr-3 avatar-xl"
            sizeIcon="font-size-3xl profile-icon"
          />
        )}
        <div className="media-body">
          <h3 className="mr-3 mb-0" data-uw-styling-context="true">
            {user &&
            isDefined(user.first_name) &&
            user.first_name !== null &&
            user?.last_name !== null
              ? `${user?.first_name} ${user?.last_name}`
              : NAME_UNKNOWN_USER}
          </h3>
          <span
            className="d-inline-flex align-items-center text-muted font-size-sm"
            data-uw-styling-context="true"
          >
            {user ? user.email : ''}
            <a
              onClick={OpenEditModel}
              className="cursor-pointer ml-1 icon-hover-bg"
            >
              <MaterialIcon icon="edit" />
            </a>
          </span>
          <div>
            <Badge />
          </div>
        </div>
        <ModalInput
          open={openModelEdit}
          onHandleCloseModal={() => setOpenModelEdit(false)}
          handleSubmit={handleSubmit}
          user={user}
          buttonLabel={'Update'}
          modalTitle={'Edit Email'}
          iconButtonConfirm="people"
          colorButtonConfirm={'outline-danger'}
          isLoading={isloading}
        />
        <AlertWrapper>
          <Alert
            message={successMessage}
            setMessage={setSuccessMessage}
            color="success"
          />
          <Alert
            message={errorMessage}
            setMessage={setErrorMessage}
            color="danger"
          />
          <Alert
            message={warningMessage}
            setMessage={setWarningMessage}
            color="warning"
          />
        </AlertWrapper>
      </div>
    );
  };

  return (
    <CardBody>
      <div className="row">
        <div className="col-8">
          <Media />
        </div>
        <div className="d-flex justify-content-end align-items-center col-4">
          {user?.status === STATUS_INVITED && (
            <ButtonIcon
              icon="email"
              label={LABEL_BUTTON_RESEND_INVITATION}
              onclick={onClickResent}
              loading={loading}
            />
          )}
        </div>
      </div>
    </CardBody>
  );
};

const FormUser = ({
  user = {},
  onHandleChange,
  setRole,
  setErrorMessage,
  handleChange,
  teamMembers,
  setTeamMembers,
  isAllTreeData,
  setIsShowTree,
  isShowTree,
}) => {
  const { profileInfo } = useProfileContext();
  const [adminAccess, setAdminAccess] = useState();
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    setAdminAccess(profileInfo?.role?.admin_access);
  }, [profileInfo]);
  const userInputs = stringConstants.users.inputs;

  const [searchRole, setSearchRole] = useState(null);
  const getTeams = async () => {
    const { data } = await teamsService.getTeams({ page: 1, limit: 50 });
    // add All option in dropdown
    setTeams(data);
  };
  useEffect(() => {
    if (user?.roleInfo) {
      setSearchRole(user.role);
    }
  }, [user?.role]);

  const onInputSearch = (e) => {
    const { value } = e.target || {};

    setSearchRole(value);

    setRole(value?.id);
  };
  useEffect(() => {
    setSearchRole(user?.role);
    getTeams();
  }, []);
  useEffect(() => {
    getTeamMembers();
    setSearchRole(user?.role);
    setRole(user?.role?.id);
    setIsShowTree(user.group);
  }, [user]);
  const getTeamMembers = async () => {
    try {
      const { data } = await userService.getTeamMemberByUserId(user?.id);
      const teamObjects = data.map(({ team }) => team);
      setTeamMembers(teamObjects);
    } catch (error) {
      setErrorMessage();
    }
  };
  const clearState = (name) => {
    if (name === 'roleId') {
      setSearchRole('');
      setRole('');
    } else {
      setTeamMembers([]);
    }
  };
  const formInputStyle = { sizeInput: 10, sizeLabel: 2 };
  return (
    <CardFooter>
      <FormItem
        {...formInputStyle}
        title={userInputs.fullName.title}
        labelFor="firstNameLabel"
      >
        <div className="input-group input-group-sm-down-break">
          <input
            type="text"
            className="form-control"
            name="first_name"
            id="firstNameLabel"
            placeholder={`${userInputs.fullName.placeholderName}`}
            aria-label={`${userInputs.fullName.placeholderName}`}
            value={user.first_name || ''}
            data-uw-styling-context="true"
            onChange={onHandleChange}
          />
        </div>
      </FormItem>
      <FormItem
        {...formInputStyle}
        title={userInputs.lastName.title}
        labelFor="firstNameLabel"
      >
        <div className="input-group input-group-sm-down-break">
          <input
            type="text"
            className="form-control"
            name="last_name"
            id="lastNameLabel"
            placeholder={`${userInputs.fullName.placeholderLastName}`}
            aria-label={`${userInputs.fullName.placeholderLastName}`}
            value={user.last_name || ''}
            data-uw-styling-context="true"
            onChange={onHandleChange}
          />
        </div>
      </FormItem>
      <FormItem
        {...formInputStyle}
        title={userInputs.title.title}
        labelFor="titleLabel"
      >
        <input
          type="text"
          className="form-control"
          name="title"
          id="titleLabel"
          placeholder={userInputs.title.placeholder}
          aria-label={userInputs.title.placeholder}
          value={user.title || ''}
          data-uw-styling-context="true"
          onChange={onHandleChange}
        />
      </FormItem>

      <FormItem
        {...formInputStyle}
        title={userInputs.phoneNumber.title}
        labelFor="phoneLabel"
      >
        <input
          type="text"
          className="form-control"
          name="phone"
          id="phoneLabel"
          placeholder={userInputs.phoneNumber.placeholder}
          aria-label={userInputs.phoneNumber.placeholder}
          value={user.phone || ''}
          data-uw-styling-context="true"
          onChange={onHandleChange}
        />
      </FormItem>

      <FormItem
        {...formInputStyle}
        title={userInputs.email.title}
        labelFor="emailLabel"
      >
        <input
          type="email"
          className="form-control"
          name="email"
          id="emailLabel"
          placeholder={userInputs.phoneNumber.placeholder}
          aria-label={userInputs.phoneNumber.placeholder}
          disabled={true}
          value={user.email || ''}
          data-uw-styling-context="true"
          onChange={onHandleChange}
        />
      </FormItem>

      <FormItem
        {...formInputStyle}
        title="Profile"
        groupClass="mb-0"
        labelFor="rolsLabel"
      >
        <IdfSelectProfile
          name="RoleId"
          clearState={(e) => clearState(e)}
          id="selectRoleDropdown"
          onChange={onInputSearch}
          value={searchRole}
          disabled={adminAccess} // TODO: Define if the roles dropdown will have pagination
        />
      </FormItem>
      <FormItem {...formInputStyle} title="Role" labelFor="rolsLabel">
        <DropdownTreeView
          data={isAllTreeData}
          getRoleData={user.groupId}
          setIsDropdownId={setIsShowTree}
          isDropdownId={isShowTree}
          disabled={adminAccess ? 'disabled' : ''}
        />
      </FormItem>
      <FormItem {...formInputStyle} title="Team" labelFor="rolsLabel">
        <AutoComplete
          id={`team`}
          placeholder="Select Team"
          name={`team`}
          data={teams}
          onChange={(items) => {
            const allOption = items?.find((t) => t.id === -1);
            if (allOption) {
              setTeamMembers(teams.filter((t) => t.id !== -1));
            } else {
              setTeamMembers(items.filter((t) => t.id !== -1));
            }
          }}
          customKey="name"
          clearState={(e) => clearState(e)}
          isMultiple={true}
          selected={teamMembers}
          onHandleSelect={(item) => handleChange(item)}
        />
      </FormItem>
    </CardFooter>
  );
};

const userEmpty = {
  first_name: '',
  last_name: '',
  email: '',
  status: null,
};

const ResentInvite = () => {
  const history = useHistory();
  const { id: userId } = useParams();
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(userEmpty);
  const [formUser, setFormtUser] = useState(userEmpty);
  const [roleIdSelect, setRoleIdSelect] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadResent, setLoadResent] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [resetPassModal, setResetPassModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [resetData, setResetData] = useState({});
  const [openShowPassword, setOpenShowPassword] = useState(false);

  const constants = stringConstants.settings.security;

  const [isAllTreeData, setIsAllTreeData] = useState([]);
  const [isShowTree, setIsShowTree] = useState('');

  const getListGroups = async () => {
    try {
      const result = await groupsService.getRolues();
      setIsAllTreeData(result);
    } catch (error) {
      setErrorMessage();
    }
  };

  useEffect(() => {
    getListGroups();
  }, []);

  function phoneFormatting(phone) {
    if (phone.length < 13) {
      const cleaned = ('' + phone).replace(/\D/g, '');

      const normValue = `${cleaned.substring(0, 3)}${
        cleaned.length > 3 ? '-' : ''
      }${cleaned.substring(3, 6)}${
        cleaned.length > 6 ? '-' : ''
      }${cleaned.substring(6, 11)}`;

      return normValue;
    }
    return phone.slice(0, 12);
  }
  const handleChange = (item) => {
    const arr = [...teamMembers];
    arr.push(item);
    setTeamMembers(arr);
  };
  const onHandleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'roles' && name !== 'phone') {
      setFormtUser({
        ...formUser,
        [name]: value,
      });
    } else if (name === 'phone') {
      const newValue = phoneFormatting(value);
      setFormtUser({
        ...formUser,
        [name]: newValue,
      });
    } else {
      setRoleIdSelect(value);
    }
  };

  const validate = () => {
    if (currentUser.status !== STATUS_INVITED) {
      if (isEmpty(formUser.first_name)) {
        setWarningMessage(ERROR_FIRST_NAME_REQUIRED);
      } else if (isEmpty(formUser.last_name)) {
        setWarningMessage(ERROR_LAST_NAME_REQUIRED);
      } else {
        return true;
      }

      return false;
    } else {
      return true;
    }
  };
  const onHandleDelete = async () => {
    try {
      await userService.removeUsers([currentUser?.id]);
      history.push('/settings/users');
    } catch (error) {}
  };
  const onHandleClickUpdate = async (e) => {
    e.preventDefault();
    const teams = [];
    teamMembers?.forEach((item) => {
      teams.push({
        isManager: false,
        teamId: item?.id,
      });
    });
    if (validate()) {
      setLoading(true);
      const userUpdate = {
        first_name: formUser.first_name,
        last_name: formUser.last_name,
        avatar: formUser.avatar,
        roleId: roleIdSelect,
        groupId: isShowTree?.id,
        phone: formUser.phone,
        title: formUser.title,
      };
      try {
        const userSuccess = await userService.updateUserInfoById(
          userId,
          userUpdate
        );
        if (userId) {
          await userService.inviteTeamUsers(userId, teams);
        }
        setCurrentUser({
          ...currentUser,
          ...userSuccess,
        });
        setSuccessMessage(USER_UPDATE_SUCCESS);
      } catch (err) {
        setErrorMessage(SERVER_ERROR);
      } finally {
        setLoading(false);
      }
    }
  };

  const onHandleClickResent = async (e) => {
    e.preventDefault();
    setLoadResent(true);

    const data = {
      id: userId,
      email: formUser.email,
    };

    try {
      await userService.resentInvite(data);
      setSuccessMessage(SEND_EMAIL_SUCCESS);
    } catch (err) {
      setErrorMessage(SERVER_ERROR);
    } finally {
      setLoadResent(false);
    }
  };

  const onHandleChangeStatus = async (e) => {
    e.preventDefault();

    const status =
      currentUser?.status === STATUS_ACTIVE
        ? STATUS_SUSPENDED
        : currentUser?.status === STATUS_SUSPENDED
        ? STATUS_ACTIVE
        : currentUser?.status === STATUS_INVITED
        ? 'invite_cancelled'
        : STATUS_INVITED;
    const MESSAGE_ALERT =
      currentUser?.status === STATUS_ACTIVE
        ? USER_SUSPENDED
        : currentUser?.status === STATUS_SUSPENDED
        ? USER_ACTIVE
        : currentUser?.status === STATUS_INVITED
        ? 'Invite Cancelled'
        : 'Invite Sent';
    try {
      const userUpdate = await userService.changeStatus(userId, status);
      setCurrentUser(userUpdate);
      setOpenModal(false);
      setSuccessMessage(MESSAGE_ALERT);
    } catch (err) {
      setErrorMessage(SERVER_ERROR);
    }

    if (currentUser?.status === 'invite_cancelled') {
      const data = {
        id: userId,
        email: formUser.email,
      };

      try {
        await userService.resentInvite(data);
        setSuccessMessage(SEND_EMAIL_SUCCESS);
      } catch (err) {
        setErrorMessage(SERVER_ERROR);
      } finally {
        setLoadResent(false);
      }
    }
  };

  const onImpersonateClick = async (e) => {
    e.preventDefault();
    try {
      await authService.impersonate(userId, true);
      history.push('/');
      window.location.reload(false);
    } catch (err) {
      setErrorMessage(SERVER_ERROR);
    }
  };
  const getUserInfo = async () => {
    try {
      const user = await userService.getUserById(userId);

      setCurrentUser(user);
      setFormtUser(user);
    } catch (err) {
      setErrorMessage(SERVER_ERROR);
    }
  };
  useEffect(() => {
    getUserInfo();
  }, [currentUser.id]);

  const updatePassword = async (password, generate) => {
    try {
      const response = await userService.updatePasswordByUserId(
        currentUser.id,
        generate ? { generate } : { password }
      );
      setResetData(response.data);
      setResetPassModal(false);
      setSuccessMessage(constants.successMessage);
      setOpenShowPassword(true);
    } catch (error) {
      setErrorMessage(constants.errorMessage);
    }
  };
  const onhandleBack = () => {
    history.push('/settings/users');
  };
  return (
    <div>
      <AlertWrapper>
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={warningMessage}
          setMessage={setWarningMessage}
          color="warning"
        />
      </AlertWrapper>
      <PageTitle
        page={
          currentUser?.first_name
            ? `${currentUser?.first_name} ${currentUser?.last_name}`
            : NAME_INVITED_USER
        }
        pageModule="Users and Controls"
      />
      <ModalConfirm
        open={openModal}
        onHandleConfirm={onHandleChangeStatus}
        onHandleClose={() => setOpenModal(false)}
        textBody={
          currentUser?.status === STATUS_ACTIVE
            ? TEXT_INFO_MODAL_SUSPEND
            : currentUser?.status === STATUS_SUSPENDED
            ? TEXT_INFO_MODAL_ACTIVE
            : currentUser?.status === STATUS_INVITED
            ? TEXT_INFO_MODAL_CANCEL
            : TEXT_INFO_MODAL_RESEND
        }
        labelButtonConfirm={
          currentUser?.status === STATUS_ACTIVE
            ? 'Yes, Deactivate'
            : currentUser?.status === STATUS_SUSPENDED
            ? 'Yes, Activate'
            : currentUser?.status === STATUS_INVITED
            ? 'Yes, Cancel'
            : 'Yes, Resend'
        }
        iconButtonConfirm="people"
        colorButtonConfirm={
          currentUser?.status === STATUS_ACTIVE ||
          currentUser?.status === STATUS_INVITED
            ? 'outline-danger'
            : 'outline-success'
        }
      />
      <Card>
        <CardHeader className="d-block">
          <Row noGutters>
            <div className="d-flex align-items-center col-6">
              <h3>Edit Profile</h3>
            </div>
            <div className="d-flex justify-content-end align-items-center col-6">
              <ButtonIcon
                color="outline-primary"
                classnames="mr-2 btn-sm"
                icon="login"
                label="Ghost Login"
                onclick={onImpersonateClick}
              />
              {currentUser?.status && (
                <>
                  <ButtonIcon
                    color={
                      currentUser?.status === STATUS_ACTIVE ||
                      currentUser.status === STATUS_INVITED
                        ? 'outline-danger'
                        : 'outline-success'
                    }
                    classnames="btn-sm ml-2"
                    icon="people"
                    label={
                      currentUser?.status === STATUS_ACTIVE
                        ? 'Deactivate User'
                        : currentUser.status === 'invite_cancelled'
                        ? 'Resend Invite'
                        : currentUser.status === STATUS_INVITED
                        ? 'Cancel Invite'
                        : currentUser.status === 'deactivated'
                        ? 'Activite User'
                        : LABEL_BUTTON_ACTIVATE_USER
                    }
                    onclick={() => setOpenModal(!openModal)}
                  />
                </>
              )}
              <ButtonIcon
                color="danger"
                classnames="ml-2 btn-sm"
                icon="delete"
                label={constants.delete}
                onclick={() => onHandleDelete()}
              />
              <ButtonIcon
                color="outline-primary"
                classnames="ml-2 btn-sm"
                icon="lock"
                label={constants.btnResetPassword}
                onclick={() => setResetPassModal(true)}
                hidden={currentUser.status === STATUS_INVITED}
              />
            </div>
          </Row>
        </CardHeader>
        <InfoCard
          user={currentUser}
          onClickResent={onHandleClickResent}
          loading={loadResent}
        />
        {[isAllTreeData].length > 0 && (
          <FormUser
            onHandleChange={onHandleChange}
            user={formUser}
            formUser={formUser}
            setFormtUser={setFormtUser}
            teamMembers={teamMembers}
            setTeamMembers={setTeamMembers}
            handleChange={handleChange}
            setIsShowTree={setIsShowTree}
            isShowTree={isShowTree}
            setRole={setRoleIdSelect}
            isAllTreeData={isAllTreeData}
            setErrorMessage={setErrorMessage}
          />
        )}
        <CardFooter>
          <div className="text-right">
            <ButtonIcon
              icon="cancel"
              label="Cancel"
              onclick={onhandleBack}
              color="outline-dark"
              classnames="btn-sm mr-2"
            />
            <ButtonIcon
              icon="save"
              label="Save"
              onclick={onHandleClickUpdate}
              loading={loading}
              classnames="btn-sm"
            />
          </div>
        </CardFooter>
      </Card>
      <IdfModalResetPass
        isOpen={resetPassModal}
        buttonLabel={constants.btnResetPasswordModal}
        handleSubmit={(pass, auto) => updatePassword(pass, auto)}
        onHandleCloseModal={() => setResetPassModal(false)}
      />
      <IdfModalShowPass
        isOpen={openShowPassword}
        onHandleCloseModal={() => setOpenShowPassword(false)}
        buttonLabel={constants.btnResetPasswordModal}
        data={resetData}
      />
    </div>
  );
};

export default ResentInvite;
