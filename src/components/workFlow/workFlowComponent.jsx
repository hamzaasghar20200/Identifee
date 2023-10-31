import React, { useEffect, useState } from 'react';
import CreateWorkFlowModal from './CreateWorkFlowModal';
import { Card } from 'react-bootstrap';
import tenantService from '../../services/tenant.service';
import { paginationDefault } from '../../utils/constants';
// import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import stringConstants from '../../utils/stringConstants.json';
import { sortingTable } from '../../utils/sortingTable';
import Table from '../GenericTable';
import LayoutHead from '../commons/LayoutHead';
import Loading from '../Loading';
import moment from 'moment-timezone';
import TableActions from '../commons/TableActions';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { DATE_FORMAT } from '../../utils/Utils';
const constants = stringConstants.workflow;
const limit = 1000;
export const WorkFlowComponent = ({ paginationPage }) => {
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([]);
  const [selectedEditData, setSelectedEditData] = useState('');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [allTenants, setAllTenants] = useState([]);
  const [showTooltip, setShowTooltip] = useState(true);
  const defaultComponentForm = {
    name: '',
    module: '',
    measures: [],
    dimensions: [],
    timeDimensions: [],
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultComponentForm,
  });

  const getTenants = async () => {
    setShowLoading(true);
    try {
      const tenants = await tenantService.getTenants({ ...pagination }, limit);
      setPagination(tenants.pagination);
      setDataInDB(Boolean(tenants?.pagination?.totalPages));
      setAllTenants(tenants.data);
      setShowLoading(false);
    } catch (err) {
      setErrorMessage(constants.create?.groupCreatedFailed);
    }
  };
  const changePaginationPage = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    getTenants(true);
  }, []);

  useEffect(() => {
    getTenants();
  }, [pagination?.page]);

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);

  // config of each field that is required on a form
  const validationConfig = {
    name: {
      required: 'Component Name is required.',
      inline: false,
    },
    module: {
      required: true,
    },
    measures: {
      required: true,
    },
    dimensions: {
      required: true,
    },
    timeDimensions: {
      required: true,
    },
  };
  const handleEditModalShow = async (item) => {
    const singleTenant = await tenantService.getSingleTenant(item.id);
    singleTenant &&
      setSelectedEditData({
        name: singleTenant?.name || '',
        description: singleTenant?.description || '',
        id: singleTenant?.id || '',
        domain: singleTenant?.domain || '',
        ownerEmail: singleTenant?.ownerEmail || '',
        modules: singleTenant?.modules || '',
        tenantInfo: singleTenant?.domain || '',
        colors: singleTenant?.colors || '',
        icon: singleTenant?.icon || '',
        logo: singleTenant?.logo || '',
        use_logo: singleTenant?.use_logo || '',
      });
    setShowCreateRoleModal(true);
  };
  const handleUpdate = async (data) => {
    try {
      await tenantService.updateTenant(data, selectedEditData.id);
      getTenants();
      setSuccessMessage(constants.create.TeamCreatedSuccess);
      setShowLoading(false);
      setShowCreateRoleModal(false);
    } catch (error) {
      setErrorMessage(constants.failed);
    }
  };
  const columns = [
    {
      key: 'name',
      orderBy: 'name',
      component: 'Workflow Name',
    },
    {
      key: 'owner',
      orderBy: 'owner',
      component: 'All Modules',
    },
    {
      key: 'domain',
      orderBy: 'domain',
      component: 'Actions',
    },
    {
      key: 'execute_on',
      orderBy: 'execute_on',
      component: 'Execute On',
    },
    {
      key: 'last_modified',
      orderBy: 'last_modified',
      component: 'Last Modified',
    },
    {
      key: 'all_status',
      orderBy: 'all_status',
      component: 'All Status',
    },
  ];
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      onClick: handleEditModalShow,
    },
  ];
  const data = allTenants?.map((tenant) => ({
    ...tenant,
    dataRow: [
      {
        key: 'name',
        component: (
          <Link to="/settings/workflow/view">
            <span>{tenant?.name}</span>
          </Link>
        ),
      },
      {
        key: 'owner',
        component: <span>{tenant?.owner_name}</span>,
      },
      {
        key: 'domain',
        component: (
          <Badge
            style={{
              fontSize: '11px',
              backgroundColor: `red`,
            }}
            className="text-uppercase p-2"
          >
            {tenant?.domain}
          </Badge>
        ),
      },
      {
        key: 'last_modified',
        component: (
          <span>{moment(tenant?.updated_at).format(DATE_FORMAT)}</span>
        ),
      },
      {
        key: 'action',
        component: (
          <TableActions
            item={{ ...tenant, title: name }}
            actions={tableActions}
          />
        ),
      },
    ],
  }));

  const handleCreateTenant = async (data) => {
    setShowLoading(true);
    try {
      await tenantService.createTenant(data);
      getTenants();
      setSuccessMessage(constants.create.TeamCreatedSuccess);
      setShowLoading(false);
      setShowCreateRoleModal(false);
    } catch (error) {
      setErrorMessage(constants.failed);
    }
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });
  const loader = () => {
    if (showLoading) return <Loading />;
  };
  return (
    <>
      <LayoutHead
        onHandleCreate={() => setShowCreateRoleModal(true)}
        buttonLabel={constants.edit.add}
        selectedData={selectedData}
        onDelete={true}
        headingTitle=""
        dataInDB={dataInDB}
      />
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
                  checkbox
                  columns={columns}
                  data={data}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  clickableCell
                  emptyDataText="No Tenant available yet."
                  title="Tenant"
                  dataInDB={dataInDB}
                  showTooltip={showTooltip}
                  setShowTooltip={setShowTooltip}
                  toggle={() => setShowCreateRoleModal(true)}
                  sortingTable={sortTable}
                  sortingOrder={order}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      <CreateWorkFlowModal
        showModal={showCreateRoleModal}
        setShowModal={setShowCreateRoleModal}
        handleCreateTenant={handleCreateTenant}
        showLoading={showLoading}
        errors={errors}
        config={validationConfig}
        register={register}
        handleSubmit={handleSubmit}
        reset={reset}
        setValue={setValue}
        selectedEditData={selectedEditData}
        setSelectedEditData={setSelectedEditData}
        handleUpdateTenant={handleUpdate}
      />
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
    </>
  );
};
