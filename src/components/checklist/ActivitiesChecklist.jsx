import { Card } from 'react-bootstrap';
import Table from '../GenericTable';
import React, { useState } from 'react';
import { ChecklistStatuses } from '../../utils/checklist.constants';
import ChecklistStatus from './ChecklistStatus';
import ViewChecklist from '../fields/modals/ViewChecklist';
const allData = [
  {
    name: 'Kassulke and Baumbach, LLC.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.NotViewed,
    created_on: '8/23/2023',
    due_date: '11/01/2023',
  },
  {
    name: 'Walsh, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '8/25/2023',
    due_date: '11/15/2023',
  },
  {
    name: 'Bartoletti, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Doyle, LLC',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Pending,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Lehner-Champlin, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Rutherford-Gaylord, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Completed,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Bosco, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Corwin, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Hirthe and Sons, LLC.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.Pending,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
  {
    name: 'Stoltenberg, Inc.',
    checklist_name: 'ACH Origination Audit',
    status: ChecklistStatuses.InProgress,
    created_on: '7/25/2023',
    due_date: '9/08/2023',
  },
];
const ActivitiesChecklist = () => {
  const [openView, setOpenView] = useState(false);
  const [row, setRow] = useState({});

  const columns = [
    {
      key: 'company_name',
      orderBy: '',
      component: 'Company Name',
    },
    {
      key: 'checklist_name',
      orderBy: '',
      component: 'Checklist Name',
    },
    {
      key: 'status',
      orderBy: '',
      component: 'Status',
    },
    {
      key: 'created_on',
      orderBy: '',
      component: 'Created On',
    },
    {
      key: 'due_date',
      orderBy: '',
      component: 'Due Date',
    },
  ];
  const data = allData?.map((item) => ({
    ...item,
    dataRow: [
      {
        key: 'company_name',
        component: <span className={`pl-3 fw-bold`}>{item?.name}</span>,
      },
      {
        key: 'checklist_name',
        component: <span>{item?.checklist_name}</span>,
      },
      {
        key: 'status',
        component: <ChecklistStatus item={item} />,
      },
      {
        key: 'created_on',
        component: <span>{item?.created_on}</span>,
      },
      {
        key: 'due_date',
        component: <span>{item?.due_date}</span>,
      },
    ],
  }));
  const handleActivityRowClick = (item) => {
    setRow(item);
    setOpenView(true);
  };
  return (
    <Card className="mb-5">
      <Card.Body className="p-0">
        <div className="table-responsive-md datatable-custom">
          <Table
            columns={columns}
            data={data}
            dataInDB={true}
            onClick={handleActivityRowClick}
            usePagination={false}
          />
        </div>
      </Card.Body>
      <ViewChecklist
        openModal={openView}
        setOpenModal={setOpenView}
        checklist={row}
        organization={{ name: row?.name }}
        readonly={true}
      />
    </Card>
  );
};
export default ActivitiesChecklist;
