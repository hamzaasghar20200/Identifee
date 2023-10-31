import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

import Table from '../GenericTable';
import { paginationDefault, SEARCH_LESSONS } from '../../utils/constants';
import { tableLessonColumns } from './ManageLessonsConstants';
import { DataFilters } from '../DataFilters';
import lessonService from '../../services/lesson.service';
import { setDateFormat, TrainingFilterOptions } from '../../utils/Utils';
import LayoutHead from '../commons/LayoutHead';
import { sortingTable } from '../../utils/sortingTable';
import TableSkeleton from '../commons/TableSkeleton';
import StatusLabel from '../commons/StatusLabel';
import DeleteConfirmationModal from '../modal/DeleteConfirmationModal';
import TableActions from '../commons/TableActions';
import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';
import { useProfileContext } from '../../contexts/profileContext';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
export default function LessonsTable({ setId, setCreate }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { profileInfo } = useProfileContext();
  const roleInfo = profileInfo?.role;
  const isAdmin = roleInfo?.admin_access;
  const [allLessons, setAllLessons] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [pagination, setPagination] = useState(paginationDefault);
  const [paginationPage, setPaginationPage] = useState(paginationDefault);
  const [filterSelected, setFilterSelected] = useState({});
  const [showLoading, setShowLoading] = useState(false);
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([['updated_at', 'DESC']]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [itemsConfirmation, setItemsConfirmation] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModalSingleDelete, setOpenModalSingleDelete] = useState(false);
  const [selectedSingleLesson, setSelectedSingleLesson] = useState([]);

  const draft = [];
  const publised = [];
  for (let i = 0; i < allLessons?.length; i++) {
    if (allLessons[i]?.status === 'draft') {
      draft.push(allLessons[i]);
    }
    if (allLessons[i]?.status === 'published') {
      publised.push(allLessons[i]);
    }
  }

  const [filterOptionSelected, setFilterOptionSelected] = useState({
    id: 1,
    key: 'updated_at',
    name: 'Last Modified',
  });

  async function onGetLessons(count) {
    setShowLoading(true);
    const response = await lessonService
      .getLessons({
        page: paginationPage.page,
        limit: 10,
        order,
        status: "ne 'deleted'",
        ...filterSelected,
      })
      .catch((err) => console.log(err));

    const { data, pagination } = response || {};

    setPagination(pagination);
    setAllLessons(data);
    if (count) setDataInDB(Boolean(pagination?.totalPages));
    setShowLoading(false);
  }

  useEffect(() => {
    onGetLessons(true);
  }, [filterSelected, paginationPage, order]);

  useEffect(() => {
    if (selectedLessons.length > 0) {
      const selectedLessonsData = selectedLessons.map((id) => {
        return allLessons.find((lesson) => lesson.id === parseInt(id));
      });
      setItemsConfirmation(selectedLessonsData);
    }
  }, [selectedLessons]);

  const redirectTo = (row) => {
    if (isAdmin || (!isAdmin && !row.isPublic)) {
      setId(row.id);
      setCreate(true);
    }
  };

  const handleDelete = (row) => {
    setId(row.id);
    setSelectedSingleLesson([row]);
    setOpenModalSingleDelete(true);
  };

  const lockedClick = (row) => {
    // TODO locked action
  };

  const permissions = {
    collection: 'lessons',
    action: 'create',
  };

  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      onClick: redirectTo,
      permission: {
        collection: 'lessons',
        action: 'edit',
      },
    },
    {
      id: 2,
      title: 'Delete',
      icon: 'delete',
      onClick: handleDelete,
      style: 'ml-3 text-danger',
      permission: {
        collection: 'lessons',
        action: 'delete',
      },
    },
  ];

  const tableActionsLock = [
    {
      id: 1,
      title: 'Locked',
      icon: 'lock',
      onClick: lockedClick,
      permission: {
        collection: 'lessons',
        action: 'delete',
      },
    },
  ];

  const data = allLessons?.map((lesson) => ({
    ...lesson,
    dataRow: [
      {
        key: 'title',
        component: (
          <span className="pl-2 d-inline-block text-wrap">{lesson.title}</span>
        ),
      },
      {
        key: 'category',
        component: (
          <span className="title-overflow">{lesson?.category?.title}</span>
        ),
      },
      {
        key: 'updated_at',
        component: <span>{setDateFormat(lesson.updated_at)}</span>,
      },
      {
        key: 'status',
        component: <StatusLabel status={lesson.status} />,
      },
      {
        key: '',
        component: (
          <TableActions
            item={lesson}
            actions={
              isAdmin
                ? tableActions
                : lesson.isPublic
                ? tableActionsLock
                : tableActions
            }
          />
        ),
      },
    ],
  }));

  const changePaginationPage = (newPage) => {
    setPaginationPage((prev) => ({ ...prev, page: newPage }));
  };

  const onCreateLesson = () => {
    setId(null);
    setCreate(true);
  };

  const loader = () => {
    if (showLoading) return <TableSkeleton cols={4} rows={10} />;
  };

  const sortTable = ({ name }) => {
    if (name === 'category') name = 'category_id';

    sortingTable({ name, order, setOrder: (val) => setOrder([val]) }, true);
  };
  const onHandleDeleteSingle = async () => {
    const lessonId = selectedSingleLesson[0].id;
    try {
      await lessonService.deleteLesson(lessonId);
      onGetLessons(true);
      setSelectAll(false);
      setSelectedSingleLesson([]);
      setItemsConfirmation([]);
      setOpenModalSingleDelete(false);
    } catch (error) {
      if (error.response.status === 409) {
        setErrorMessage('Lesson is assigned to courses');
      }
    }
  };
  const onHandleDelete = async () => {
    const deleteRequests = [];
    selectedLessons.forEach((lessonId) => {
      deleteRequests.push(lessonService.deleteLesson(lessonId));
    });
    await Promise.all(deleteRequests);
    onGetLessons(true);
    setSelectAll(false);
    setSelectedLessons([]);
    setItemsConfirmation([]);
    setOpenModal(false);
  };

  const clearSelection = () => {
    setSelectAll(false);
    setSelectedLessons([]);
  };

  const handleFilterSelect = (e, option) => {
    e.preventDefault();
    setFilterOptionSelected(option);
    setPaginationPage((prev) => ({ ...prev, page: 1 }));
    if (option.key === 'updated_at') {
      setFilterSelected({
        order: [['updated_at', 'DESC']],
      });
    } else {
      setFilterSelected({ status: option.key });
    }
  };

  return (
    <>
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
      <DeleteConfirmationModal
        showModal={openModal}
        clearSelection={clearSelection}
        setShowModal={setOpenModal}
        setSelectedCategories={setSelectedLessons}
        itemsConfirmation={itemsConfirmation}
        itemsReport={[]}
        event={onHandleDelete}
      />
      <DeleteConfirmationModal
        showModal={openModalSingleDelete}
        clearSelection={clearSelection}
        setShowModal={setOpenModalSingleDelete}
        setSelectedCategories={setSelectedSingleLesson}
        itemsConfirmation={selectedSingleLesson}
        itemsReport={[]}
        event={onHandleDeleteSingle}
      />
      <LayoutHead
        onHandleCreate={onCreateLesson}
        alignTop="pb-2 position-absolute -top-55"
        buttonLabel={'Add Lesson'}
        selectedData={selectedLessons}
        onClear={clearSelection}
        onDelete={() => setOpenModal(true)}
        allRegister={`${pagination?.count || 0} Lessons`}
        dataInDB={dataInDB}
        permission={permissions}
      >
        <ButtonFilterDropdown
          options={TrainingFilterOptions}
          filterOptionSelected={filterOptionSelected}
          handleFilterSelect={handleFilterSelect}
        />
      </LayoutHead>

      <Card className="mb-5">
        <Card.Header>
          <DataFilters
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
            searchPlaceholder={SEARCH_LESSONS}
            paginationPage={paginationPage}
            setPaginationPage={setPaginationPage}
          />
        </Card.Header>
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
                  checkbox={isAdmin}
                  columns={tableLessonColumns}
                  data={data}
                  selectAll={selectAll}
                  setSelectAll={setSelectAll}
                  selectedData={selectedLessons}
                  setSelectedData={setSelectedLessons}
                  onPageChange={(newPage) =>
                    changePaginationPage(newPage, setPaginationPage)
                  }
                  paginationInfo={pagination}
                  usePagination
                  emptyDataText="No lessons."
                  title="lesson"
                  dataInDB={dataInDB}
                  onClick={redirectTo}
                  toggle={onCreateLesson}
                  permission={permissions}
                  sortingTable={sortTable}
                  sortingOrder={order}
                />
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
