import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Table from '../GenericTable';
import { isToFixedNoRound, setDateFormat } from '../../utils/Utils';
import routes from '../../utils/routes.json';
import IdfOwnersHeader from '../idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import userService from '../../services/user.service';
import TableSkeleton from '../commons/TableSkeleton';

const DealTable = ({
  data = [],
  paginationInfo,
  onPageChange,
  handleEdit,
  selectedCourses,
  setSelectedCourses,
  onClickRow,
  service,
  showLoading,
  onAddDeal,
  dataInDB,
  sortingTable,
  sortingOrder,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const columns = [
    {
      key: 'title',
      component: 'Title',
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
      key: 'stages',
      component: 'stages',
    },
    {
      key: 'contactPerson',
      component: 'Contact Person',
    },
    {
      key: 'expectedCloseDate',
      component: 'Expected Close Date',
    },
    {
      key: 'owner',
      component: 'Owner(s)',
    },
  ];

  const rows = data.map((item) => {
    const {
      id,
      name,
      amount,
      organization,
      contact,
      stage,
      date_closed,
      assigned_user,
      owners,
    } = item;

    const isPrincipalOwner =
      me && item
        ? me?.role?.admin_access || assigned_user?.id === me?.id
        : false;

    const response = {
      ...item,
      dataRow: [
        {
          key: 'title',
          component: (
            <Link
              to={`${routes.dealsPipeline}/${item.id}`}
              className="text-black pl-3 fw-bold"
            >
              {name}
            </Link>
          ),
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
          key: 'stages',
          component: <span>{stage?.name}</span>,
        },
        {
          key: 'contactPerson',
          component: (
            <span>
              {contact?.first_name} {contact?.last_name}
            </span>
          ),
        },
        {
          key: 'expectedCloseDate',
          component: (
            <span>
              {date_closed ? setDateFormat(date_closed, 'MM/DD/YYYY') : ''}
            </span>
          ),
        },
        {
          key: 'owner',
          component: (
            <IdfOwnersHeader
              mainOwner={assigned_user}
              service={service}
              serviceId={id}
              listOwners={owners}
              isClickable={false}
              onClick={(e) => {
                e?.preventDefault();
                e?.stopPropagation();
              }}
              defaultSize="xs"
              maxOwners={3}
              isprincipalowner={isPrincipalOwner}
              small
            />
          ),
        },
      ],
    };
    return response;
  });

  return (
    <div className="table-responsive-md datatable-custom">
      {showLoading ? (
        <TableSkeleton cols={6} rows={10} />
      ) : (
        <Table
          usePagination
          selectedData={selectedCourses}
          setSelectedData={setSelectedCourses}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          columns={columns}
          data={rows}
          onPageChange={onPageChange}
          onHandleEdit={handleEdit}
          onClick={onClickRow}
          paginationInfo={paginationInfo}
          toggle={onAddDeal}
          emptyDataText="No Pipeline available yet."
          title="Pipeline"
          dataInDB={dataInDB}
          sortingTable={sortingTable}
          sortingOrder={sortingOrder}
          noDataInDbValidation={true}
        />
      )}
    </div>
  );
};

export default DealTable;
