import React, { useState, useEffect, useReducer } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Badge } from 'reactstrap';
import { Card } from 'react-bootstrap';

import Table from '../../../components/GenericTable';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import {
  initialFilters,
  initialFiltersItems,
  initialPeopleForm,
  peopleColumns,
} from './Contacts.constants';
import contactService from '../../../services/contact.service';
import {
  EMPTY_NAME,
  INVALID_EMAIL,
  OWNER,
  paginationDefault,
  CONTACT_CREATED,
} from '../../../utils/constants';
import {
  RIGHT_PANEL_WIDTH,
  endOfLastWeekString,
  endOfWeekString,
  formatPhoneNumber,
  startOfLastWeekString,
  startOfWeekString,
  validateEmail,
} from '../../../utils/Utils';
import PeopleForm from '../../../components/peoples/PeopleForm';
import { changePaginationPage, reducer } from './utils';
import userService from '../../../services/user.service';
import Loading from '../../../components/Loading';
import routes from '../../../utils/routes.json';
import IdfOwnersHeader from '../../../components/idfComponents/idfAdditionalOwners/IdfOwnersHeader';
import DeleteModal from '../../../components/modal/DeleteModal';
import stringConstants from '../../../utils/stringConstants.json';
import LayoutHead from '../../../components/commons/LayoutHead';
import { sortingTable } from '../../../utils/sortingTable';
import FilterTabsButtonDropdown from '../../../components/commons/FilterTabsButtonDropdown';
import fieldService from '../../../services/field.service';
import { useForm } from 'react-hook-form';
import RightPanelModal from '../../../components/modal/RightPanelModal';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import { groupBy } from 'lodash';
import { useModuleContext } from '../../../contexts/moduleContext';

const contactConstants = stringConstants.deals.contacts;

const PEOPLES_FILTER_OPTIONS_LIST = [
  { id: 1, key: 'AllContacts', name: 'All Contacts' },
  { id: 2, key: 'MyContacts', name: 'My Contacts' },
  { id: 3, key: 'AddedLastWeek', name: 'Added Last Week' },
  { id: 4, key: 'AddedThisWeek', name: 'Added This Week' },
  { id: 5, key: 'RecentlyCreated', name: 'Recently Created' },
  { id: 6, key: 'RecentlyModified', name: 'Recently Modified' },
];
const defaultFilter = {
  id: 3,
  key: 'AllContacts',
  name: 'All Contacts',
};

