import React, { useEffect, useState } from 'react';
import { capitalize } from 'lodash';
import { Link, useHistory } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import groupService from '../../services/groups.service';
import userService from '../../services/user.service';
import { paginationDefault } from '../../utils/constants';
import { setDateFormat } from '../../utils/Utils';
import Avatar from '../Avatar';
import Table from '../GenericTable';
import { DataFilters } from '../DataFilters';
import Filters from './Filters';
import { changePaginationPage } from '../../views/Deals/contacts/utils';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import InvitationModal from '../modal/InvitationModal.component';
import { usersColumns } from './ManageUsers.constants';
import LayoutHead from '../commons/LayoutHead';
import { sortingTable } from '../../utils/sortingTable';
import DeleteModal from '../modal/DeleteModal';
import stringConstants from '../../utils/stringConstants.json';
import authService from '../../services/auth.service';
import MoreActions from '../MoreActions';
import TableSkeleton from '../commons/TableSkeleton';

const constants = stringConstants.settings.users;

const UsersTable = ({ paginationPage, setPaginationPage }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState({});
  const [pagination, setPagination] = useState(paginationDefault);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [modified, setModified] = useState(false);
  const [deleteResults, setDeleteResults] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isShowTreeView, setIsShowTreeView] = useState('');
  const history = useHistory();
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('statuses');
  const [filterOptionSelected, setFilterOptionSelected] = useState({
    id: 'select2-4dd5-result-all',
    title: 'All',
    name: 'all',
  });
  const onImpersonateClick = async (user) => {
    try {
      await authService.impersonate(user?.id, true);
      history.push('/');
      window.location.reload(false);
    } catch (err) {
      setErrorMessage('Server error!! try again or contact to support');
    }
  };

  const onHandleChangeStatus = async (user) => {
    const userStatus = user.status;
    const status =
      userStatus === 'active'
        ? 'deactivated'
        : userStatus === 'deactivated'
        ? 'active'
        : userStatus === 'invited'
        ? 'invite_cancelled'
        : 'invited';
    const MESSAGE_ALERT =
      userStatus === 'active'
        ? 'Deactivated User'
        : userStatus === 'deactivated'
        ? 'User Active'
        : userStatus === 'invited'
        ? 'Cancelled Invite'
        : 'Invite Sent';
    try {
      await userService.changeStatus(user?.id, status);
      setSuccessMessage(MESSAGE_ALERT);
      getUsers();
    } catch (err) {
      setErrorMessage('Server error!! try again or contact to support');
    }

    if (userStatus === 'invite_cancelled') {
      const data = {
        id: user?.id,
        email: user?.email,
      };

      try {
        await userService.resentInvite(data);
        setSuccessMessage('Email was sent successfully');
      } catch (err) {
        setErrorMessage('Server error!! try again or contact to support');
      }
    }
  };
  const onHandleReInvite = async (user) => {
    const userStatus = user.status;
    const status = 'invited';
    const MESSAGE_ALERT = 'Invite Sent';
    try {
      await userService.changeStatus(user?.id, status);
      setSuccessMessage(MESSAGE_ALERT);
      getUsers();
    } catch (err) {
      setErrorMessage('Server error!! try again or contact to support');
    }

    if (userStatus === 'invite_cancelled') {
      const data = {
        id: user?.id,
        email: user?.email,
      };

      try {
        await userService.resentInvite(data);
        setSuccessMessage('Email was sent successfully');
      } catch (err) {
        setErrorMessage('Server error!! try again or contact to support');
      }
    }
  };
  useEffect(() => {
    getUsers(true);
  }, []);

  const getRolues = async () => await groupService.getRolues();
  const getListGroups = async () => {
    try {
      const result = await getRolues();
      setAllGroups(result);
    } catch (error) {
      setErrorMessage();
    }
  };

  useEffect(() => {
    getListGroups();
  }, []);

  useEffect(() => {
    getUsers();
  }, [filter, paginationPage, order]);

  const getUsers = async (count) => {
    setShowLoading(true);

    if (filter.status === 'all') {
      delete filter.status;
    }

    if (!filter.role) {
      delete filter.role;
    }
    if (!filter.roleId) {
      delete filter.roleId;
    }

    const users = await userService
      .getUsers(
        { ...filter, order },
        {
          page: paginationPage.page,
          limit: 10,
          self: true,
        }
      )
      .catch((err) => console.log(err));

    const { data } = users || {};

    setAllUsers(data?.users);
    setPagination(data?.pagination);
    if (count) setDataInDB(Boolean(data?.pagination?.totalPages));

    setShowLoading(false);
  };

  const loader = () => {
    if (showLoading) return <TableSkeleton cols={5} rows={10} />;
  };

  const clearFilters = () => {
    setFilterOptionSelected({
      id: 'select2-4dd5-result-all',
      title: 'All',
      name: 'all',
    });
    setFilter({});
  };

  const onHandleFilterUsers = (role) => {
    setFilter({
      ...filter,
      roleId: role.id,
    });
    setFilterOptionSelected({ ...role, title: role.name, icon: '' });
    setOpenFilter(false);
  };

  const handleFilterSelect = (e, item) => {
    setFilterOptionSelected(item);
    setFilter({ ...filter, status: item.name });
    setOpenFilter(false);
  };
  const handleDeleteUser = (user) => {
    const arr = [...selectedData];
    arr.push(user?.id);
    setSelectedData(arr);
    setShowModal(true);
  };
  const onHandleDelete = async () => {
    try {
      const response = await userService.removeUsers(selectedData);
      setDeleteResults(response);
      setShowReport(true);
      getUsers();
    } catch (error) {}
  };

  const getActionItemsByUserStatus = (user) => {
    const actions = [
      {
        id: 'edit',
        name:
          user?.status === 'invited'
            ? 'Cancel Invite'
            : user?.status === 'deactivated'
            ? 'Activate User'
            : user?.status === 'active'
            ? 'Deactivate User'
            : 'Resend Invite',
        icon: 'block',
      },
      {
        id: 'remove',
        name: 'Delete',
        icon: 'delete',
      },
    ];
    if (user?.status === 'invited') {
      actions.push({
        id: 'reInvite',
        name: 'Resend Invite',
        icon: 'refresh',
      });
    }
    if (user?.status === 'active') {
      actions.push({
        id: 'add',
        name: 'Ghost Login',
        icon: 'login',
      });
    }
    return actions;
  };

  const data = allUsers?.map((user) => ({
    ...user,
    dataRow: [
      {
        key: 'user',
        component: (
          <Link
            className="text-black fw-bold"
            to={`/settings/users/${user.id}`}
          >
            <div className="media ml-2">
              <div className="avatar avatar-sm avatar-circle mr-3">
                <Avatar user={user} />
              </div>
              <div className="media-body">
                <div>
                  <h5 className="mb-0">
                    {!user.first_name && !user.last_name
                      ? 'Invited'
                      : `${user.first_name || ''} ${user.last_name || ''}`}
                  </h5>
                  <span className="d-block text-muted font-weight-medium font-size-sm">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ),
      },
      {
        key: 'role',
        component: <span>{user?.role?.name}</span>,
      },
      {
        key: 'group',
        component: <span>{user?.group?.name}</span>,
      },
      {
        key: 'status',
        component: (
          <span>
            {capitalize(
              user?.status === 'invite_cancelled'
                ? 'cancelled invite'
                : user?.status
            )}
          </span>
        ),
      },
      {
        key: 'last_login',
        component: (
          <span>
            {user.last_access ? setDateFormat(user.last_access) : 'N/A'}
          </span>
        ),
      },
      {
        component: (
          <span>
            {
              <MoreActions
                items={getActionItemsByUserStatus(user)}
                onHandleEdit={() => onHandleChangeStatus(user)}
                onHandleReinvite={() => onHandleReInvite(user)}
                onHandleAdd={() => onImpersonateClick(user)}
                onHandleRemove={() => handleDeleteUser(user)}
              />
            }
          </span>
        ),
      },
    ],
  }));

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  return (
    <>
      <DeleteModal
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        showModal={showModal}
        setShowModal={setShowModal}
        event={onHandleDelete}
        constants={constants.delete}
        modified={modified}
        setModified={setModified}
        type="contacts"
        data={data}
        results={deleteResults}
        setResults={setDeleteResults}
        showReport={showReport}
        setShowReport={setShowReport}
      />
      <LayoutHead
        alignTop="position-absolute -top-55"
        onHandleCreate={() => setShowInvitationModal(true)}
        buttonLabel={'Add User'}
        selectedData={selectedData}
        onDelete={setShowModal.bind(true)}
        labelButtonDelete="Cancel Invites"
        allRegister={`${pagination.count || 0} Users`}
        toggle={() => setShowInvitationModal(true)}
        dataInDB={dataInDB}
      >
        <Filters
          filterOptionSelected={filterOptionSelected}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          filterTabs={filterTabs}
          setFilterTabs={setFilterTabs}
          handleFilterSelect={handleFilterSelect}
          onHandleFilterUsers={onHandleFilterUsers}
          clearFilters={clearFilters}
        />
      </LayoutHead>

      <Card className="mb-5">
        <Card.Header>
          <DataFilters
            filterSelected={filter}
            setFilterSelected={setFilter}
            searchPlaceholder="Search users"
            paginationPage={paginationPage}
            setPaginationPage={setPaginationPage}
          />
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive-md datatable-custom">
            <div
              id="datatable_wrapper"
              className="dataTables_wrapper no-footer"
            >
              {showLoading ? (
                loader()
              ) : (
                <Table
                  columns={usersColumns}
                  data={data}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  onPageChange={(newPage) =>
                    changePaginationPage(newPage, setPaginationPage)
                  }
                  paginationInfo={pagination}
                  usePagination
                  toggle={() => setShowInvitationModal(true)}
                  emptyDataText="No users available yet."
                  title="user"
                  dataInDB={dataInDB}
                  sortingTable={sortTable}
                  sortingOrder={order}
                  isShowTreeView={isShowTreeView}
                  setIsShowTreeView={setIsShowTreeView}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <InvitationModal
        showModal={showInvitationModal}
        getUsers={getUsers}
        setShowModal={setShowInvitationModal}
        data={allGroups}
        isShowTreeView={isShowTreeView}
        setIsShowTreeView={setIsShowTreeView}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />

      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};

export default UsersTable;
