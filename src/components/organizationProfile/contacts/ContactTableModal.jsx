import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../../../utils/routes.json';
import Table from '../../GenericTable';

const ContactTableModal = ({
  data = [],
  paginationInfo,
  onPageChange,
  handleEdit,
  selectedCourses,
  setSelectedCourses,
  profileInfo,
  onClickRow,
  dataInDB,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const columns = [
    {
      key: 'name',
      component: 'Name',
    },
    {
      key: 'title',
      component: 'Title',
    },
    {
      key: 'email',
      component: 'Email',
    },
    {
      key: 'organization',
      component: 'Company',
    },
    {
      key: 'phone',
      component: 'Phone',
    },
  ];

  const rows = data.map((item) => {
    const { id, first_name, last_name, email_work, phone_mobile, title } = item;
    const response = {
      ...item,
      dataRow: [
        {
          key: 'name',
          component: (
            <Link to={`${routes.contacts}/${id}`} className="text-block pl-3">
              {first_name} {last_name || ''}
            </Link>
          ),
        },
        {
          key: 'title',
          component: <span className="text-wrap text-truncate">{title}</span>,
        },
        {
          key: 'email',
          component: <span>{email_work}</span>,
        },
        {
          key: 'organization',
          component: <span>{profileInfo?.name}</span>,
        },
        {
          key: 'phone',
          component: <span>{phone_mobile}</span>,
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

export default ContactTableModal;
