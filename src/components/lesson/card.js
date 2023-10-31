import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  Row,
  Col,
  Progress,
  Spinner,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import routes from '../../utils/routes.json';

import {
  COMPLETED,
  ADD_TO_LESSON,
  REMOVE_FROM_FAVORITES,
  IN_PROGRESS,
} from '../../utils/constants';
import LessonService from '../../services/lesson.service';
import TooltipComponent from './Tooltip';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';
import courseService from '../../services/course.service';
import MaterialIcon from '../commons/MaterialIcon';
import TopicIcon from '../commons/TopicIcon';
import useUrlSearchParams from '../../hooks/useUrlSearchParams';
import Skeleton from 'react-loading-skeleton';
import ButtonIcon from '../commons/ButtonIcon';
const LabelColors = {
  Advanced: { bgColor: '#F9F5FF', foreColor: '#7F56D9' },
  Foundational: { bgColor: '#ECFDF3', foreColor: '#039855' },
  Elective: { bgColor: '#FFFAEB', foreColor: '#DC6803' },
  Essentials: { bgColor: '#FFF6ED', foreColor: '#EC4A0A' },
};
const Labels = ({ labels }) => {
  const label = labels?.length > 0 ? labels[0]?.trim() : '';
  const colorStyle = (label && LabelColors[label]) || {
    bgColor: '#ECFDF3',
    foreColor: '#039855',
  };

  return (
    <div className="d-flex align-items-center mt-2 flex-wrap gap-1">
      <span
        style={{
          minWidth: 80,
          color: colorStyle?.foreColor,
          background: colorStyle?.bgColor,
        }}
        className="rounded-pill fs-9 py-1 labels px-3 text-center font-weight-medium"
      >
        {LabelColors[label] ? label : 'Foundational'}
      </span>
    </div>
  );
};

