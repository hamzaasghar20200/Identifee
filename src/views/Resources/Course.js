import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import PageTitle from '../../components/commons/PageTitle';
import LearnFilter from '../../components/commons/LearnFilter';
import { LearnViewTypes } from '../../utils/Utils';
import { LessonLayout } from '../../components/lessonLayout';
import courseService from '../../services/course.service';
import Card from '../../components/lesson/card';
import routes from '../../utils/routes.json';
import Heading from '../../components/heading';

export default function Course() {
  const history = useHistory();
  const [currentCourse, setCurrentCourse] = useState({ state: 'progress' });
  const { id: course_id } = useParams();
  const [lessons, setLessons] = useState([]);

  const getData = async (id) => {
    try {
      const [
        fullCourse,
        course,
        progressCourse = { status: 'pending', progress: 0 },
      ] = await Promise.all([
        courseService.getCourseById(id),
        courseService.getCourseLessonsById(id),
        courseService.getCourseProgress(id, { self: true }).catch(() => {}),
      ]);

      if (progressCourse && course) {
        const { status, progress } = progressCourse;
        const { is_learning_path, lessons, quiz_id, ...restProps } = course;

        setCurrentCourse({
          state: status,
          progress,
          is_learning_path,
          quiz_id,
          category: !is_learning_path ? lessons[0]?.category : null,
          ...restProps,
          contents: fullCourse?.contents,
        });

        const lessonsCourseProgress =
          await courseService.getLessonCourseProgress(id, {
            self: true,
          });
        const lessonsProgress = lessons.map((lesson) => {
          const lessonFind = lessonsCourseProgress.find(
            (lessonsCourse) => lessonsCourse.lesson_id === lesson.id
          );

          return {
            ...lesson,
            progress: lessonFind?.progress || 0,
          };
        });

        const lessonsOrder = lessonsProgress.sort((next, prox) => {
          if (
            next.CourseLessonModel.position > prox.CourseLessonModel.position
          ) {
            return 1;
          }
          return -1;
        });
        if (lessonsOrder.length > 0) {
          const arr = [...lessonsOrder];
          arr.push({
            state: status,
            progress,
            is_learning_path,
            quiz_id,
            category: !is_learning_path ? lessons[0]?.category : null,
            ...restProps,
            contents: fullCourse?.contents,
          });
          setLessons(arr);
        }
      } else {
        history.push('/');
      }
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData(course_id);
  }, [course_id]);

  const redirect = (id, nextLessons = undefined) => {
    console.log(id, nextLessons);
    history.push({
      pathname: `${routes.learnLessons}/${id}/page/1/course/${currentCourse.id}`,
      state: { nextLessons },
    });
  };

  const checkLessonProgressAndRedirect = (first = undefined, id = 0) => {
    const nextInProgressLessons = lessons.filter((item) => item.progress < 100);
    let redirectLessonId = lessons[0]?.id;
    if (id) {
      redirectLessonId = id;
    } else if (!first && nextInProgressLessons.length > 0) {
      redirectLessonId = nextInProgressLessons[0]?.id;
    }

    const availableInProgressLessons = nextInProgressLessons.filter(
      (item) => item.id !== redirectLessonId
    );
    redirect(redirectLessonId, availableInProgressLessons);
  };
  const startCourse = async (first) => {
    try {
      const course = await courseService.continue(course_id);
      const { progress, status } = course;
      setCurrentCourse({
        ...currentCourse,
        state: status,
        progress,
      });
      checkLessonProgressAndRedirect(first, 0);
    } catch (e) {
      // setErrorMessage(e);
    }
  };
  const onHandleClickActionCourse = () => {
    const { state } = currentCourse;
    switch (state) {
      case 'pending':
        startCourse();
        break;
      case 'in_progress': {
        checkLessonProgressAndRedirect();
        break;
      }
      case 'completed': {
        const { quiz_id, contents } = currentCourse;
        let courseContentId;
        if (contents.length > 0) {
          courseContentId = contents[0].courseContentId;
        }
        history.push(
          `${routes.courses}/${course_id}/quizzes/${quiz_id}?courseContentId=${courseContentId}`
        );
        break;
      }
    }
  };
  return (
    <div>
      <PageTitle page={currentCourse?.title} pageModule="Learn" />
      <LearnFilter
        defaultFilter={{
          name: 'Topics',
          key: LearnViewTypes.Topics,
          component: null,
          submenu: null,
        }}
      />
      <LessonLayout
        setLesson={setCurrentCourse}
        lesson={currentCourse}
        relatedLessons={lessons}
      >
        {currentCourse && (
          <>
            <div className="my-3">
              <span className="text-primary fs-7 font-weight-500">Lesson</span>
              <Heading
                title={lessons?.length > 0 && lessons[0]?.category?.title}
                pageHeaderDivider="pb-0 mb-0"
              />
            </div>
            <Card
              item={currentCourse}
              sectionType={'course-footer'}
              classnames={
                'd-flex flex-row-reverse flex-wrap justify-content-between align-items-center'
              }
              handleStartCourse={onHandleClickActionCourse}
            />
          </>
        )}
      </LessonLayout>
    </div>
  );
}
