import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { sortingTable } from '../../../utils/sortingTable';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import Table from '../../../components/GenericTable';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { paginationDefault } from '../../../utils/constants';
const allData = [
  {
    content: {
      name: '2023 Finance Report',
      iamge: '/img/engagement.svg',
    },
    company_name: 'Bartoletti, Inc.',
    view_date: '07/22/2023',
    share_date: '10/22/2023',
    views: '14',
  },
  {
    content: {
      name: 'Monthly Report',
      iamge: '/img/engagement1.svg',
    },
    company_name: 'Lehner-Champlin, Inc.',
    view_date: '07/22/2023',
    share_date: '10/22/2023',
    views: '17',
  },
  {
    content: {
      name: 'Daily Report',
      iamge: '/img/engagement2.svg',
    },
    company_name: 'Doyle, LLC',
    view_date: '07/22/2023',
    share_date: '10/22/2023',
    views: '8',
  },
  {
    content: {
      name: 'Daily Report',
      iamge: '/img/engagement3.svg',
    },
    company_name: 'Hirthe and Sons, LLC.',
    view_date: '07/22/2023',
    share_date: '10/22/2023',
    views: '12',
  },
  {
    content: {
      name: 'Daily Report',
      iamge: '/img/engagement4.svg',
    },
    company_name: 'Stoltenberg, Inc.',
    view_date: '07/22/2023',
    share_date: '10/22/2023',
    views: '10',
  },
];
const Engagement = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const [showLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [order, setOrder] = useState([]);

  const [dataInDB] = useState(true);

  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const columns = [
    {
      key: 'content',
      orderBy: 'content',
      component: 'Content ',
      width: 200,
    },
    {
      key: 'company_name',
      orderBy: 'company_name',
      component: 'Company Name',
    },
    {
      key: 'view_date',
      orderBy: 'view_date',
      component: 'Last Viewed',
    },
    {
      key: 'share_date',
      orderBy: 'share_date',
      component: 'Date Shared',
    },
    {
      key: 'views',
      orderBy: 'views',
      component: 'Views',
    },
  ];
  const data = allData?.map((item) => ({
    ...item,
    dataRow: [
      {
        key: 'content',
        component: (
          <div
            className={`pl-3 fw-bold card-image d-flex align-items-start justify-content-between flex-column py-2 px-3`}
            style={{
              backgroundImage: `url(${item.content.iamge})`,
            }}
          >
            <span className="bg-white rounded">
              <MaterialIcon icon="bar_chart" clazz="text-theme-color" />
            </span>
            <span>{item?.content?.name}</span>
          </div>
        ),
      },
      {
        key: 'company_name',
        component: (
          <span className="font-weight-bold pl-3">{item?.company_name}</span>
        ),
      },
      {
        key: 'view_date',
        component: <span>{item?.view_date}</span>,
      },
      {
        key: 'share_date',
        component: <span>{item?.share_date}</span>,
      },
      {
        key: 'views',
        component: (
          <span className="d-flex align-items-center gap-1">
            <span className="bg-theme-color visibility-size rounded-circle">
              <MaterialIcon icon="visibility" clazz="text-white" />
            </span>{' '}
            {item?.views}
          </span>
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

  return (
    <div className="bg-white rounded-lg shadow border border-gray-300 p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="font-weight-bold">Engagement</h3>
        <div>
          <a href="#" className="show-all">
            Show All <MaterialIcon icon="navigate_next" />
          </a>
        </div>
      </div>
      <Card className="mb-5 shadow-none">
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
                  columns={columns}
                  data={data}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  emptyDataText="No engagement available yet."
                  title="Engagement"
                  dataInDB={dataInDB}
                  usePagination={false}
                  sortingOrder={order}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  sortingTable={sortTable}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Engagement;
