import React from 'react';
import { useHistory } from 'react-router';

import Table from '../GenericTable';
import routes from '../../utils/routes.json';
import MoreActions from '../MoreActions';

const RoleTable = ({
  dataSource = [],
  selectAll,
  setSelectAll,
  selectedData,
  setSelectedData,
  paginationInfo,
  setSelectedItem,
  onPageChange,
  dataInDB,
  setShowCreateRoleModal,
  sortingTable,
  setShowModal,
  sortingOrder,
}) => {
  const history = useHistory();

  const handleEditAction = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };
  const columns = [
    {
      key: 'roleName',
      orderBy: 'name',
      component: 'Profile Name',
    },
    {
      key: 'description',
      orderBy: 'description',
      component: 'Profile Description',
    },
    {
      key: 'users_count',
      orderBy: 'users_count',
      component: 'Total Users',
    },
    {
      key: 'action',
      component: 'Action',
    },
  ];

  const data = dataSource.map((dataItem) => ({
    ...dataItem,
    dataRow: [
      {
        key: 'name',
        component: (
          <h5
            className="pl-3"
            onClick={() => {
              history.push(`${routes.roles}/${dataItem.id}`);
            }}
          >
            {dataItem.name}
          </h5>
        ),
        id: dataItem.id,
      },
      {
        key: 'description',
        component: (
          <span
            onClick={() => {
              history.push(`${routes.roles}/${dataItem.id}`);
            }}
          >
            {dataItem.description}
          </span>
        ),
      },
      {
        key: 'users_count',
        component: <span>{dataItem?.totalUsers}</span>,
      },
      {
        key: 'action',
        component: (
          <div className="d-flex align-items-center">
            <a className={`icon-hover-bg cursor-pointer`}>
              <MoreActions
                icon="more_vert"
                items={[
                  {
                    id: 'edit',
                    icon: 'task_alt',
                    name: 'Clone',
                    className: dataItem.id,
                  },
                ]}
                onHandleEdit={() => handleEditAction(dataItem)}
                toggleClassName="w-auto p-0 h-auto"
              />
            </a>
          </div>
        ),
      },
    ],
  }));

  return (
    <div className="table-responsive-md datatable-custom">
      <Table
        checkbox={false}
        columns={columns}
        data={data}
        selectedData={selectedData}
        setSelectedData={setSelectedData}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        paginationInfo={paginationInfo}
        onPageChange={onPageChange}
        clickableCell
        emptyDataText="No Profiles available yet."
        title="Profile"
        dataInDB={dataInDB}
        toggle={() => setShowCreateRoleModal(true)}
        sortingTable={sortingTable}
        sortingOrder={sortingOrder}
      />
    </div>
  );
};

export default RoleTable;
