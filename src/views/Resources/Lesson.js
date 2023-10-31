import React, { useEffect, useState } from 'react';
import { CardBody } from 'reactstrap';
import { Steps, Step } from 'react-step-builder';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import Heading from '../../components/heading';
import Nav from '../../components/lesson/nav';
import Page from '../../components/lesson/page';
import Hero from '../../components/lesson/hero';
import { API } from '../../services/api';
import lessonService from '../../services/lesson.service';
import { COMPLETED, CONGRATULATIONS, QUIZ } from '../../utils/constants';
import PageTitle from '../../components/commons/PageTitle';
import LearnFilter from '../../components/commons/LearnFilter';
import { LearnViewTypes } from '../../utils/Utils';
import { LessonLayout } from '../../components/lessonLayout';
import categoryService from '../../services/category.service';
import courseService from '../../services/course.service';
import routes from '../../utils/routes.json';
import Card from '../../components/lesson/card';

export default function Lesson(props) {
  const api = new API();
  const { id, course_id } = useParams();
  const nextLessons = props?.location?.state?.nextLessons;
  const history = useHistory();
  const [progress, setProgress] = useState(undefined);

  const [currentLessonCourse, setCurrentLessonCourse] = useState({
    state: 'in_progress',
  });
  const [nextLesson, setNextLesson] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [relatedLessons, setRltLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = useLocation();
  const pathName = path?.pathname.includes('lessons')
    ? 'lessons'
    : path?.pathname.includes('courses')
    ? 'courses'
    : '';
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

        setCurrentLessonCourse({
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
          setProgress(lessonFind?.progress || 0);
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
          setRltLessons(lessonsOrder);
        }
      } else {
        history.push('/');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (pathName === 'courses' || (id && course_id)) {
      getData(id && course_id ? course_id : id);
    }
  }, [id, pathName, course_id]);

  const redirect = (id, nextLessons = undefined) => {
    history.push({
      pathname: `${routes.learnLessons}/${id}/page/1/course/${currentLessonCourse.id}`,
      state: { nextLessons },
    });
  };

  const checkLessonProgressAndRedirect = (first = undefined, id = 0) => {
    const nextInProgressLessons = relatedLessons.filter(
      (item) => item.progress < 100
    );
    let redirectLessonId = relatedLessons[0]?.id;
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
      const course = await courseService.continue(id);
      const { progress, status } = course;
      setCurrentLessonCourse({
        ...currentLessonCourse,
        state: status,
        progress,
      });
      checkLessonProgressAndRedirect(first, 0);
    } catch (e) {
      // setErrorMessage(e);
    }
  };
  const onHandleClickActionCourse = () => {
    const { state } = currentLessonCourse;
    switch (state) {
      case 'pending':
        startCourse();
        break;
      case 'in_progress': {
        checkLessonProgressAndRedirect();
        break;
      }
      case 'completed': {
        const { quiz_id, contents } = currentLessonCourse;
        let courseContentId;
        if (contents.length > 0) {
          courseContentId = contents[0].courseContentId;
        }
        history.push(
          `${routes.courses}/${id}/quizzes/${quiz_id}?courseContentId=${courseContentId}`
        );
        break;
      }
    }
  };
  const getRelatedLessons = async () => {
    const data = await categoryService.GetLessonsByCategory({
      id: currentLessonCourse?.category_id,
      limit: 5,
    });
    setRltLessons(data?.data);
    setLoading(false);
  };
  useEffect(() => {
    if (
      currentLessonCourse?.category_id &&
      pathName === 'lessons' &&
      !course_id
    ) {
      getRelatedLessons(currentLessonCourse?.category_id);
    }
  }, [currentLessonCourse?.category_id, pathName]);

  useEffect(() => {
    if (id && pathName === 'lessons') {
      getLesson(id);
    }
  }, [id, pathName]);

  const getLesson = async () => {
    window.scrollTo(0, 0);

    if (currentLessonCourse && currentLessonCourse.id === id) {
      return;
    }

    const apiLesson = await api
      .GetLessonById(id)
      .catch((err) => console.log(err));

    if (!apiLesson) {
      return;
    }

    try {
      const resp = await lessonService.GetLessonTrackByLessonId(id, {
        self: true,
      });

      const { completed_at, status } = resp || {};

      let newPages = apiLesson.pages.slice();

      if (completed_at && status === COMPLETED) {
        newPages = apiLesson.pages.filter((page) => !page.type.includes(QUIZ));
      }

      setCurrentLessonCourse({
        ...apiLesson,
        pages: newPages,
        lessonTrack: resp || {},
      });
    } catch (e) {
      // first time lesson progress comes null, so default/first page load
      const newPages = apiLesson.pages.slice();
      setCurrentLessonCourse({
        ...apiLesson,
        pages: newPages,
        lessonTrack: {},
      });
    }
  };

  useEffect(() => {
    if (nextLessons?.length > 0 && pathName === 'lessons') {
      setNextLesson(nextLessons);
    }
  }, [nextLessons]);

  useEffect(() => {
    if (refresh > 0) {
      // avoiding api calls on retake.
      getLesson();
      setRefresh(0);
    }
  }, [refresh]);
  const config = {
    navigation: {
      component: Nav, // a React component with special props provided automatically
      location: 'after', // or after
    },
  };
  const FirstStep = (props) => {
    return (
      <Hero
        points={currentLessonCourse.max_points}
        {...props}
        setRefresh={setRefresh}
        nextLessons={nextLesson}
        course={course_id}
      />
    );
  };

  return (
    <div>
      <PageTitle page={currentLessonCourse?.title} pageModule="Learn" />
      <LearnFilter
        defaultFilter={{
          name: 'Topics',
          key: LearnViewTypes.Topics,
          component: null,
          submenu: null,
        }}
      />
      <LessonLayout
        lesson={currentLessonCourse}
        progress={progress}
        relatedLessons={relatedLessons}
        loading={loading}
        course={pathName === 'courses' ? id : course_id}
        lessonId={pathName === 'lessons' ? id : ''}
      >
        {(currentLessonCourse &&
          pathName === 'lessons' &&
          currentLessonCourse.category_id) ||
        (id && course_id) ? (
          <>
            <div className="my-3">
              <span className="text-primary fs-7 font-weight-500">Lesson</span>
              <Heading
                title={currentLessonCourse?.category?.title}
                pageHeaderDivider="pb-0 mb-0"
              />
            </div>
            <div className="card rounded-lg card-lesson-hero">
              <CardBody>
                <Steps config={config}>
                  <Step
                    title={currentLessonCourse?.title}
                    lesson={currentLessonCourse}
                    component={(props) => <FirstStep {...props} />}
                  />
                  {currentLessonCourse.pages?.map((p, indx) => (
                    <Step
                      key={indx}
                      lessonId={currentLessonCourse?.id}
                      firstPage={currentLessonCourse?.pages[0]}
                      title={p?.title}
                      component={(props) => (
                        <Page
                          {...props}
                          lesson={currentLessonCourse}
                          page={p}
                        />
                      )}
                    />
                  ))}
                  <Step
                    title={CONGRATULATIONS}
                    lesson={currentLessonCourse}
                    component={(props) => (
                      <Hero
                        {...props}
                        course={course_id}
                        category_id={currentLessonCourse?.category_id}
                        nextLessons={nextLesson}
                        setRefresh={setRefresh}
                      />
                    )}
                  />
                </Steps>
              </CardBody>
            </div>
          </>
        ) : (
          <>
            <div className="my-3">
              <span className="text-primary fs-7 font-weight-500">Course</span>
              <Heading
                title={
                  relatedLessons?.length > 0 &&
                  relatedLessons[0]?.category?.title
                }
                pageHeaderDivider="pb-0 mb-0"
              />
            </div>
            <Card
              item={currentLessonCourse}
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
