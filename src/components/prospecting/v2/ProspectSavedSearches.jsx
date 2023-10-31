import React, { useEffect, useState } from 'react';
import MaterialIcon from '../../commons/MaterialIcon';
import SearchesService from '../../../services/searches.service';
import IconTextLoader from '../../loaders/IconText';
import MoreActions from '../../MoreActions';
import DeleteConfirmationModal from '../../modal/DeleteConfirmationModal';
import { useForm } from 'react-hook-form';
import SimpleModalCreation from '../../modal/SimpleModalCreation';
import { Form } from 'react-bootstrap';
import { Col, Row } from 'reactstrap';
import Asterick from '../../commons/Asterick';
import InputValidation from '../../commons/InputValidation';
import { ProspectTypes } from './constants';
import { useFilterProspectContext } from '../../../contexts/filterProspectContext';
import { getKeysWithData, overflowing } from '../../../utils/Utils';
import { usePagesContext } from '../../../contexts/pagesContext';
const EditSearchNameModal = ({
  search,
  openModal,
  setOpenModal,
  handleConfirmModal,
  loader,
}) => {
  const defaultFieldObject = {
    name: '',
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFieldObject,
  });

  const [editedField, setEditedField] = useState({ ...search });

  useEffect(() => {
    setEditedField(search);
    setValue('name', search?.name);
  }, [search]);

  const handleValueChange = (e) => {
    const { value } = e.target;
    setEditedField({ ...editedField, name: value });
    setValue('name', value);
  };

  const handleSave = () => {
    overflowing();
    handleConfirmModal(editedField);
    reset(defaultFieldObject);
  };

  return (
    <SimpleModalCreation
      modalTitle="Edit Search Name"
      open={openModal}
      bankTeam={false}
      isLoading={loader}
      handleSubmit={handleSubmit((d) => handleSave(d))}
      onHandleCloseModal={() => {
        overflowing();
        reset(defaultFieldObject);
        setOpenModal(!openModal);
      }}
    >
      <Form onSubmit={handleSubmit(handleSave)}>
        <Row className="align-items-center pb-3">
          <Col md={3}>
            <h5 className="mb-0">
              Search Name <Asterick />{' '}
            </h5>
          </Col>
          <Col md={9}>
            <InputValidation
              name="name"
              type="input"
              placeholder="Search Name"
              value={editedField?.name || ''}
              errorDisplay="position-absolute error-show-right"
              validationConfig={{
                required: true,
                inline: true,
                onChange: handleValueChange,
              }}
              errors={errors}
              register={register}
            />
          </Col>
        </Row>
      </Form>
    </SimpleModalCreation>
  );
};

const NoSearches = () => {
  return (
    <div className="d-flex w-100 align-items-center py-3 fs-7 text-gray-search justify-content-center">
      {' '}
      You have no saved searches.
    </div>
  );
};

const actionItems = [
  {
    id: 'edit',
    icon: 'edit',
    name: 'Edit',
  },
  {
    id: 'remove',
    icon: 'delete',
    name: 'Delete',
  },
];