export default function LessonCard(props) {
  const {
    icon,
    item,
    sectionType,
    setItem,
    self,
    handleStartCourse,
    topics,
    selected,
    classnames,
  } = props;
  const params = useUrlSearchParams();
  const catTitle = params?.get('title');
  const { id } = item;
  const track =
    item.progress && item.progress.length > 0
      ? item.progress[0] || false
      : false;
  const parsedTags = item?.tags?.length && JSON.parse(item.tags);
  const [errorMessage, setErrorMessage] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [favoriteInProgress, setFavoriteInProgress] = useState(false);
  const [totalLessons, setTotalLessons] = useState(item?.totalLessons || 0);
  const [totalLessonsLoading, setTotalLessonsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    track && track.status === COMPLETED
  );

  const isCourse = sectionType === 'course';
  const progress = track.status === IN_PROGRESS ? track.progress : null;

  const category_id = isCourse
    ? item?.categoryCourses?.length
      ? item?.categoryCourses[0]?.categoryId
      : null
    : item.category_id;
  const categoryInfo =
    topics?.find((cat) => cat.id === category_id) || item.category;
  const path = !isCourse
    ? `${routes.learnLessons}/${item.id}`
    : `${routes.courses}/${item.id}`;
  const link = track && track.page_id ? `${path}/page/${track.page_id}` : path;

  const setFavoriteLessonAndCourse = (item) => {
    try {
      const { progress } = item;
      const { preferences } = item;
      setFavorite(preferences?.[0]?.isFavorite || progress?.[0]?.is_favorite);
    } catch (e) {
      console.log('parsing-error-preferences', e);
    }
  };

  useEffect(() => {
    const setTrainingInfo = async () => {
      setFavoriteLessonAndCourse(item);
      if (sectionType !== 'course-footer' && !isCourse) {
        const resp = await LessonService.GetLessonTrackByLessonId(id, {
          self,
        });
        if (resp) {
          const { completed_at, progress } = resp;
          if (progress === 100 && completed_at) {
            setIsCompleted(true);
          }
        }
      } else {
        const { overall_progress = 0 } = await courseService
          .getCourseProgress(id, { self })
          .catch(() => {});
        if (overall_progress) {
          setIsCompleted(overall_progress === 100);
        }
        if (!Object.hasOwn(item, 'totalLessons')) {
          setTotalLessonsLoading(true);
          const data = await courseService.getCourseLessonsById(id);
          setTotalLessonsLoading(false);
          setTotalLessons(data?.lessons?.length || 0);
        }
      }
    };

    setTrainingInfo();
  }, []);

  async function onHandleFavorite(e) {
    e.preventDefault();
    setFavoriteInProgress(true);
    let favorite = '';
    if (isCourse) {
      favorite = await courseService.putFavoriteCourseById(id);
    } else {
      favorite = await LessonService.PutFavoriteByLessonId({ id });
    }
    setItem && setItem(item);
    setFavoriteInProgress(false);
    if (!setItem) {
      if (favorite) setFavorite((prevState) => !prevState);
    }
  }

  async function onDownload(e) {
    e.preventDefault();

    try {
      const file = await LessonService.PdfLinkByLesson(item.documents);

      if (!file) {
        setErrorMessage('File not found');
        return;
      }

      const data = new Blob([file], { type: 'application/pdf' });
      const fileUrl = window.URL.createObjectURL(data);
      window.open(fileUrl);
    } catch (error) {
      setErrorMessage('File not found');
    }
  }
  const CourseCardWithFooter = () => {
    const inProgress =
      Number.isFinite(progress) && progress > 0 && !isCompleted;
    return (
      <Card className={`h-100 course-card course-card-box rounded-lg`}>
        <CardBody className="px-4 py-5 my-5">
          <div className="h-100 my-5 py-5">
            <div className={classnames}>
              <div className="text-center">
                <TopicIcon
                  icon={categoryInfo?.icon || icon || 'category'}
                  iconBg="bg-primary-soft"
                  iconStyle={{ width: 110, height: 110, margin: '0 auto' }}
                  iconClasses="font-size-4em text-primary"
                />
              </div>
              <div className={`mb-0 mt-5 pt-lg-5`}>
                <h6 className="text-primary font-weight-500">Course</h6>
                <h2 className="card-title mb-0 text-hover-primary font-size-lg text-wrap">
                  {item.title || item.name}
                </h2>
                <p className="fs-7 font-weight-medium text-muted">
                  {catTitle || categoryInfo?.name || categoryInfo?.title}
                </p>
                {inProgress && (
                  <div
                    className="d-flex align-items-center py-2 mt-3"
                    style={{ width: 120 }}
                  >
                    <Progress
                      className="flex-fill"
                      value={progress}
                      style={{ height: '5px' }}
                    />
                  </div>
                )}
                {item?.state !== 'completed' && (
                  <div className="text-left">
                    <ButtonIcon
                      label="Start"
                      color="primary"
                      classnames="rounded-pill px-5 fs-6"
                      onclick={handleStartCourse}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Row className="justify-content-between align-items-center">
            <Col className="col-auto d-flex flex-row align-items-center">
              {!favoriteInProgress ? (
                <TooltipComponent
                  title={favorite ? REMOVE_FROM_FAVORITES : ADD_TO_LESSON}
                >
                  <button
                    className="btn btn-icon btn-icon-sm icon-ignore btn-soft-primary btn-sm rounded-circle cursor-pointer"
                    onClick={(e) => onHandleFavorite(e)}
                  >
                    <MaterialIcon
                      icon={favorite ? 'favorite' : 'favorite_border'}
                    />
                  </button>
                </TooltipComponent>
              ) : (
                <Spinner className="mr-1" style={{ width: 26, height: 26 }} />
              )}
              {item.documents && (
                <TooltipComponent title="Download lessons">
                  <button
                    className="cursor-pointer ml-1 btn btn-icon icon-ignore btn-icon-sm btn-soft-success btn-sm rounded-circle"
                    onClick={(e) => onDownload(e)}
                  >
                    <MaterialIcon icon="download_for_offline" />
                  </button>
                </TooltipComponent>
              )}

              {isCompleted && (
                <TooltipComponent title="Completed">
                  <button
                    className="btn btn-icon ml-1 btn-icon-sm btn-soft-success icon-ignore no-hover p-2 btn-sm rounded-circle cursor-default"
                    onClick={(e) => onDownload(e)}
                  >
                    <MaterialIcon
                      filled
                      icon="check_circle"
                      clazz="text-success font-size-xl"
                    />
                  </button>
                </TooltipComponent>
              )}
            </Col>
            <Col className="col-auto d-flex flex-row align-items-center">
              {totalLessonsLoading ? (
                <Skeleton height="10" width="50" />
              ) : (
                <div className="text-muted fs-6">
                  {totalLessons > 0 ? ` ${totalLessons} Lessons ` : ''}
                </div>
              )}
            </Col>
          </Row>
        </CardFooter>
      </Card>
    );
  };
  const CourseCard = () => {
    const inProgress =
      Number.isFinite(progress) && progress > 0 && !isCompleted;
    return (
      <Link to={link}>
        <Card className={`h-100 setting-item course-card course-card-box`}>
          <CardBody className="p-4">
            <div className="h-100 d-flex align-items-center justify-content-between">
              <div className={`mb-0`}>
                <h6 className="text-primary font-weight-500 font-size-md">
                  Course
                </h6>
                <h2 className="card-title mb-0 text-hover-primary font-size-lg text-wrap">
                  {item.title || item.name}
                </h2>
                <p className="fs-7 mb-2 font-weight-medium text-muted">
                  {catTitle || categoryInfo?.name || categoryInfo?.title}
                </p>
                <a className="font-size-md font-weight-semi-bold">
                  {inProgress ? 'Continue' : 'Start'}
                </a>
                {inProgress && (
                  <div
                    className="d-flex align-items-center py-2"
                    style={{ width: '100%' }}
                  >
                    <Progress
                      className="flex-fill"
                      value={progress}
                      style={{ height: '8px' }}
                    />
                  </div>
                )}
              </div>
              <div className="text-center">
                <TopicIcon
                  icon={categoryInfo?.icon || icon || 'category'}
                  iconBg="bg-primary-soft"
                  iconStyle={{ width: 110, height: 110, margin: '0 auto' }}
                  iconClasses="font-size-4em text-primary"
                />
              </div>
            </div>
          </CardBody>
          <CardFooter className="border-0 pt-0">
            <Row className="justify-content-between align-items-center">
              <Col className="col-auto d-flex flex-row align-items-center">
                {!favoriteInProgress ? (
                  <TooltipComponent
                    title={favorite ? REMOVE_FROM_FAVORITES : ADD_TO_LESSON}
                  >
                    <button
                      className="btn btn-icon btn-icon-sm icon-ignore btn-soft-primary btn-sm rounded-circle cursor-pointer"
                      onClick={(e) => onHandleFavorite(e)}
                    >
                      <MaterialIcon
                        icon={favorite ? 'favorite' : 'favorite_border'}
                      />
                    </button>
                  </TooltipComponent>
                ) : (
                  <Spinner className="mr-1" style={{ width: 26, height: 26 }} />
                )}
                {item.documents && (
                  <TooltipComponent title="Download lessons">
                    <button
                      className="cursor-pointer ml-1 btn btn-icon icon-ignore btn-icon-sm btn-soft-success btn-sm rounded-circle"
                      onClick={(e) => onDownload(e)}
                    >
                      <MaterialIcon icon="download_for_offline" />
                    </button>
                  </TooltipComponent>
                )}

                {isCompleted && (
                  <TooltipComponent title="Completed">
                    <button
                      className="btn btn-icon ml-1 btn-icon-sm btn-soft-success icon-ignore no-hover p-2 btn-sm rounded-circle cursor-default"
                      onClick={(e) => onDownload(e)}
                    >
                      <MaterialIcon
                        filled
                        icon="check_circle"
                        clazz="text-success font-size-xl"
                      />
                    </button>
                  </TooltipComponent>
                )}
              </Col>
              <Col className="col-auto d-flex flex-row align-items-center">
                {totalLessonsLoading ? (
                  <Skeleton height="10" width="50" />
                ) : (
                  <div className="text-muted fs-6">
                    {totalLessons > 0 ? ` ${totalLessons} Lessons ` : ''}
                  </div>
                )}
              </Col>
            </Row>
          </CardFooter>
        </Card>
      </Link>
    );
  };
  const LessonCard = () => {
    return (
      <Link to={link}>
        <Card className={`setting-item lesson-card-box ${selected}`}>
          <CardBody className="p-2_1 px-3 overflow-y-auto h-100">
            <div className="d-flex flex-column h-100">
              <div className="d-flex align-items-center flex-fill">
                {/* <span style={{ width: 72, height: 72 }}>
                  <TopicIcon
                    icon={categoryInfo?.icon || icon || 'category'}
                    iconBg="bg-primary-soft"
                    iconStyle={{ width: 72, height: 72 }}
                    iconClasses="font-size-3em text-primary"
                  />
                </span> */}
                <div className={`flex-fill mb-2`}>
                  <div className="text-right">
                    <Labels labels={parsedTags} />
                  </div>
                  <span className="text-primary pt-4 font-size-md font-weight-500 d-block">
                    Lesson
                  </span>
                  <h4 className="card-title mb-0 text-hover-primary text-wrap">
                    {item.title || item.name}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <a className="font-size-md font-weight-semi-bold">Start</a>
              </div>
            </div>
          </CardBody>
          <CardFooter className="p-2_1 px-3">
            <Row className="justify-content-between align-items-center">
              <Col className="col-auto d-flex flex-row align-items-center">
                {!favoriteInProgress ? (
                  <TooltipComponent
                    title={favorite ? REMOVE_FROM_FAVORITES : ADD_TO_LESSON}
                  >
                    <button
                      className="btn btn-icon btn-icon-sm icon-ignore btn-soft-primary btn-sm rounded-circle cursor-pointer"
                      onClick={(e) => onHandleFavorite(e)}
                    >
                      <MaterialIcon
                        icon={favorite ? 'favorite' : 'favorite_border'}
                      />
                    </button>
                  </TooltipComponent>
                ) : (
                  <Spinner className="mr-1" style={{ width: 26, height: 26 }} />
                )}
                {item.documents && (
                  <TooltipComponent title="Download lessons">
                    <button
                      className="cursor-pointer ml-1 btn btn-icon icon-ignore btn-icon-sm btn-soft-primary btn-sm rounded-circle"
                      onClick={(e) => onDownload(e)}
                    >
                      <MaterialIcon icon="download_for_offline" />
                    </button>
                  </TooltipComponent>
                )}
                {isCompleted && (
                  <TooltipComponent title="Completed">
                    <button
                      className="btn btn-icon ml-1 btn-icon-sm btn-soft-success icon-ignore no-hover p-2 btn-sm rounded-circle cursor-default"
                      onClick={(e) => onDownload(e)}
                    >
                      <MaterialIcon
                        filled
                        icon="check_circle"
                        clazz="text-success font-size-xl"
                      />
                    </button>
                  </TooltipComponent>
                )}
              </Col>
              <div className="col-auto text-muted font-size-md">
                {item.duration > 0 && `~${item.duration} mins`}
              </div>
            </Row>
          </CardFooter>
        </Card>
      </Link>
    );
  };

  return (
    <div className="position-relative">
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
      </AlertWrapper>

      {sectionType === 'course-footer' ? (
        <CourseCardWithFooter />
      ) : isCourse ? (
        <CourseCard />
      ) : (
        <LessonCard />
      )}
    </div>
  );
}