const Peoples = () => {
  const peopleForm = {
    first_name: '',
    last_name: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getFieldState,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: peopleForm,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [modal, setModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [filterSelected, setFilterSelected] = useState({});
  const [filtersItems, setFiltersItems] = useState(initialFiltersItems);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [allOwners, setAllOwners] = useState([]);
  const [pagination, setPagination] = useState(paginationDefault);
  const [paginationPage, setPaginationPage] = useState(paginationDefault);
  const [filters] = useReducer(reducer, initialFilters);
  const [customFields, setCustomFields] = useState([]);
  const [peopleFormData, dispatchFormData] = useReducer(
    reducer,
    initialPeopleForm
  );
  const [modified, setModified] = useState(false);
  const [showDeleteContactModal, setShowDeleteContactModal] = useState(false);
  const [deleteResults, setDeleteResults] = useState([]);
  const [showDeleteReport, setShowDeleteReport] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [me, setMe] = useState(null);
  const [preOwners, setPreOwners] = useState([]);
  const [order, setOrder] = useState([]);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterTabs, setFilterTabs] = useState('filters');
  const { moduleMap } = useModuleContext();
  const [addButtonLabel, setButtonLabel] = useState();
  const [filterOptionSelected, setFilterOptionSelected] =
    useState(defaultFilter);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [fieldsDataFilter, setFieldsDataFilter] = useState([]);
  const currentView = 'contact';
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };

  useEffect(() => {
    if (moduleMap.contact) {
      setButtonLabel(`Add ${moduleMap.contact.singular}`);
      PEOPLES_FILTER_OPTIONS_LIST.forEach((option) => {
        if (option.key === 'AllContacts') {
          option.name = `All ${moduleMap.contact.plural}`;
        } else if (option.key === 'MyContacts')
          option.name = `My ${moduleMap.contact.plural}`;
        defaultFilter.name = `All ${moduleMap.contact.plural}`;
      });
    }
  }, [moduleMap.contact]);

  const getFields = async () => {
    setIsLoading(true);
    const fieldsData = await fieldService.getFields(currentView, {
      preferred: true,
    });
    setFieldsDataFilter(fieldsData?.data);
    groupBySection(fieldsData?.data);
    setIsLoading(false);
  };
  const handleFilterSelect = (e, status) => {
    e.preventDefault();
    setOpenFilter(!openFilter);

    let newFilterSelected = {
      ...filterSelected,
    };

    if (status.key === 'MyContacts') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: [me.id] },
      };
    } else if (status.key === 'AllContacts') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { assigned_user_id: null },
      };
    } else if (status.key === 'AddedLastWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: {
          startDate: startOfLastWeekString,
          endDate: endOfLastWeekString,
        },
      };
    } else if (status.key === 'AddedThisWeek') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: {
          startDate: startOfWeekString,
          endDate: endOfWeekString,
        },
      };
    } else if (status.key === 'RecentlyCreated') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { recent_activity: true },
      };
    } else if (status.key === 'RecentlyModified') {
      newFilterSelected = {
        ...newFilterSelected,
        filter: { recent_activity: true },
      };
    }

    const hasFilters = Object.keys(newFilterSelected.filter);

    if (!hasFilters.length) delete newFilterSelected.filter;

    setFilterSelected(newFilterSelected);

    setFilterOptionSelected(status);
  };

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    }
  }, [successMessage]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const getContacts = async (count) => {
    setShowLoading(true);
    const contacts = await contactService
      .getContact(
        { ...filterSelected, order, deleted: false },
        {
          page: paginationPage.page,
          limit: 15,
        }
      )
      .catch((err) => console.log(err));

    const { data } = contacts || {};

    setAllContacts(data?.contacts);
    setPagination(data?.pagination);

    setDataInDB(count ? Boolean(data?.pagination?.totalPages) : false);
    setShowLoading(false);
  };

  async function onGetUsers() {
    const response = await userService
      .getUsers(
        {
          search: '',
          users: [],
          filters: '',
        },
        {}
      )
      .catch((err) => err);

    const { data } = response || {};

    const newFilterOptions = filtersItems.slice();

    newFilterOptions.push({
      id: newFilterOptions.length,
      label: OWNER,
      name: 'assigned_user_id',
      options: data?.users,
      type: 'search',
    });

    setFiltersItems(newFilterOptions);
    setAllOwners(response?.users);
  }

  useEffect(() => {
    onGetUsers();
    getContacts(true);
    getCurrentUser();
  }, []);

  useEffect(() => {
    getContacts(true);
  }, [filterSelected, paginationPage, modified, order]);

  const onHandleFilterOrg = (item) => {
    const newFilterSelected = {
      ...filterSelected,
      filter: item && item.id ? { assigned_user_id: [item.id] } : filters,
    };

    const hasFilters = Object.keys(newFilterSelected.filter);

    if (!hasFilters.length) delete newFilterSelected.filter;

    setFilterSelected(newFilterSelected);

    setOpenFilter(false);
    setFilterOptionSelected({
      key: item.id,
      id: item.id,
      name: `${item?.first_name} ${item?.last_name}`,
    });
  };

  const data = allContacts?.map((contact) => {
    const isPrincipalOwner =
      me && contact
        ? me?.role?.admin_access ||
          me?.role?.owner_access ||
          contact?.assigned_user_id === me?.id
        : false;

    return {
      ...contact,
      dataRow: [
        {
          key: 'name',
          component: (
            <Link
              to={`${routes.contacts}/${contact.id}/profile`}
              className="text-black fw-bold  d-block"
            >
              {`${contact.first_name} ${contact.last_name}`}
            </Link>
          ),
        },
        {
          key: 'organization',
          label: 'company',
          component: (
            <Link
              to={`${routes.companies}/${contact.organization?.id}/organization/profile`}
              className="text-black  d-block"
            >
              {contact.organization?.name}
            </Link>
          ),
        },
        {
          key: 'label',
          label: 'label',
          component: contact?.label ? (
            <Badge
              id={contact.label.id}
              style={{
                fontSize: '12px',
                backgroundColor: `${contact.label.color}`,
              }}
              className="text-uppercase w-100"
            >
              {contact.label.name}
            </Badge>
          ) : null,
        },
        {
          key: 'email',
          label: 'email',
          component: (
            <span>
              {contact.email_work ||
                contact.email_home ||
                contact.email_mobile ||
                contact.email_other}
            </span>
          ),
        },
        {
          key: 'phone',
          label: 'phone',
          component: (
            <span>
              {formatPhoneNumber(
                contact.phone_work ||
                  contact.phone_home ||
                  contact.phone_mobile ||
                  contact.phone_other
              )}
            </span>
          ),
        },
        {
          key: 'owner',
          label: 'owner',
          component: (
            <IdfOwnersHeader
              mainOwner={contact.assigned_user}
              service={contactService}
              serviceId={contact.id}
              isClickable={false}
              onClick={(e) => {
                e?.stopPropagation();
                e?.preventDefault();
              }}
              listOwners={contact.owners}
              defaultSize="xs"
              isprincipalowner={isPrincipalOwner}
              small
            />
          ),
        },
      ],
    };
  });

  const toggle = () => {
    getFields();
    setModal(!modal);
    setCustomFields([]);
  };
  const removeObjectFields = (object) => {
    const updatedObject = { ...object };
    fieldsDataFilter?.forEach((obj) => {
      if (
        obj.isCustom &&
        Object.prototype.hasOwnProperty.call(
          updatedObject,
          obj.key.toLowerCase()
        )
      ) {
        delete updatedObject[obj.key.toLowerCase()];
      }
    });

    return updatedObject;
  };
  const onHandleSubmit = async () => {
    setLoading(true);
    const updatedObject = removeObjectFields(peopleFormData);
    if (!peopleFormData.first_name || !peopleFormData.last_name) {
      setLoading(false);

      return setErrorMessage(EMPTY_NAME);
    }

    const isEmail = peopleFormData.email && validateEmail(peopleFormData.email);

    if (peopleFormData.email && !isEmail) {
      setLoading(false);

      return setErrorMessage(INVALID_EMAIL);
    }
    const newContact = await contactService
      .createContact(updatedObject)
      .catch((err) => console.log(err));

    if (newContact) {
      await Promise.all(
        customFields?.map(async (item) => {
          await new Promise((resolve) => {
            if (item?.value !== '')
              contactService
                .updateCustomField(newContact?.data?.id, item)
                .then(resolve);
          });
        }),
        preOwners?.map(async (item) => {
          await new Promise((resolve) => {
            contactService
              .addOwner(newContact?.data?.id, item.user_id)
              .then(resolve);
          });
        })
      );

      getContacts(true);
      reset(
        initialPeopleForm,
        dispatchFormData({
          type: 'reset-peopleForm',
        })
      );
      setPreOwners([]);
      setSuccessMessage(
        CONTACT_CREATED.replace(/Contact/g, moduleMap.contact.singular)
      );
      toggle();
    }

    setLoading(false);
  };

  const deleteContacts = async (selectedData) => {
    await contactService
      .deleteContacts(selectedData)
      .then((response) => {
        setDeleteResults(response);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const handleDelete = async () => {
    await deleteContacts(selectedData);
    setSelectedData([]);
    setShowDeleteReport(true);
  };

  const openDeleteModal = () => {
    setShowDeleteContactModal(true);
  };

  const loader = () => {
    if (showLoading) return <TableSkeleton cols={6} rows={10} />;
  };

  const onClose = () => {
    reset(
      initialPeopleForm,
      dispatchFormData({
        type: 'reset-peopleForm',
      })
    );
    setModal(false);
    setCustomFields([]);
  };

  const sortTable = ({ name }) => sortingTable({ name, order, setOrder });

  const handleRowClick = (row, col) => {
    if (row.dataRow && (col.key === 'name' || col.key === 'organization')) {
      history.push(row.dataRow[0].component.props.to);
    }
  };

  const handleClearSelection = () => {
    setSelectAll(false);
    setSelectedData([]);
  };
  const formLoader = () => {
    if (isLoading) return <Loading />;
  };
  return (
    <div>
      <div className="d-flex align-items-center mb-2 justify-content-between">
        <FilterTabsButtonDropdown
          options={PEOPLES_FILTER_OPTIONS_LIST}
          openFilter={openFilter}
          setOpenFilter={setOpenFilter}
          filterOptionSelected={filterOptionSelected}
          filterSelected={filterSelected}
          filterTabs={filterTabs}
          handleFilterSelect={handleFilterSelect}
          onHandleFilterOrg={onHandleFilterOrg}
          setFilterOptionSelected={setFilterOptionSelected}
          setFilterSelected={setFilterSelected}
          setFilterTabs={setFilterTabs}
          defaultSelection={defaultFilter}
        />
        {moduleMap.contact && (
          <LayoutHead
            onHandleCreate={toggle}
            buttonLabel={addButtonLabel}
            selectedData={selectedData}
            onDelete={openDeleteModal}
            dataInDB={dataInDB}
            onClear={handleClearSelection}
            alignTop="my-0"
            permission={{
              collection: 'contacts',
              action: 'create',
            }}
          ></LayoutHead>
        )}
      </div>

      {showDeleteContactModal && (
        <DeleteModal
          type="contacts"
          showModal={showDeleteContactModal}
          setShowModal={setShowDeleteContactModal}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          event={handleDelete}
          data={allContacts}
          results={deleteResults}
          setResults={setDeleteResults}
          showReport={showDeleteReport}
          setShowReport={setShowDeleteReport}
          modified={modified}
          setSelectAll={setSelectAll}
          setModified={setModified}
          constants={contactConstants.delete}
        />
      )}
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
                  showLoading={showLoading}
                  columns={peopleColumns}
                  data={data}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  selectedData={selectedData}
                  setSelectedData={setSelectedData}
                  onPageChange={(newPage) =>
                    changePaginationPage(newPage, setPaginationPage)
                  }
                  paginationInfo={pagination}
                  usePagination
                  title={`${moduleMap.contact.singular}`}
                  emptyDataText="No records in this view."
                  dataInDB={dataInDB}
                  toggle={toggle}
                  permission={{
                    collection: 'contacts',
                    action: 'create',
                  }}
                  sortingTable={sortTable}
                  sortingOrder={order}
                  onClickCol={handleRowClick}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      {modal && (
        <RightPanelModal
          showModal={modal}
          setShowModal={() => onClose()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0">{`Add ${moduleMap.contact.singular}`}</h3>
            </div>
          }
        >
          {isLoading ? (
            formLoader()
          ) : (
            <PeopleForm
              dispatch={dispatchFormData}
              moduleMap={moduleMap}
              allUsers={allOwners}
              peopleFormData={peopleFormData}
              refresh={() => getContacts(true)}
              isprincipalowner="true"
              register={register}
              loading={loading}
              setValue={setValue}
              getFieldState={getFieldState}
              control={control}
              customFields={customFields}
              setCustomFields={setCustomFields}
              errors={errors}
              onClose={onClose}
              handleSubmit={handleSubmit}
              onHandleSubmit={onHandleSubmit}
              fields={isFieldsData}
              prevalue="true"
              preowners={preOwners}
              setPreOwners={setPreOwners}
              peopleForm={peopleForm}
            />
          )}
        </RightPanelModal>
      )}
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
    </div>
  );
};

export default Peoples;
