import React, { useEffect, useState } from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router';

import courseService from '../../../services/course.service';
import {
  ProgressBarDefault,
  ProgressCircleDefault,
} from '../../../components/commons/Progress';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import Heading from '../../../components/heading';
import stringConstants from '../../../utils/stringConstants.json';
import { decimalToNumber, LearnViewTypes } from '../../../utils/Utils';
import CategoryPartnerLogo from '../../../components/lesson/CategoryPartnerLogo';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import PageTitle from '../../../components/commons/PageTitle';
import lessonService from '../../../services/lesson.service';
import routes from '../../../utils/routes.json';
import LearnFilter from '../../../components/commons/LearnFilter';

const constants = stringConstants.settings.resources.courses;

const HeaderCard = ({
  state,
  onHandleClick,
  retakeCourse,
  takeQuiz,
  progress,
  lessons,
  loading,
}) => {
  const label = constants.start;
  let btnConfig = {
    label,
    onClick: onHandleClick,
    icon: 'assessment',
  };
  if (progress < 100 && progress > 0 && state === 'in_progress') {
    btnConfig = {
      label: constants.continue,
      onClick: onHandleClick,
      icon: 'flag',
    };
  } else if (progress >= 100 || state === 'completed') {
    btnConfig = {
      label: constants.retakeCourse,
      onClick: retakeCourse,
      icon: 'flag',
    };
  }

  return (
    <Row noGutters className="d-flex align-items-center w-100 px-3">
      <Col xs={4}>
        <h3 className="mb-0">{constants.courseContentLabel}</h3>
      </Col>
      <Col xs={8}>
        <Row noGutters className="d-flex justify-content-end w-100">
          <Col xs={5} className="d-flex align-content-center p-0">
            {/* {isCompleted ? (
              <ProgressBarDefault now={100} variant={'success'} />
            ) : (
              <>
                {inProgress && ( */}
            <ProgressBarDefault
              now={decimalToNumber(progress)}
              variant={parseInt(progress) === 100 ? 'success' : null}
            />
            {/* )}
              </>
            )} */}
          </Col>
          <Col xs={5} className="pl-2">
            <ButtonIcon
              icon={btnConfig.icon}
              label={btnConfig.label}
              classnames="w-100 btn-sm"
              onclick={btnConfig.onClick}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const ItemLesson = ({ index, lesson }) => {
  return (
    <Row noGutters className="d-flex align-items-center w-100 px-0">
      <Col>
        <div className="d-flex">
          <h5 className="mb-0 mr-1">{index + 1}.</h5>
          <div>
            <h5 className="mb-0">{lesson.title}</h5>
            <p className="m-0 text-muted font-size-sm">
              {lesson.category?.title || lesson.category}
            </p>
          </div>
        </div>
      </Col>
      <Col className="d-flex justify-content-end">
        <ProgressCircleDefault now={lesson.progress} />
      </Col>
    </Row>
  );
};

const CourseBoard = () => {
  const [currentCourse, setCurrentCourse] = useState({ state: 'progress' });
  const [lessons, setLessons] = useState([]);
  const [loader, setLoader] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { id: courseId } = useParams();
  const history = useHistory();

  const getData = async () => {
    setLoader(true);
    try {
      const [
        fullCourse,
        course,
        progressCourse = { status: 'pending', progress: 0 },
      ] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getCourseLessonsById(courseId),
        courseService
          .getCourseProgress(courseId, { self: true })
          .catch(() => {}),
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
          await courseService.getLessonCourseProgress(courseId, { self: true });
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

        setLessons(lessonsOrder);
      } else {
        history.push('/');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const redirect = (id, nextLessons = undefined) => {
    history.push({
      pathname: `${routes.learnLessons}/${id}/page/1/course/${currentCourse.id}`,
      state: { nextLessons },
    });
  };

  const HeadingCourses = () => {
    const title = currentCourse.id ? currentCourse.name : '';
    return (
      <>
        <div className="d-flex align-items-center mt-3 justify-content-between">
          <Heading title={title} pageHeaderDivider="pb-0 mb-0" />
          <CategoryPartnerLogo
            categoryInfo={currentCourse?.category}
            imageStyle="height-30 ml-1"
          />
        </div>
        <div className="page-header-divider mt-2 mb-3"></div>
      </>
    );
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

  const retakeCourse = async () => {
    try {
      await courseService.continue(courseId, {
        courseContentId: null,
      });
      await Promise.all(lessons.map((l) => lessonService.reset(l.id)));
      getData();
    } catch (e) {
      setErrorMessage(e);
    }
  };

  const takeQuiz = () => {
    const { contents } = currentCourse;
    let courseContentId;
    if (contents.length > 0) {
      courseContentId = contents[0].courseContentId;
    }
    history.push(
      `${routes.courses}/${courseId}/take-quiz?courseContentId=${courseContentId}`
    );
  };

  const startCourse = async (first) => {
    try {
      const course = await courseService.continue(courseId);
      const { progress, status } = course;
      setCurrentCourse({
        ...currentCourse,
        state: status,
        progress,
      });
      checkLessonProgressAndRedirect(first, 0);
    } catch (e) {
      setErrorMessage(e);
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
          `${routes.courses}/${courseId}/quizzes/${quiz_id}?courseContentId=${courseContentId}`
        );
        break;
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const sum = lessons.reduce((accumulator, object) => {
    return accumulator + object.duration;
  }, 0);
  return (
    <div>
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
      <PageTitle page={currentCourse?.name} pageModule="Learn" />
      <LearnFilter
        defaultFilter={{
          name: 'Topics',
          key: LearnViewTypes.Topics,
          component: null,
          submenu: null,
        }}
      />
      {HeadingCourses()}
      <Row>
        <Col xs={12} lg={7}>
          <Card className="px-0 h-100">
            <Card.Header className="px-0">
              <HeaderCard
                state={currentCourse.state}
                onHandleClick={onHandleClickActionCourse}
                retakeCourse={retakeCourse}
                takeQuiz={takeQuiz}
                loading={loader}
                progress={currentCourse?.progress}
                lessons={lessons}
              />
            </Card.Header>
            <Card.Body className="px-3 py-2">
              {lessons.map((lesson, index) => (
                <Card
                  key={lesson.id}
                  className="my-3  cursor-pointer"
                  onClick={() =>
                    checkLessonProgressAndRedirect(undefined, lesson.id)
                  }
                >
                  <Card.Body>
                    <ItemLesson lesson={lesson} index={index} />
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={5} className="pl-0">
          <Card className="px-0 h-100">
            <div>
              <Card.Header className="px-3 align-items-center">
                <h3 className="mb-0">{constants.descriptionLabel}</h3>
                <ButtonIcon
                  icon={'flag'}
                  label={'Fake button'}
                  classnames="btn-sm hide"
                />
              </Card.Header>
              <Card.Body className="px-3">
                <p>{currentCourse?.description}</p>
                <p className="font-size-sm2">
                  <span className="font-weight-bold">Total Lessons:</span>{' '}
                  {lessons?.length}
                </p>
                <p className="font-size-sm2">
                  <span className="font-weight-bold">Total Duration:</span> ~
                  {sum} mins
                </p>
              </Card.Body>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CourseBoard;
