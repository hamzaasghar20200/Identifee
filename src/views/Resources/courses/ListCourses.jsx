import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

import {
  paginationDefault,
  SEARCH_COURSES,
  SERVER_ERROR,
} from '../../../utils/constants';
import stringConstants from '../../../utils/stringConstants.json';
import CoursesTable from '../../../components/courses/CoursesTable';
import courseService from '../../../services/course.service';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import LayoutHead from '../../../components/commons/LayoutHead';
import { sortingTable } from '../../../utils/sortingTable';
import DeleteConfirmationModal from '../../../components/modal/DeleteConfirmationModal';
import TableSkeleton from '../../../components/commons/TableSkeleton';
import { DataFilters } from '../../../components/DataFilters';
import { TrainingFilterOptions } from '../../../utils/Utils';
import ButtonFilterDropdown from '../../../components/commons/ButtonFilterDropdown';
import ModalCreateCourse from '../../../components/modal/ModalCreateCourse';
import { useProfileContext } from '../../../contexts/profileContext';
const constants = stringConstants.settings.resources.courses;
const ListCourses = ({ setCreate, setId }) => {
  const [courses, setCourses] = useState([]);
  const [coursesSelect, setCoursesSelect] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterSelected, setFilterSelected] = useState({});
  const [dataInDB, setDataInDB] = useState(false);
  const [order, setOrder] = useState([['updated_at', 'DESC']]);
  const [selectAll, setSelectAll] = useState(false);
  const [coursesToDelete, setCoursesToDelete] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paginationPage, setPaginationPage] = useState(paginationDefault);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [filterOptionSelected, setFilterOptionSelected] = useState({
    id: 1,
    key: 'updated_at',
    name: 'Last Modified',
  });
  const { profileInfo } = useProfileContext();
  const roleInfo = profileInfo?.role;
  const isAdmin = roleInfo?.admin_access;
  const findCourses = async (count) => {
    setLoading(true);
    const data = await courseService
      .getCourses({
        page: paginationPage.page,
        limit: 10,
        deleted: false,
        order,
        ...filterSelected,
      })
      .catch((e) => setErrorMessage(SERVER_ERROR));

    const { data: courses, pagination } = data;

    setPaginationData(pagination);
    setCourses(courses);
    if (count) setDataInDB(Boolean(pagination?.totalPages));
    setLoading(false);
  };

  const onHandleChangePage = (page) => {
    setPaginationPage((prevState) => ({ ...prevState, page }));
  };

  const onHandleFilterCourse = (e, option) => {
    e.preventDefault();
    setFilterOptionSelected(option);
    setPaginationPage((prev) => ({ ...prev, page: 1 }));
    if (option.key === 'updated_at') {
      setFilterSelected({
        order: [['updated_at', 'DESC']],
      });
    } else {
      setFilterSelected({
        status: option.key,
      });
    }
  };

  const onHandleSetSelectedCourses = (items) => {
    console.log(items);
    setCoursesSelect(items);
  };

  const onHandleRedirectCourses = (item) => {
    if (isAdmin || (!isAdmin && !item.isPublic)) {
      setId(item.id);
      setCreate(true);
    }
  };

  useEffect(() => {
    findCourses(true);
  }, [filterSelected, paginationPage, order]);

  const sortTable = ({ name }) =>
    sortingTable({ name, order, setOrder: (val) => setOrder([val]) }, true);

  const clearSelection = () => {
    setSelectAll(false);
    setCoursesSelect([]);
  };

  const handleDelete = (course) => {
    setCoursesToDelete([course]);
    setShowDeleteModal(true);
  };

  const handleDeleteCourse = async () => {
    const course = coursesToDelete[0];
    await courseService.deleteCourses([course?.id]);
    setCoursesToDelete([]);
    setShowDeleteModal(false);
    findCourses(true);
  };
  const permissions = {
    collection: 'courses',
    action: 'create',
  };

  return (
    <div>
      <LayoutHead
        onHandleCreate={() => {
          setShowCreateModal(true);
        }}
        alignTop="pb-2 position-absolute -top-55"
        buttonLabel={constants.addCourse}
        selectedData={coursesSelect}
        onClear={clearSelection}
        allRegister={`${paginationData.count || 0} Courses`}
        dataInDB={dataInDB}
        permission={permissions}
      >
        <ButtonFilterDropdown
          options={TrainingFilterOptions}
          filterOptionSelected={filterOptionSelected}
          handleFilterSelect={onHandleFilterCourse}
        />
      </LayoutHead>

      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="warning"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <DeleteConfirmationModal
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        setSelectedCategories={setCoursesToDelete}
        event={handleDeleteCourse}
        itemsConfirmation={coursesToDelete}
        itemsReport={[]}
      />
      <ModalCreateCourse
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        onCreate={onHandleRedirectCourses}
      />
      <Card className="mb-5">
        <Card.Header>
          <DataFilters
            filterSelected={filterSelected}
            setFilterSelected={setFilterSelected}
            searchPlaceholder={SEARCH_COURSES}
            paginationPage={paginationData}
            setPaginationPage={setPaginationData}
          />
        </Card.Header>
        <Card.Body className="p-0">
          {loading && <TableSkeleton cols={5} rows={10} />}
          {!loading && (
            <CoursesTable
              data={courses}
              paginationInfo={paginationData}
              onPageChange={onHandleChangePage}
              selectedCourses={coursesSelect}
              setSelectedCourses={onHandleSetSelectedCourses}
              dataInDB={dataInDB}
              sortingTable={sortTable}
              sortingOrder={order}
              setCreate={() => {
                setShowCreateModal(true);
              }}
              permission={permissions}
              onClickRow={(item) => {
                onHandleRedirectCourses(item);
              }}
              selectAll={selectAll}
              setSelectAll={setSelectAll}
              handleDelete={handleDelete}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListCourses;
