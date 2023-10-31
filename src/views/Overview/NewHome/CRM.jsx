import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { sortingTable } from '../../../utils/sortingTable';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import Table from '../../../components/GenericTable';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { paginationDefault } from '../../../utils/constants';
import { Col, Row } from 'reactstrap';
import FullNameInitials from '../../../components/NameInitials';
const allData = [
  {
    name: 'Kassulke and Baumbach, LLC.',
    company_name: 'Commerical Card',
    view_date: '6/23/2023',
    share_date: '10/22/2023',
    views: '12',
    revenue: '$65,000',
  },
  {
    name: 'Walsh, Inc.',
    company_name: 'Lockbox',
    view_date: '6/23/2023',
    share_date: '10/22/2023',
    views: '12',
    revenue: '$54,000',
  },
  {
    name: 'Bartoletti, Inc.',
    company_name: 'Fraud Filter',
    view_date: '4/4/2023',
    share_date: '10/22/2023',
    views: '12',
    revenue: '$65,000',
  },
  {
    name: 'Doyle, LLC',
    company_name: 'Commerical Card',
    view_date: '5/2/2023',
    share_date: '10/22/2023',
    views: '12',
    revenue: '$72,000',
  },
  {
    name: 'Lehner-Champlin, Inc.',
    company_name: 'Lockbox',
    view_date: '4/12/2023',
    share_date: '10/22/2023',
    views: '12',
    revenue: '$32,000',
  },
];
const getData = [
  {
    name: 'Brandon Gutman',
    revenue: '$65,000',
    views: '14',
  },
  {
    name: 'David Bryant',
    revenue: '$54,000',
    views: '17',
  },
  {
    name: 'Alma McCulloch',
    revenue: '$65,000',
    views: '8',
  },
  {
    name: 'Michael Godfrey',
    revenue: '$72,000',
    views: '12',
  },
  {
    name: 'Joshua Brooks',
    revenue: '$32,000',
    views: '10',
  },
];
const CRM = () => {
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
      component: 'Company Name ',
    },
    {
      key: 'company_name',
      orderBy: 'company_name',
      component: 'Potential Revenue Gain',
    },
    {
      key: 'view_date',
      orderBy: 'view_date',
      component: 'Last Date Contacted',
    },
    {
      key: 'share_date',
      orderBy: 'share_date',
      component: 'Product Leads',
    },
  ];
  const managerColumns = [
    {
      key: 'owner',
      orderBy: 'owner',
      component: 'Owner',
      width: '33.333%',
    },
    {
      key: 'revenue',
      orderBy: 'revenue',
      component: 'Revenue',
      width: '33.333%',
    },
    {
      key: 'leads',
      orderBy: 'leads',
      component: 'Leads',
      width: '33.333%',
    },
  ];
  const data = allData?.map((item) => ({
    ...item,
    dataRow: [
      {
        key: 'content',
        component: <span className={`pl-3 fw-bold`}>{item?.name}</span>,
      },
      {
        key: 'company_name',
        component: <span>{item?.revenue}</span>,
      },
      {
        key: 'view_date',
        component: <span>{item?.view_date}</span>,
      },
      {
        key: 'share_date',
        component: <span>{item?.company_name}</span>,
      },
    ],
  }));

  const manageData = getData?.map((item) => ({
    ...item,
    dataRow: [
      {
        key: 'owner',
        component: (
          <span className="d-flex align-items-center gap-1">
            <FullNameInitials fullName={item?.name} />
            <span className={`fw-bold`}>{item?.name}</span>
          </span>
        ),
      },
      {
        key: 'revenue',
        component: <span>{item?.revenue}</span>,
      },
      {
        key: 'leads',
        component: <span>{item?.views}</span>,
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
    <>
      <Row className="h-100">
        <Col md={6}>
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">
                Booked Revenue vs Expected Revenue
              </h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="p-0">
                <img src="/img/5.svg" className="w-100" />
              </Card.Body>
            </Card>
          </div>
        </Col>
        <Col md={6}>
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-520">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Calls by Partners</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none">
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
                        columns={managerColumns}
                        data={manageData}
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
        </Col>
        <Col md={6}>
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-420">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Top Pipeline Opportunities</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none">
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
                        sortingOrder={order}
                        usePagination={false}
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
        </Col>

        <Col md={6} className="h-100">
          <div className="bg-white rounded-lg shadow border border-gray-300 p-3 mt-3 mh-420">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="font-weight-bold">Pipeline by Product</h3>
              <div>
                <a href="#" className="show-all">
                  Show All <MaterialIcon icon="navigate_next" />
                </a>
              </div>
            </div>
            <Card className="shadow-none border-0">
              <Card.Body className="px-0 pb-0 text-center mt-5 pt-5">
                <img src="/img/4.svg" className="w-75 m-auto" />
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CRM;
