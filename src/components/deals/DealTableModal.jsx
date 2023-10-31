import React, { useState } from 'react';

import Table from '../GenericTable';
import { isToFixedNoRound } from '../../utils/Utils';
import { Link } from 'react-router-dom';
import routes from '../../utils/routes.json';

const DealTableModal = ({
  data = [],
  paginationInfo,
  onPageChange,
  handleEdit,
  selectedCourses,
  setSelectedCourses,
  onClickRow,
  dataInDB,
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const columns = [
    {
      key: 'title',
      component: 'Title',
    },
    {
      key: 'stage',
      component: 'stages',
    },
    {
      key: 'value',
      component: 'value',
    },
    {
      key: 'organization',
      component: 'organization',
    },
    {
      key: 'contactPerson',
      component: 'Contact Person',
    },
  ];

  const rows = data.map((item) => {
    const { id, name, amount, organization, contact, stage } = item;
    const response = {
      ...item,
      dataRow: [
        {
          key: 'title',
          component: (
            <Link
              to={`${routes.dealsPipeline}/${id}`}
              className="text-block pl-3"
            >
              {name}
            </Link>
          ),
        },
        {
          key: 'stage',
          component: <span>{stage?.name}</span>,
        },
        {
          key: 'value',
          component: <span>{isToFixedNoRound(amount, 2)}</span>,
        },
        {
          key: 'organization',
          component: <span>{organization?.name}</span>,
        },
        {
          key: 'contactPerson',
          component: (
            <Link
              to={`${routes.contacts}/${contact?.id}/profile`}
              className="text-block"
            >
              {contact?.first_name} {contact?.last_name}
            </Link>
          ),
        },
      ],
    };
    return response;
  });

  return (
    <Table
      selectedData={selectedCourses}
      setSelectedData={setSelectedCourses}
      selectAll={selectAll}
      setSelectAll={setSelectAll}
      columns={columns}
      data={rows}
      paginationInfo={paginationInfo}
      onPageChange={onPageChange}
      onHandleEdit={handleEdit}
      onClick={onClickRow}
      emptyDataText="No deals available yet."
      title="Deals"
      usePagination={false}
      dataInDB={dataInDB}
    />
  );
};

export default DealTableModal;
