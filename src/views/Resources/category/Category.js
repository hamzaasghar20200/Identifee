import React, { useEffect, useState } from 'react';
import CategorySection from './CategorySection';
import categoryService from '../../../services/category.service';
import {
  COURSES_COMMING_SOON,
  LESSONS_COMMING_SOON,
} from '../../../utils/constants';
import { FILTER_OPTIONS_LIST } from '../../../components/lesson/StatsAndFilter';
import LoadMoreButton from '../../../components/lesson/LoadMoreButton';
import NoDataFound from '../../../components/commons/NoDataFound';
import {
  isModuleAllowed,
  LearnViewTypes,
  sortByCompleted,
  TrainingViewTypes,
} from '../../../utils/Utils';
import useUrlSearchParams from '../../../hooks/useUrlSearchParams';
import SubHeading from '../../../components/subheading';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import routes from '../../../utils/routes.json';
import { useHistory } from 'react-router-dom';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import { useTenantContext } from '../../../contexts/TenantContext';
export default function Category({ limit = 1000, category, topics }) {
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonPagination, setLessonPagination] = useState({ page: 1, limit });
  const [refreshView, setRefreshView] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [coursePagination, setCoursePagination] = useState({ page: 1, limit });
  const [overview, setOverview] = useState({});
  const [filterOptionSelected, setFilterOptionSelected] = useState(
    FILTER_OPTIONS_LIST[0]
  );
  const { tenant } = useTenantContext();
  const params = useUrlSearchParams();
  const topicTitle = params.get('title');
  const isAgileMindsetTitle = /Agile Mindset/gi.test(topicTitle);
  const categoryType = params.get('type');
  const self = true;
  const restrictBy = categoryType === 'custom' ? 'private' : 'externalPublic';
  const id = params.get('id');
  const [, setSelectedCategory] = useState({});
  const history = useHistory();
  const getCategoryDetails = async () => {
    if (category?.id) {
      const cat = await categoryService.GetCategoryById(category?.id);
      setSelectedCategory(cat);
    }
  };
  const getFiltersRequestByOptionStringify = (option, type) => {
    const { key } = option;

    const query = {};

    switch (key) {
      case 'latest':
        if (
          type === TrainingViewTypes.Course ||
          type === TrainingViewTypes.Lesson
        ) {
          query.order = [
            ['progress.completed_at', 'asc nulls first'],
            ['progress.last_attempted_at', 'desc nulls last'],
            ['updated_at', 'desc'],
          ];
        }
        break;
      case 'asc':
      case 'desc':
        if (type === TrainingViewTypes.Course) {
          query.order = [['name', key]];
        } else if (type === TrainingViewTypes.Lesson) {
          query.order = [['title', key]];
        }
        break;
      case 'favs':
        query.favorites = true;
    }

    return query;
  };

  const getFiltersRequestByOption = (option, type) => {
    const { key } = option;

    const query = {};

    switch (key) {
      case 'favs':
        query.favorites = true;
        break;
      case 'latest':
        query.order = [
          ['progress.completed_at', 'asc nulls first'],
          ['progress.last_attempted_at', 'desc nulls last'],
          ['updated_at', 'desc'],
        ];
        break;
      case 'asc':
      case 'desc':
        if (type === TrainingViewTypes.Course) {
          query.order = [['name', key]];
        } else if (type === TrainingViewTypes.Lesson) {
          query.order = [['title', key]];
        }
        break;
    }

    return query;
  };

  const sortByNumberCourse = (a, b) => {
    const numberA = parseInt(a.name.match(/\d+/)?.[0]);
    const numberB = parseInt(b.name.match(/\d+/)?.[0]);

    if (!isNaN(numberA) && !isNaN(numberB)) {
      return numberA - numberB;
    } else if (!isNaN(numberA)) {
      return -1;
    } else if (!isNaN(numberB)) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  };

  const getLessons = async () => {
    const filter = getFiltersRequestByOptionStringify(
      filterOptionSelected,
      TrainingViewTypes.Lesson
    );

    const resp = await categoryService
      .GetLessonsByCategory(
        restrictBy
          ? {
              ...filter,
              id: category.id,
              page: lessonPage,
              limit,
              self: true,
              progress: 'include',
              favorites: 'include',
              restrictBy,
            }
          : {
              ...filter,
              id: category.id,
              page: lessonPage,
              limit,
              self: true,
              progress: 'include',
              favorites: 'include',
            }
      )
      .catch((err) => console.log(err));

    const previousList = refreshView > 0 || !lessonsLoading ? [] : [...lessons];
    const newLessons = [...previousList, ...resp?.data];

    setLoading(false);
    setLessons(newLessons);
    setLessonsLoading(false);
    setLessonPagination(resp?.pagination);
  };

  const getCourses = async () => {
    const filter = getFiltersRequestByOption(
      filterOptionSelected,
      TrainingViewTypes.Course
    );

    const resp = await categoryService
      .getCoursesByCategory(
        category.id,
        restrictBy
          ? {
              ...filter,
              page: coursePage,
              limit,
              self: true,
              progress: 'include',
              favorites: 'include',
              restrictBy,
            }
          : {
              ...filter,
              page: coursePage,
              limit,
              self: true,
              progress: 'include',
              favorites: 'include',
            }
      )
      .catch((err) => console.log(err));

    const previousList = refreshView > 0 || !coursesLoading ? [] : [...courses];
    const sortedCompleted = sortByCompleted(
      [...previousList, ...resp?.data],
      'courseTracking'
    );
    sortedCompleted.sort(sortByNumberCourse);
    setCourses(sortedCompleted);
    setCoursesLoading(false);
    setLoading(false);
    setCoursePagination(resp?.pagination);
  };

  function getCoursesLessonsByCategory() {
    setLoading(true);
    getLessons();
    getCourses();
  }
  useEffect(() => {
    setLoading(false);
    setOverview({
      total_lessons: lessonPagination.count,
    });
  }, [lessonPagination, coursePagination]);

  useEffect(() => {
    if (refreshView > 0) {
      setLoading(true);
      setLessons([]);
      getLessons();
    }
  }, [refreshView]);

  const onCoursesLoadMore = () => {
    setCoursesLoading(true);
    setRefreshView(0);
    setCoursePage((prevState) => prevState + 1);
  };

  const onLessonsLoadMore = () => {
    setLessonsLoading(true);
    setRefreshView(0);
    setLessonPage((prevState) => prevState + 1);
  };

  useEffect(() => {
    getCoursesLessonsByCategory();
    getCategoryDetails();
  }, [id, category?.id]);
  const handleFilterSelect = (e, option) => {
    e.preventDefault();
    setFilterOptionSelected(option);
    setRefreshView((prevState) => prevState + 1);
  };
  return (
    <div className="pipeline-header">
      {isAgileMindsetTitle &&
        isModuleAllowed(tenant?.modules, 'self_assessment') && (
          <div className="shadow-sm text-white mt-3 py-2 px-3 bg-primary rounded">
            <div className="d-flex align-items-center gap-2 justify-content-between">
              <div className="d-flex align-items-center gap-1">
                <MaterialIcon icon="psychology" filled />
                <span className="font-size-sm2 font-weight-medium">
                  What&apos;s Your Communication Style?
                </span>
              </div>
              <ButtonIcon
                label="Start Your Self-Assessment"
                color="primary"
                classnames="btn-sm border-1 border-white rounded-pill bg-hover-white-primary font-weight-medium"
                onclick={() => {
                  history.push(
                    `${routes.learnMain}?viewType=${LearnViewTypes.SelfAssessment}&start=true`
                  );
                }}
              />
            </div>
          </div>
        )}
      <div
        className={`px-0 pb-3 position-relative ${
          isAgileMindsetTitle ? 'pt-5' : 'pt-3'
        }`}
      >
        <SubHeading title={category.title} />
      </div>
      <div className="mt-0">
        <CategorySection
          slug={category.path}
          data={courses}
          loading={loading}
          commingSoonText={COURSES_COMMING_SOON}
          title="Courses"
          self={self}
          sectionType="course"
        />
        <LoadMoreButton
          list={courses}
          pagination={coursePagination}
          loading={coursesLoading}
          onClick={onCoursesLoadMore}
        />
        {loading && <br />}
        <CategorySection
          slug={category.path}
          data={lessons}
          loading={loading}
          handleFilterSelect={handleFilterSelect}
          filterOptionSelected={filterOptionSelected}
          overview={overview}
          self={self}
          category={category}
          commingSoonText={LESSONS_COMMING_SOON}
          title="Lessons"
        />
        <LoadMoreButton
          list={lessons}
          pagination={lessonPagination}
          loading={lessonsLoading}
          onClick={onLessonsLoadMore}
        />
      </div>

      {filterOptionSelected.key === 'favs' &&
      !loading &&
      !lessons.length &&
      !courses.length ? (
        <NoDataFound
          title="No favorite here."
          icon="school"
          containerStyle="text-gray-900 my-6 py-6"
        ></NoDataFound>
      ) : (
        <div>
          {!loading && !lessons.length && !courses.length && (
            <NoDataFound
              title="No data available."
              description="Courses and lessons are coming soon."
              icon="school"
              containerStyle="text-gray-900 my-6 py-6"
            ></NoDataFound>
          )}
        </div>
      )}
    </div>
  );
}