const ProspectSavedSearches = ({
  setActiveTab,
  setErrorMessage,
  setSuccessMessage,
  chargeFilter,
  chargeFilterCompany,
  active,
  setActive,
  refreshCompanyFilter,
  refreshPeopleFilter,
  currentView,
  tabKeys,
}) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [componentsToDelete, setComponentsToDelete] = useState([]);
  const [selectedSearch, setSelectedSearch] = useState({});
  const [loader, setLoader] = useState(false);
  const [loaderEdit, setLoaderEdit] = useState(false);
  const [searches, setSearches] = useState([]);
  const [allSearches, setAllSearches] = useState([]);
  const { setGlobalFilters, setGlobalFiltersCompany } =
    useFilterProspectContext();

  const { pageContext, setPageContext } = usePagesContext();

  const handleSearchClick = (e, srch) => {
    e.preventDefault();
    const { type, value } = srch;
    const parsedFilter = JSON.parse(value);
    if (type === ProspectTypes.people) {
      setGlobalFilters(parsedFilter);
      chargeFilter(getKeysWithData(parsedFilter));
      refreshPeopleFilter((prevState) => prevState + 1);
      setActiveTab(tabKeys.people);
    } else {
      setGlobalFiltersCompany(parsedFilter);
      chargeFilterCompany(getKeysWithData(parsedFilter));
      refreshCompanyFilter((prevState) => prevState + 1);
      setActiveTab(tabKeys.organization);
    }
  };

  const buildDataByCurrentView = (arr) => {
    const filterType =
      currentView === tabKeys.organization ||
      currentView === ProspectTypes.company
        ? 'organization'
        : currentView === tabKeys.people
        ? 'people'
        : 'domain';
    return arr?.length ? arr.filter((a) => a?.type === filterType) : [];
  };

  const getSearches = async () => {
    setLoader(true);
    try {
      const data = await SearchesService.getSearches();
      setAllSearches(data);
      setSearches(buildDataByCurrentView(data));
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getSearches();
  }, []);

  const onHandleRemove = (srch) => {
    setSelectedSearch(srch);
    setComponentsToDelete([{ ...srch, title: srch.name }]);
    setOpenDeleteModal(true);
  };
  const handleConfirmDeleteSearch = async () => {
    try {
      await SearchesService.deleteSearch(selectedSearch.id);
      setSuccessMessage('Search is removed.');
      setOpenDeleteModal(false);
      setSearches([...searches].filter((s) => s.id !== selectedSearch.id));
      setComponentsToDelete([]);
    } catch (err) {
      console.log(err);
      setErrorMessage('Error deleting search. Check console for details.');
    }
  };
  const onHandleEdit = (srch) => {
    setSelectedSearch(srch);
    setOpenEditModal(true);
  };

  const handleConfirmUpdateSearch = async (updated) => {
    setLoaderEdit(true);
    try {
      await SearchesService.updateSearch(updated.id, {
        name: updated.name,
      });
      const newSearches = [...searches].map((srch) => ({
        ...srch,
        name: srch.id === updated.id ? updated.name : srch.name,
      }));
      const updatedSearches = [...allSearches].map((srch) => ({
        ...srch,
        name: srch.id === updated.id ? updated.name : srch.name,
      }));
      setSearches(newSearches);
      setAllSearches(updatedSearches);
      setSuccessMessage('Search name is updated.');
      setOpenEditModal(false);
    } catch (e) {
      console.log(e);
      setErrorMessage(
        'Error in updating search name, please check console for details.'
      );
    } finally {
      setLoaderEdit(false);
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'people':
        return 'person';
      case 'organization':
        return 'corporate_fare';
      case 'domain':
        return 'language';
    }
  };

  useEffect(() => {
    setSearches(buildDataByCurrentView(allSearches));
  }, [currentView]);

  useEffect(() => {
    if (pageContext.ProspectSearch) {
      const updatedSearches = [...allSearches, pageContext.ProspectSearch];
      setAllSearches(updatedSearches);
      setSearches(buildDataByCurrentView(updatedSearches));
      setPageContext({ ...pageContext, ProspectSearch: '' });
    }
  }, [pageContext]);

  return (
    <>
      {openEditModal && (
        <EditSearchNameModal
          openModal={openEditModal}
          handleConfirmModal={handleConfirmUpdateSearch}
          search={selectedSearch}
          loader={loaderEdit}
          setOpenModal={setOpenEditModal}
        />
      )}
      {openDeleteModal && (
        <DeleteConfirmationModal
          showModal={openDeleteModal}
          setShowModal={setOpenDeleteModal}
          setSelectedCategories={setComponentsToDelete}
          event={handleConfirmDeleteSearch}
          itemsConfirmation={componentsToDelete}
          itemsReport={[]}
        />
      )}
      <div
        className={`d-flex cursor-pointer item-filter align-items-center justify-content-between p-item-filter nav-link font-size-sm2 font-weight-medium px-3 py-2 ${
          active ? 'bg-primary text-white active' : ''
        }`}
        onClick={() => setActive(!active)}
      >
        <div className="d-flex align-items-center">
          <MaterialIcon
            icon="save_as"
            clazz={`material-icons-outlined fs-20 ${active ? 'fw-bold' : ''}`}
          />
          <span className="ml-1">
            Saved Searches{' '}
            <span className="font-weight-semi-bold">({searches.length})</span>
          </span>
        </div>
        <MaterialIcon clazz="font-size-sm2" icon={active ? 'remove' : 'add'} />
      </div>
      {active && loader && (
        <div className="w-100 px-3">
          <IconTextLoader count={3} />
        </div>
      )}
      {active && !searches.length && !loader && <NoSearches />}
      {active && (
        <div className="border-bottom py-2">
          {searches.map((srch) => (
            <div key={srch.id} className="p-0 py-1">
              <a
                onClick={(e) => handleSearchClick(e, srch)}
                className="d-flex cursor-pointer text-black item-filter p-item-filter align-items-center justify-content-between py-1 pl-3 pr-2"
              >
                <div className="d-flex align-items-center">
                  <MaterialIcon icon={getIconByType(srch.type)} clazz="fs-20" />
                  <p className="mb-0 ml-1 font-size-sm2 font-weight-medium">
                    {srch.name}{' '}
                  </p>
                </div>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className={`icon-hover-bg cursor-pointer mr-1`}
                >
                  <MoreActions
                    icon="more_vert"
                    items={actionItems}
                    onHandleRemove={() => onHandleRemove(srch)}
                    onHandleEdit={() => onHandleEdit(srch)}
                    iconStyle="text-black font-size-sm"
                    toggleClassName="w-auto h-auto pl-2 pr-0 py-0"
                  />
                </a>
              </a>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProspectSavedSearches;
