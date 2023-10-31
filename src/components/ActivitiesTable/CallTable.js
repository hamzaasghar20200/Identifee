import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import stringConstants from '../../utils/stringConstants.json';
import { sortingTable } from '../../utils/sortingTable';
import routes from '../../utils/routes.json';
import Table from '../GenericTable';
import TableSkeleton from '../commons/TableSkeleton';
import activityService from '../../services/activity.service';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import { dateWithoutTZ } from '../../utils/Utils';
import { Link } from 'react-router-dom';
import MaterialIcon from '../commons/MaterialIcon';
import MoreActions from '../MoreActions';
import TableActions from '../commons/TableActions';
import { ActivityDetail } from './activityDetail';
import OwnerAvatar from './OwnerAvatar';
const constants = stringConstants.calls;
const CallTable = ({
  paginationPage,
  order,
  setOrder,
  pagination,
  tabType,
  isFilterCheck,
  showLoading,
  setActivatedTab,
  dataInDB,
  setPagination,
  selectedData,
  setSelectedData,
  setShowDeleteOrgModal,
  deleteResults,
  showDeleteOrgModal,
  setDeleteResults,
  handleClearSelection,
  selectAll,
  setErrorMessage,
  setSuccessMessage,
  getData,
  allData,
  setSelectAll,
  handleEditActivity,
  getStats,
}) => {
  const [isShow, setIsShow] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [activityObj, setActivityObj] = useState();
  useEffect(() => {
    getData(tabType);
  }, [pagination?.page, order, isFilterCheck?.filter, tabType]);
  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };
  const activityDetail = async (content) => {
    const { data } = await activityService.getSingleActivity(
      content.id ? content.id : content
    );
    setActivityObj(data);
    setIsShow(true);
  };
  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);
  const markAsDone = async (id) => {
    try {
      await activityService.markAsCompleted(id);
      getData('call');
      setActivatedTab({
        call: 2,
      });
      setSuccessMessage(constants.completed);
    } catch (error) {
      setErrorMessage(constants.errorCallActivity);
    }
  };
  const cancelCall = async (id) => {
    try {
      await activityService.cancelActivity(id);
      getData('call');
      setActivatedTab({
        call: 2,
      });

      setSuccessMessage(constants.canceled);
    } catch (error) {
      setErrorMessage(constants.errorCallActivity);
    }
  };
  const permission = {
    collection: 'activities',
    action: 'delete',
  };
  const getAction = (content) => {
    if (content?.organization) {
      return (
        <Link
          to={`${routes.companies}/${content?.organization?.id}/organization/profile`}
          className="text-black fw-bold"
        >
          {content?.organization && (
            <>
              <MaterialIcon icon="domain" /> {content?.organization?.name}
            </>
          )}
        </Link>
      );
    } else if (content?.contact) {
      const name = `${content?.contact?.first_name} ${content?.contact?.last_name}`;
      return (
        <Link
          to={`${routes.contacts}/${content?.contact?.id}/profile`}
          className="text-black fw-bold"
        >
          {content && (
            <>
              <MaterialIcon icon="people" /> {name}
            </>
          )}
        </Link>
      );
    } else if (content?.deal) {
      return (
        <Link
          to={`${routes.dealsPipeline}/${content?.deal?.id}`}
          className="text-black fw-bold"
        >
          {content?.deal && (
            <>
              <MaterialIcon icon="monetization_on" /> {content?.deal?.name}
            </>
          )}
        </Link>
      );
    }
  };

  const GetOwnersAction = (task) => {
    if (task) {
      return (
        <div className="align-items-end more-owners gap-1 align-items-center">
          {task?.owners?.map((item) => (
            <div key={item?.id}>
              <OwnerAvatar item={item} isMultiple={true} />
            </div>
          ))}
        </div>
      );
    }
  };
  const columns = [
    {
      key: 'user',
      orderBy: 'name',
      component: 'Meeting Participants',
    },
    {
      key: 'type',
      orderBy: 'type',
      component: 'Call Type',
    },
    {
      key: 'start_date',
      orderBy: 'start_date',
      component: 'Call Date',
    },
    {
      key: 'done',
      orderBy: 'done',
      component: 'Status',
    },
    {
      key: '',
      orderBy: '',
      component: 'Customer Name',
    },
    {
      key: '',
      orderBy: '',
      component: 'Call Owner',
    },
    {
      key: '',
      orderBy: '',
      component: 'Action',
    },
  ];
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      permission: {
        collection: 'activities',
        action: 'edit',
      },
      onClick: handleEditActivity,
    },
  ];
  const data = allData?.map((call) => ({
    ...call,
    dataRow: [
      {
        key: 'name',
        component: (
          <span
            className={`pl-3 fw-bold d-block ${
              call?.done ? 'text-line-through' : ''
            }`}
          >
            {call?.name}
          </span>
        ),
      },
      {
        key: 'call_type',
        component: <span>{call?.type}</span>,
      },
      {
        key: 'start_date',
        component: <span>{dateWithoutTZ(call?.start_date)}</span>,
      },
      {
        key: 'status',
        component: <span>{call?.done ? 'Completed' : 'In Progress'}</span>,
      },
      {
        key: 'related_to',
        component: getAction(call),
      },
      {
        key: 'owner',
        component: GetOwnersAction(call),
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <TableActions
              item={{ ...call, title: name }}
              actions={tableActions}
            />
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                permission={permission}
                items={[
                  {
                    id: 'edit',
                    icon: 'check_circle',
                    name: 'Mark as done',
                    className: call.done
                      ? 'd-none'
                      : call.canceledOn
                      ? 'd-none'
                      : '',
                  },
                  {
                    id: 'download',
                    icon: 'call',
                    name: 'Cancel Call',
                    className: call.canceledOn
                      ? 'd-none'
                      : call.done
                      ? 'd-none'
                      : '',
                  },
                  {
                    id: 'add',
                    icon: 'update',
                    name: 'Reschedule Call',
                    className: call.done
                      ? 'd-none'
                      : call.canceledOn
                      ? 'd-none'
                      : '',
                  },
                  {
                    permission,
                    id: 'remove',
                    icon: 'delete',
                    name: 'Delete',
                  },
                ]}
                onHandleRemove={() => handleDelete(call)}
                onHandleEdit={() => markAsDone(call.id)}
                onHandleDownload={() => cancelCall(call.id)}
                onHandleAdd={() => handleEditActivity(call)}
                toggleClassName="w-auto p-0 h-auto"
              />
            </a>
          </div>
        ),
      },
    ],
  }));

  const sortTable = ({ name }) => {
    if (name === 'action') return null;
    sortingTable({ name, order, setOrder });
  };
  const loader = () => {
    if (showLoading) return <TableSkeleton cols={6} rows={10} />;
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const deleteOrganizations = async () => {
    await activityService
      .deleteActivity(
        selectedData.length > 0 ? selectedData : deleteResults?.id
      )
      .then(() => {
        setSuccessMessage(
          `${capitalizeFirstLetter(deleteResults.type)} has been deleted`
        );
        getData('task');
        setShowDeleteOrgModal(false);
        handleClearSelection();
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
    setActivatedTab({
      call: 4,
    });
    setShowDeleteOrgModal(false);
  };
  const openDeleteModal = async () => {
    setShowDeleteOrgModal(true);
    await deleteOrganizations();
  };
  const handleDelete = (data) => {
    setShowDeleteOrgModal(true);
    setDeleteResults(data);
  };
  useEffect(() => {
    if (!showDeleteOrgModal) {
      handleClearSelection();
    }
  }, [!showDeleteOrgModal]);
  return (
    <div>
      <Card className="mb-5">
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
                  stickyColumn="stickyColumn"
                  columns={columns}
                  data={data}
                  setDeleteResults={setDeleteResults}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  emptyDataText="No call available yet."
                  title="call"
                  dataInDB={dataInDB}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  sortingTable={sortTable}
                  sortingOrder={order}
                  onClick={activityDetail}
                  stats={getStats}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      <DeleteConfirmationModal
        showModal={showDeleteOrgModal}
        setShowModal={setShowDeleteOrgModal}
        setShowRolesData={setSelectedData}
        itemsConfirmation={[deleteResults]}
        itemsReport={[]}
        event={openDeleteModal}
        description={`Are you sure you want to delete this ${deleteResults?.type}`}
        data={allData}
        setSelectedCategories={() => {}}
      />
      {isShow && (
        <ActivityDetail
          activityDetail={activityDetail}
          isShow={isShow}
          setIsShow={setIsShow}
          data={activityObj}
          markAsDone={markAsDone}
          tableActions={tableActions}
        />
      )}
    </div>
  );
};

export default CallTable;
