import React, { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';

import Card from '../../components/lesson/card';
import { categoriesDefaultInfo } from '../../views/Resources/category/constants/Category.constants';
import courseService from '../../services/course.service';
import CardSkeleton from '../../components/lesson/CardSkeleton';
import NoDataFound from '../../components/commons/NoDataFound';
import { LearnViewTypes, sortByCompleted } from '../../utils/Utils';
import lessonService from '../../services/lesson.service';
import SubHeading from '../../components/subheading';

function LessonCard(props) {
  const { lesson, setLesson, topics } = props;
  const [icon, setIcon] = useState('');

  useEffect(() => {
    const { category } = lesson;

    const categoryInfo = category;

    if (categoryInfo) {
      const slug = categoryInfo.title
        .toLocaleLowerCase()
        .trim()
        .replace(/ /g, '-');

      const icon = categoriesDefaultInfo[slug]?.icon || 'summarize';
      setIcon(icon);
    }
  }, []);

  return (
    <Card
      item={lesson}
      setItem={setLesson}
      icon={icon}
      topics={topics}
      sectionType={
        Object.hasOwn(lesson, 'is_learning_path') ? 'course' : 'lesson'
      }
    />
  );
}

function MyLessonsSection({ data, setData, topics, loading }) {
  if (loading)
    return (
      <div className="px-2 pt-1 mt-2 pb-1">
        <CardSkeleton count={3} cols="row-cols-md-3" />{' '}
      </div>
    );

  return (
    <>
      {data?.length > 0 && (
        <div className="px-2 pt-1">
          <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3">
            {data.map((lessonCourse, indx) => (
              <Col key={indx} className="mb-3 px-2">
                <LessonCard
                  lesson={lessonCourse}
                  setLesson={setData}
                  topics={topics}
                />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </>
  );
}

export default function MyLessons({ selectedFilter, topics }) {
  const limit = 1000; // default items count for this page
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  async function getFavoriteLessonsAndCourses() {
    const filter = {
      order: [
        ['progress.completed_at', 'asc nulls first'],
        ['progress.last_attempted_at', 'desc nulls last'],
        ['updated_at', 'desc'],
      ],
    };

    const requests = [];

    requests.push(
      lessonService.getLessons({
        page: 1,
        limit,
        self: true,
        favorites: 'required',
        progress: 'include',
        ...filter,
      })
    );
    requests.push(
      courseService.getCourses({
        page: 1,
        limit,
        self: true,
        favorites: 'required',
        progress: 'include',
        ...filter,
      })
    );

    try {
      setLoading(true);
      const responses = await Promise.all(requests);

      const lessons = sortByCompleted(responses[0]?.data);
      const courses = sortByCompleted(responses[1]?.data, 'courseTracking');

      setData([...lessons, ...courses]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getFavoriteLessonsAndCourses();
  }, []);

  const handleDataUpdate = (favoriteItem) => {
    const newData = data.filter((d) => {
      return d.id !== favoriteItem.id;
    });
    setData(newData);
  };
  return (
    <>
      <div className="pipeline-header">
        {selectedFilter?.key === LearnViewTypes.Overview && data.length > 0 && (
          <SubHeading title="My Assignments" headingStyle="mt-4 px-2 mb-0" />
        )}
        <div
          className={
            selectedFilter?.key === LearnViewTypes.MyFavorites &&
            data.length > 0
              ? 'mt-3'
              : ''
          }
        >
          <MyLessonsSection
            data={data}
            setData={handleDataUpdate}
            loading={loading}
            title={'My Favorites'}
            topics={topics}
          />
        </div>
        {!loading &&
          !data.length &&
          selectedFilter?.key === LearnViewTypes.MyFavorites && (
            <NoDataFound
              title={`${
                selectedFilter?.key === LearnViewTypes.MyFavorites
                  ? 'No favorites yet.'
                  : 'No data available.'
              }`}
              description={`${
                selectedFilter?.key === LearnViewTypes.MyFavorites
                  ? 'To get started, explore available categories (Topics/Custom) from top left menu.'
                  : 'To get started, explore available categories listed below.'
              }`}
              icon={`${
                selectedFilter?.key === LearnViewTypes.MyFavorites
                  ? 'favorite_outline'
                  : 'manage_search'
              }`}
              containerStyle="text-gray-900 my-6 py-6"
            ></NoDataFound>
          )}
      </div>
    </>
  );
}
