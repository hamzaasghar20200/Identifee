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
import { ShortDescription } from '../ShortDescription';
import OwnerAvatar from './OwnerAvatar';
const constants = stringConstants.tasks;
const AllActivitiesTable = ({
  paginationPage,
  order,
  setActivatedTab,
  setOrder,
  pagination,
  showLoading,
  dataInDB,
  setPagination,
  selectedData,
  setSelectedData,
  setShowDeleteOrgModal,
  deleteResults,
  tabType,
  showDeleteOrgModal,
  setDeleteResults,
  handleClearSelection,
  selectAll,
  getData,
  setErrorMessage,
  setSuccessMessage,
  allData,
  isFilterCheck,
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

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);
  const activityDetail = async (content) => {
    const { data } = await activityService.getSingleActivity(
      content.id ? content.id : content
    );
    setActivityObj(data);
    setIsShow(true);
  };
  const markAsDone = async (id) => {
    try {
      await activityService.markAsCompleted(id);
      getData('task');
      setActivatedTab({
        task: 1,
      });
      setSuccessMessage(constants.completed);
    } catch (error) {
      setErrorMessage(constants.errorUpdatedActivity);
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
  const GetCreateByOwners = (task) => {
    if (task) {
      return <OwnerAvatar item={task} />;
    }
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
  const permission = {
    collection: 'activities',
    action: 'delete',
  };
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      permission: {
        collection: 'activities',
        action: 'edit',
      },
      onClick: (e) => {
        setIsShow(false);
        handleEditActivity(e);
      },
    },
  ];
  const columns = [
    {
      key: 'name',
      orderBy: 'name',
      component: 'Activity Name ',
    },
    {
      key: 'description',
      orderBy: '',
      component: 'Description ',
      width: '195px',
    },
    {
      key: 'created_by',
      orderBy: '',
      component: 'Created By',
    },
    {
      key: '',
      orderBy: '',
      component: 'Activity Owner',
    },
    {
      key: 'end_date',
      orderBy: 'end_date',
      component: 'Due Date',
    },
    {
      key: 'done',
      orderBy: 'done',
      component: 'Status',
    },
    {
      key: 'priority',
      orderBy: 'priority',
      component: 'Priority',
    },
    {
      key: 'related_to',
      orderBy: '',
      component: 'Related To',
    },
    {
      key: 'action',
      orderBy: '',
      component: '',
    },
  ];
  const data = allData?.map((activity) => ({
    ...activity,
    dataRow: [
      {
        key: 'name',
        component: (
          <span className={`pl-3 fw-bold d-flex align-items-center`}>
            <MaterialIcon
              filled={true}
              icon={
                activity?.type === 'task'
                  ? 'task_alt'
                  : activity?.type === 'event'
                  ? 'event'
                  : 'call'
              }
              clazz="text-primary pr-1 fs-6 ml-n1"
            />
            <span className={`${activity?.done ? 'text-line-through' : ''}`}>
              {activity?.name}
            </span>
          </span>
        ),
      },
      {
        key: 'description',
        component: (
          <ShortDescription content={activity?.description} limit={30} />
        ),
      },
      {
        key: 'created_by',
        component: GetCreateByOwners(activity),
      },
      {
        key: 'owner',
        component: GetOwnersAction(activity),
      },
      {
        key: 'end_date',
        component: <span>{dateWithoutTZ(activity?.start_date)}</span>,
      },
      {
        key: 'done',
        component: <span>{activity?.done ? 'Completed' : 'In Progress'}</span>,
      },
      {
        key: 'priority',
        component: (
          <span>
            {activity?.priority ? (
              <div className="d-flex align-items-center">
                <MaterialIcon
                  filled={true}
                  icon="flag"
                  clazz="text-red fs-6 pr-1 ml-n1"
                />
                High
              </div>
            ) : (
              'Normal'
            )}
          </span>
        ),
      },
      {
        key: 'related_to',
        component: getAction(activity),
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <TableActions
              item={{ ...activity, title: name }}
              actions={tableActions}
            />
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                items={[
                  {
                    permission: {
                      collection: 'activities',
                      action: 'edit',
                    },
                    id: 'edit',
                    icon: 'task_alt',
                    name: 'Mark as done',
                    className: activity.done ? 'd-none' : '',
                  },
                  {
                    permission,
                    id: 'remove',
                    icon: 'delete',
                    name: 'Delete',
                  },
                ]}
                onHandleRemove={() => handleDelete(activity)}
                onHandleEdit={() => markAsDone(activity.id)}
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
      all: 1,
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
                <>
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
                    emptyDataText="No Task available yet."
                    title="Task"
                    dataInDB={dataInDB}
                    showTooltip={showTooltip}
                    setShowTooltip={setShowTooltip}
                    sortingTable={sortTable}
                    sortingOrder={order}
                    onClick={activityDetail}
                    stats={getStats}
                  />
                </>
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
        description={`Are you sure you want to delete this ${deleteResults?.type}`}
        event={openDeleteModal}
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

export default AllActivitiesTable;
