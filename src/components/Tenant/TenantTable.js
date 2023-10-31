import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import tenantService from '../../services/tenant.service';
import { paginationDefault } from '../../utils/constants';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import stringConstants from '../../utils/stringConstants.json';
import { sortingTable } from '../../utils/sortingTable';
import Table from '../GenericTable';
import LayoutHead from '../commons/LayoutHead';
import CreateTenantModal from './CreateTenantModal';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { DATE_FORMAT } from '../../utils/Utils';
import MoreActions from '../MoreActions';
import TableSkeleton from '../commons/TableSkeleton';
import authService from '../../services/auth.service';
import { DataFilters } from '../DataFilters';
import MaterialIcon from '../commons/MaterialIcon';
import TooltipComponent from '../lesson/Tooltip';

const constants = stringConstants.tenants;
const limit = 10;
const includeOwners = true;
const TenantTable = ({ paginationPage }) => {
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
  const [createTenantResponse, setCreateTenantResponse] = useState();
  const [filter, setFilter] = useState({});

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

  const getActionItemsByUserStatus = (tenant) => {
    let actions = [
      {
        id: 'edit',
        name: 'Edit Tenant',
        icon: 'edit',
        onClick: handleEditModalShow,
      },
      {
        id: 'add',
        name: 'Owner Ghost Login',
        user: 'owner',
        icon: 'login',
        onClick: ghoostLogin,
      },
      {
        id: 'remove',
        name: 'User Ghost Login',
        user: 'app',
        icon: 'login',
        onClick: ghoostLogin,
      },
    ];
    if (tenant.users) {
      const appUser = tenant?.users.find(
        (item) => item.role?.app_access && !item.role?.owner_access
      );
      if (!appUser) actions.pop();
    }
    if (tenant.status === 'enabled') {
      actions = [
        ...actions,
        {
          id: 'disable',
          name: 'Disable Tenant',
          icon: 'clear',
          onClick: updateTenantStatus,
        },
      ];
    } else {
      actions = [
        ...actions,
        {
          id: 'enable',
          name: 'Enable Tenant',
          icon: 'done',
          onClick: updateTenantStatus,
        },
      ];
    }
    return actions;
  };
  const getTenants = async () => {
    setShowLoading(true);
    try {
      const tenants = await tenantService.getTenants(
        order,
        { ...pagination, limit },
        includeOwners,
        { ...filter }
      );
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
    getTenants();
  }, []);

  useEffect(() => {
    getTenants();
  }, [pagination?.page, order, filter]);

  useEffect(() => {
    paginationPage?.page === 1 && changePaginationPage(1);
  }, [paginationPage]);

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
  const updateTenantStatus = async (tenant, status) => {
    const data = {
      id: tenant.id,
      name: tenant.name,
      type: tenant.type,
      domain: tenant.domain,
      domainUrl: tenant.domainUrl,
      modules: tenant.modules,
      colors: {
        name: tenant.colors.name,
        primaryColor: tenant.colors.primaryColor,
        secondaryColor: tenant.colors.secondaryColor,
      },
      status: tenant.status,
      logo: tenant.logo,
      created_at: tenant.created_at,
      updated_at: tenant.updated_at,
    };
    await tenantService.updateTenantStatus(data, status);
    getTenants();
  };
  const ghoostLogin = async (item, user) => {
    let idToImpersonate;
    if (item.users.length) {
      if (user === 'owner') {
        idToImpersonate = item.users.find((ownerUser) => {
          if (ownerUser.role.owner_access) return ownerUser;
          return null;
        });
      } else {
        idToImpersonate = item.users.find((appUser) => {
          if (!appUser.role.owner_access && appUser.role.app_access) {
            return appUser;
          }
          return null;
        });
      }
      try {
        const impersonateUser = await authService.impersonate(
          idToImpersonate.id
        );

        // localhost special handling because it redirects to https://localhost we want to redirect it to http://localhost:3000
        const domainUrl = item.domain.includes('localhost')
          ? 'http://localhost:3000'
          : `https://${item.domain}`;
        window.open(
          `${domainUrl}/login?access_token=${impersonateUser.access_token}&refresh_token=${impersonateUser.refresh_token}`,
          '_blank'
        );
      } catch (e) {
        setErrorMessage(constants.edit.ghost);
      }
    } else {
      setErrorMessage(constants.edit.userError);
    }
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
      setShowLoading(true);
      const createResponce = await tenantService.updateTenant(
        data,
        selectedEditData.id
      );

      if (createResponce) {
        getTenants();
        setShowLoading(false);
        setSuccessMessage(constants.edit.TenantUpdateSuccess);
        setShowCreateRoleModal(false);
      } else {
        setShowLoading(false);
        setErrorMessage(constants.edit.TenantUpdateFailed);
      }
    } catch (error) {}
  };

  const getUsersCountByStatus = (users, status) => {
    return users.filter((user) => user.status === status).length;
  };

  const columns = [
    {
      key: 'name',
      orderBy: 'name',
      component: 'Tenant Name',
    },
    {
      key: 'total-users',
      component: 'Total Users',
    },
    {
      key: 'active-users',
      component: 'Active Users',
    },
    {
      key: 'invited-users',
      component: 'Invited Users',
    },
    {
      key: 'last_modified',
      orderBy: 'updated_at',
      component: 'Last Modified',
    },
    {
      key: 'action',
      component: 'Actions',
    },
  ];
  const data = allTenants?.map((tenant, id) => ({
    ...tenant,
    dataRow: [
      {
        key: 'name',
        component: (
          <>
            <span className="pl-3">{tenant?.name}</span>{' '}
            <TooltipComponent title={tenant?.domain} placement="bottom">
              <MaterialIcon icon="info" clazz="font-size-lg" />
            </TooltipComponent>
          </>
        ),
      },
      {
        key: 'total-users',
        component: <span>{tenant?.users.length}</span>,
      },
      {
        key: 'active-users',
        component: getUsersCountByStatus(tenant?.users, 'active'),
      },
      {
        key: 'invited-users',
        component: getUsersCountByStatus(tenant?.users, 'invited'),
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
          <a className={`icon-hover-bg cursor-pointer`}>
            <MoreActions
              items={getActionItemsByUserStatus(tenant)}
              onHandleEdit={() => {
                handleEditModalShow({ ...tenant, title: name });
              }}
              onHandleAdd={() => {
                ghoostLogin({ ...tenant }, 'owner');
              }}
              onHandleRemove={() => {
                ghoostLogin({ ...tenant }, 'app');
              }}
              onHandleEnable={() => {
                updateTenantStatus(tenant, 'enabled');
              }}
              onHandleDisable={() => {
                updateTenantStatus(tenant, 'disabled');
              }}
              menuWidth={210}
            />
          </a>
        ),
      },
    ],
  }));

  const handleCreateTenant = async (data) => {
    setShowLoading(true);
    try {
      if (!data?.colors) {
        setShowLoading(false);
        setErrorMessage('Please select color!');
        setCreateTenantResponse(false);
        return false;
      } else {
        const createResponce = await tenantService.createTenant(data);
        if (!createResponce.response) {
          getTenants();
          setShowLoading(false);
          setSuccessMessage(constants.create.TenantCreatedSuccess);
          setShowCreateRoleModal(false);
          setCreateTenantResponse(true);
        } else {
          setShowLoading(false);
          createResponce.response.request.status === 500
            ? setErrorMessage(constants.create.TenantCreatedFailed)
            : setErrorMessage(createResponce.response?.data?.error);
          setCreateTenantResponse(false);
          return false;
        }
        return createTenantResponse;
      }
    } catch (error) {}
  };

  const sortTable = ({ name }) => {
    if (name === 'last_modified') name = 'updated_at';
    if (name === 'action') return null;
    sortingTable({ name, order, setOrder });
  };
  const loader = () => {
    if (showLoading) return <TableSkeleton cols={4} rows={10} />;
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
        <Card.Header>
          <DataFilters
            filterSelected={filter}
            setFilterSelected={setFilter}
            searchPlaceholder="Search tenant"
            paginationPage={pagination}
            setPaginationPage={setPagination}
          />
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive-md">
            <div
              id="datatable_wrapper"
              className="dataTables_wrapper no-footer"
            >
              {showLoading ? (
                loader()
              ) : (
                <Table
                  actionPadding="p-0"
                  columns={columns}
                  data={data}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  paginationInfo={pagination}
                  onPageChange={changePaginationPage}
                  emptyDataText="No Tenant available yet."
                  onClick={handleEditModalShow}
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
      {showCreateRoleModal && (
        <CreateTenantModal
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
      )}
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

export default TenantTable;
