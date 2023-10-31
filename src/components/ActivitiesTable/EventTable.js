import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
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
const EventTable = ({
  paginationPage,
  tabType,
  isFilterCheck,
  order,
  setOrder,
  pagination,
  showLoading,
  dataInDB,
  setPagination,
  setActivatedTab,
  selectedData,
  setSelectedData,
  handleEditActivity,
  setShowDeleteOrgModal,
  deleteResults,
  showDeleteOrgModal,
  setDeleteResults,
  getData,
  setErrorMessage,
  setSuccessMessage,
  allData,
  handleClearSelection,
  selectAll,
  setSelectAll,
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
      key: 'name',
      orderBy: 'name',
      component: 'Title ',
      width: 450,
    },
    {
      key: 'start_date',
      orderBy: 'start_date',
      component: 'From',
    },
    {
      key: 'end_date',
      orderBy: 'end_date',
      component: 'To',
    },
    {
      key: '',
      orderBy: '',
      component: 'Related To',
    },
    {
      key: '',
      orderBy: '',
      component: 'Host',
    },
    {
      key: '',
      orderBy: '',
      component: 'Action',
    },
  ];
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
      onClick: handleEditActivity,
    },
  ];
  // const dateFormat = (date) => {
  //   const createdDate = new Date(date);
  //   return createdDate;
  // };
  const data = allData?.map((event) => ({
    ...event,
    dataRow: [
      {
        key: 'name',
        component: (
          <span
            className={`pl-3 fw-bold ${event?.done ? 'text-line-through' : ''}`}
          >
            {event?.name}
          </span>
        ),
      },
      {
        key: 'start_date',
        component: <span>{dateWithoutTZ(event?.start_date)}</span>,
      },
      {
        key: 'end_date',
        component: <span>{dateWithoutTZ(event?.end_date)}</span>,
      },
      {
        key: 'related_to',
        component: getAction(event),
      },
      {
        key: 'owner',
        component: GetOwnersAction(event),
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <TableActions
              item={{ ...event, title: name }}
              actions={tableActions}
            />
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                items={[
                  {
                    permission,
                    id: 'remove',
                    icon: 'delete',
                    name: 'Delete',
                  },
                ]}
                onHandleRemove={() => handleDelete(event)}
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
      event: 3,
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
                  emptyDataText="No event available yet."
                  title="event"
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
          tableActions={tableActions}
        />
      )}
    </div>
  );
};

export default EventTable;
