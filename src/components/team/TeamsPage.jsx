import React, { useState, useEffect } from 'react';
import { Card, Col, Collapse, Row } from 'react-bootstrap';
import MaterialIcon from '../commons/MaterialIcon';
import TeamService from '../../services/teams.service';
import CreateTeamsModal from './CreateTeamsModal';
import stringConstants from '../../utils/stringConstants.json';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import LayoutHead from '../commons/LayoutHead';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import userService from '../../services/user.service';
import { DeactivateTeamModal } from './DeactivateTeamModal';
import TableActions from '../commons/TableActions';
import Pagination from '../Pagination';
import Loading from '../Loading';
import NoDataFound from '../commons/NoDataFound';
import Avatar from '../Avatar';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';
import { DATE_FORMAT } from '../../utils/Utils';

const constants = stringConstants.settings.teams;
const limit = 1000;

export const TeamPage = ({ paginationPage }) => {
  const teamObj = {
    name: '',
    members: [],
    description: '',
  };
  const defaultPagination = { page: 1, limit: 10 };
  const defaultTeamPagination = { page: 1, limit: 5 };
  const [pagination, setPagination] = useState(defaultPagination);
  const [teamPagination, setTeamPagination] = useState(defaultTeamPagination);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [activeTap, setActiveTap] = useState('');
  const [showCreateGroupModal, setShowCreateTeamModal] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [deleteRoleData, setDeleteRoleData] = useState('');
  const [selectedData, setSelectedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isUserId, setIsUserId] = useState('');
  const [isDeactivate, setIsDeactivate] = useState('');
  const [isActivate, setIsActivate] = useState(false);
  const [isDeactivateTeamName, setIsDeactivateTeamName] = useState('');
  const [isUserDataShow, setIsUserDataShow] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [getTeamMember, setIsGetTeamMember] = useState([]);
  const [members, setMembers] = useState([]);

  const [teamForm, setTeamForm] = useState(teamObj);
  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getTeams = async (count) => {
    setShowLoading(true);
    try {
      const result = await TeamService.getTeams({ ...pagination });
      setTeams(result.data);
      setShowLoading(false);
      setPagination(result.pagination);
      setActiveTap('');
    } catch (error) {
      setErrorMessage();
    }
  };

  const getUsers = async (count) => {
    const result = await userService.getUsers(
      { status: 'active' },
      { ...pagination },
      limit
    );
    setUsers(result.data);
  };

  const getTeamUsers = async () => {
    const result = await userService.getUsers(
      { status: 'active' },
      { ...pagination },
      limit
    );
    setTeamUsers(result.data);
    setTeamPagination(result.data.pagination);
    setTeamLoading(false);
  };

  const onTeamLoadMore = () => {
    setTeamLoading(true);
    setTeamPagination((prevState) => ({
      ...prevState,
      page: prevState.page + 1,
    }));
  };

  useEffect(() => {
    getTeams(true);
  }, []);

  useEffect(() => {
    getTeams();
  }, [pagination?.page]);

  useEffect(() => {
    getTeamUsers();
  }, [teamPagination?.page]);

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);

  const closeModal = async () => {
    setShowCreateTeamModal(false);
    setIsDeactivate(false);
    setIsActivate(false);
    setIsUserDataShow([]);
    setActiveTap('');
  };

  const handleModelShow = async () => {
    setShowCreateTeamModal(true);
    getUsers();
    getTeamUsers();
  };

  const handleDeleteModelShow = async (item) => {
    setDeleteRoleData({ ...item, title: item.name });
    setOpenModal(true);
  };

  const handleShowDeavtivateModal = (item) => {
    setIsDeactivateTeamName(item);
    setIsActivate(false);
    setIsDeactivate(true);
  };
  const handleShowActivateModal = (item) => {
    setIsDeactivateTeamName(item);
    setIsActivate(true);
  };

  const handleDelete = async () => {
    try {
      await TeamService.deleteTeam(deleteRoleData.id);
      setOpenModal(false);
      getTeams();
      setErrorMessage(constants.delete.deleted);
    } catch (error) {
      setErrorMessage(constants.failed);
    }
  };

  const handleEditModelShow = async (item) => {
    // calling get users
    const usersResponse = await userService.getUsers(
      { status: 'active' },
      { ...pagination },
      limit
    );
    const teamById = await TeamService.getTeamById(item.id);
    const userData = await TeamService.getTeamMemberById(item.id, {});
    // making user id array
    const usersToSelectList = userData?.data?.map((u) => u.userId);
    const isManagers = userData?.data
      ?.filter((f) => f.isManager === false)
      .map((u) => u.userId);

    // comparing above user id array with actual list that is shown with checkboxes
    // if found then only select that object property to true to show checked in UI
    const checkedUsers = [...usersResponse?.data?.users].map((user) => ({
      ...user,
      isChecked: usersToSelectList.includes(user.id),
    }));
    const checkedMembers = [...usersResponse?.data?.users].map((user) => ({
      ...user,
      isChecked: isManagers.includes(user.id),
    }));
    // updating users so that state and UI get updated too
    setMembers({ users: checkedMembers });
    setUsers({ users: checkedUsers });

    const permissionArray = userData?.data
      .map((group) => {
        const permissionChecked = {
          userId: group.userId,
          isManager: group.isManager,
        };
        return permissionChecked;
      })
      .filter((f) => f.isManager === false);
    setIsGetTeamMember(permissionArray);
    setIsUserDataShow(userData?.data);
    setShowCreateTeamModal(true);
    setTeamForm(item);
    teamById &&
      setSelectedEditData({
        name: teamById?.name || '',
        description: teamById?.description || '',
        id: teamById?.id || '',
        isActive: isActivate,
      });
  };
  const handleUpdateTeam = async () => {
    setIsLoading(true);
    try {
      await TeamService.updateTeam({
        id: isDeactivateTeamName.id || selectedEditData.id,
        name: teamForm?.name,
        description: teamForm?.description,
        isActive: isActivate,
        members: teamForm?.members,
      });
      setIsLoading(false);
      setIsDeactivate(false);
      setIsActivate(false);
      setShowCreateTeamModal(false);
      setSelectedEditData('');
      setTeamForm({
        name: '',
        description: '',
        members: [],
      });
      setMembers('');
      setIsGetTeamMember('');
      if (isActivate) {
        setSuccessMessage(constants.edit.activated);
      } else {
        setSuccessMessage(constants.edit.TeamUpdateSuccess);
      }
      getTeams();
    } catch (error) {
      setErrorMessage(constants.edit.TeamUpdateFailed);
    }
  };

  const createTeam = async (data) => {
    setIsLoading(true);
    try {
      await TeamService.CreateTeam(data);
      getTeams();
      setSuccessMessage(constants.create.TeamCreatedSuccess);
      setIsLoading(false);
      setShowCreateTeamModal(false);
    } catch (error) {
      if (error.response.status === 409) {
        setErrorMessage(constants.create?.TeamCreatedAleready);
      } else {
        setErrorMessage(constants.create?.TeamCreatedFailed);
      }
    } finally {
      setIsLoading(false);
      setShowCreateTeamModal(false);
    }
  };

  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      onClick: handleEditModelShow,
    },
    {
      id: 3,
      title: 'Deactivate',
      icon: 'block',
      onClick: handleShowDeavtivateModal,
      style: 'ml-3 text-danger',
    },
  ];
  const tableActionsLock = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      onClick: handleEditModelShow,
    },
    {
      id: 2,
      title: 'Activate',
      icon: 'refresh',
      onClick: handleShowActivateModal,
      style: 'ml-3',
    },
    {
      id: 3,
      title: 'Delete',
      icon: 'delete',
      onClick: handleDeleteModelShow,
      style: 'ml-3 text-danger',
    },
  ];

  const handleShowCollapse = async (item) => {
    setActiveTap(item.id !== activeTap ? item.id : null);
    if (item.id !== activeTap) {
      setLoadingMembers(true);
      const userData = await TeamService.getTeamMemberById(item.id, {});
      setLoadingMembers(false);
      setIsUserDataShow(userData?.data);
    }
  };

  const loader = () => {
    if (showLoading) return <Loading />;
  };
  const Title = () => {
    return <div className="text-gray-search font-size-md">No teams exist.</div>;
  };

  const getTeamName = (team) => {
    const name = team?.name || '';
    const teamNameParts = name.split(' ');
    const [first_name, last_name] =
      teamNameParts.length > 1 ? teamNameParts : [name];

    return {
      first_name,
      last_name,
    };
  };
  return (
    <>
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <DeleteConfirmationModal
        showModal={openModal}
        setShowModal={setOpenModal}
        setShowRolesData={setSelectedData}
        itemsConfirmation={[deleteRoleData]}
        itemsReport={[]}
        event={handleDelete}
        data={teams}
        setSelectedCategories={() => {}}
      />
      <LayoutHead
        onHandleCreate={handleModelShow}
        alignTop="position-absolute -top-55"
        buttonLabel={constants.edit.add}
        selectedData={selectedData}
        headingTitle=""
        dataInDB={teams}
        headingText=""
        onDelete={setOpenModal.bind(true)}
      />
      <Card className="p-3 teams-page">
        {showLoading ? (
          loader()
        ) : (
          <>
            {teams.length === 0 ? (
              <NoDataFound
                icon="groups"
                containerStyle="text-gray-search my-6 py-6"
                title={<Title />}
              />
            ) : (
              teams?.map((item, i) => (
                <div className="w-100" key={`teams-${i}`}>
                  <Row
                    className={`mx-0 p-3 py-2 align-items-center border-bottom cursor-pointer bg-gray-200`}
                    onClick={() => handleShowCollapse(item)}
                  >
                    <span className="pr-2">
                      <Avatar user={{ ...item, ...getTeamName(item) }} />
                    </span>
                    <div>
                      <span className="text-capitalize h5 mb-0 font-weight-bold">
                        {item.name}
                      </span>
                      <p className="text-capitalize  mb-0 font-weight-medium">
                        {moment(item.updatedAt).format(DATE_FORMAT)}
                      </p>
                    </div>
                    <span className="ml-auto d-flex align-items-center">
                      <TableActions
                        item={{ ...item, title: name }}
                        actions={
                          item.isActive ? tableActions : tableActionsLock
                        }
                      />
                      <MaterialIcon
                        icon={
                          activeTap === item.id
                            ? 'keyboard_arrow_up'
                            : 'keyboard_arrow_down'
                        }
                        clazz="pl-3"
                      />
                    </span>
                  </Row>
                  <Collapse in={activeTap === item.id}>
                    <div className="p-3">
                      <h4>Team Manager </h4>

                      {loadingMembers ? (
                        <div className="my-1">
                          <Skeleton height="5" width={250} />
                        </div>
                      ) : (
                        <>
                          {isUserDataShow.map((user, i) => (
                            <p key={`manage-team_${i}`}>
                              {user.isManager && (
                                <>
                                  {' '}
                                  <MaterialIcon
                                    icon={'person'}
                                    clazz="mr-1"
                                  />{' '}
                                  {user?.user?.first_name !== null
                                    ? `${user?.user?.first_name} ${user?.user.last_name}`
                                    : user?.user.email}
                                </>
                              )}
                            </p>
                          ))}
                        </>
                      )}
                      <h4>Updated At</h4>
                      {loadingMembers ? (
                        <div className="d-flex flex-column my-1">
                          <Skeleton height="5" width={250} />{' '}
                        </div>
                      ) : (
                        <p className="text-capitalize font-weight-medium">
                          <MaterialIcon icon={'update'} />{' '}
                          {moment(item.updatedAt).format(DATE_FORMAT)}
                        </p>
                      )}
                      <h4>Team Description</h4>
                      <p>{item.description}</p>
                    </div>
                  </Collapse>
                </div>
              ))
            )}
            <Row className="mt-4">
              <Col sm className="mb-2 mb-sm-0" />
              <Col className="col-sm-auto">
                <Pagination
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                />
              </Col>
            </Row>
          </>
        )}
        <DeactivateTeamModal
          handleShowModal={isDeactivate}
          handleHideModal={closeModal}
          handleUpdateTeam={handleUpdateTeam}
          isTeamName={isDeactivateTeamName}
          isActivate={isActivate}
          isLoading={isLoading}
        />
        <CreateTeamsModal
          showModal={showCreateGroupModal}
          setShowModal={closeModal}
          data={teamUsers?.users}
          createGroup={createTeam}
          setErrorMessage={setErrorMessage}
          isUserId={isUserId}
          getTeams={getTeams}
          setIsUserId={setIsUserId}
          onChangeDrop={(e) =>
            e?.target ? setTeamUsers(e.target.value) : null
          }
          isUserDataShow={isUserDataShow}
          userData={users?.users}
          setSelectedEditData={setSelectedEditData}
          updateTeam={handleUpdateTeam}
          selectData={selectedEditData}
          teamPagination={teamPagination}
          onTeamLoadMore={onTeamLoadMore}
          teamLoading={teamLoading}
          isLoading={isLoading}
          members={members?.users}
          setTeamForm={setTeamForm}
          teamForm={teamForm}
          getTeamMember={getTeamMember}
          setIsGetTeamMember={setIsGetTeamMember}
        />
      </Card>
    </>
  );
};
