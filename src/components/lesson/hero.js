import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import routes from '../../utils/routes.json';
import { Spinner } from 'reactstrap';
import { API } from '../../services/api';
import lessonService from '../../services/lesson.service';
import {
  ADD_TO_LESSON,
  COMPLETED,
  COMPLETED_LESSON,
  CONTINUE_LESSON,
  DRAFT,
  REMOVE_FROM_FAVORITES,
  START_LESSON,
  START_NEW_LESSON,
  RETAKE_LABEL,
  NEXT_LABEL,
  FINISH_COURSE,
} from '../../utils/constants';
// import { categoriesDefaultInfo } from '../../views/Resources/category/constants/Category.constants';
import TooltipComponent from './Tooltip';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
import MaterialIcon from '../commons/MaterialIcon';
import TopicIcon from '../commons/TopicIcon';
import { categoriesDefaultInfo } from '../../views/Resources/category/constants/Category.constants';

export default function Hero(props) {
  const {
    title,
    lesson: {
      id,
      pages,
      documents,
      max_points: maxPoints,
      icon,
      category,
      duration,
      status,
    } = {},
    jump,
    next,
    isLast,
    setRefresh,
    course,
    nextLessons,
  } = props || {};

  const api = new API();
  const history = useHistory();
  const [label, setLabel] = useState(START_LESSON);
  const [subheading, setSubHeading] = useState('');
  const [completed, setCompleted] = useState(false);
  const [pageId, setPageId] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [points, setMaxpoints] = useState(maxPoints);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const inDraft = status === DRAFT;
  const retakeLesson = async () => {
    const pl = {
      pageId: null,
    };

    const resp = await api
      .TrackLesson(id, pl) // TODO Why we have not added it in LessonService
      .catch((err) => console.log(err));

    if (resp) {
      jump(1);
      setRefresh((prevState) => prevState + 1);
    }
  };
  const goToNextLesson = async () => {
    if (course && nextLessons?.length > 0) {
      checkLessonProgressAndRedirect();
    } else {
      history.push(`${routes.courses}/${course}`);
    }
  };
  const redirect = (id, nextLessons = undefined) => {
    history.push({
      pathname: `${routes.learnLessons}/${id}/page/1/course/${course}`,
      state: { nextLessons },
    });
    window.location.reload();
  };
  const checkLessonProgressAndRedirect = (first) => {
    let redirectLessonId = 0;

    if (nextLessons?.length > 0) {
      redirectLessonId = nextLessons[0]?.id;
    }
    if (redirectLessonId) {
      const availableInProgressLessons = nextLessons.filter(
        (item) => item.id !== redirectLessonId
      );
      redirect(redirectLessonId, availableInProgressLessons);
    }
  };
  useEffect(() => {
    (async () => {
      if (progress === undefined) {
        return;
      }
      if (isLast() && progress?.status === 'completed') {
        setSubHeading(COMPLETED_LESSON);
        setCompleted(true);
        return setLabel(START_NEW_LESSON);
      }

      if (progress?.page_id && progress?.status === 'in_progress') {
        if (isLast()) {
          setIsLoading(true);
          const resp = await lessonService
            .GetLessonTrackByLessonId(id, { self: true })
            .catch((err) => console.log(err));
          setIsLoading(false);
          setProgress(resp);
        }
        return setLabel(CONTINUE_LESSON);
      }

      if (progress?.status === 'completed') {
        setSubHeading(COMPLETED_LESSON);
        setIsCompleted(progress?.status === COMPLETED);
        setCompleted(true);
        return setLabel(START_NEW_LESSON);
      }
    })();
  }, [progress]);

  useEffect(() => {
    if (id) {
      (async () => {
        // progress returns null....
        setIsLoading(true);
        setTimeout(async () => {
          if (progress === null || progress) {
            return;
          }

          const resp = await lessonService
            .GetLessonTrackByLessonId(id, { self: true })
            .catch((err) => console.log(err));
          setIsLoading(false);
          setProgress(resp);
          if (!resp) {
            return;
          }

          const {
            page_id: trackPageId,
            attempts,
            is_favorited: isFavorited,
            points,
            status,
          } = resp;

          setPageId(trackPageId);

          const lessonPoints =
            points || (attempts < maxPoints ? maxPoints - attempts : 0);

          setMaxpoints(lessonPoints);

          setFavorite(Boolean(isFavorited));
          setIsCompleted(status === COMPLETED);
        }, 1000);
      })();
    }
  }, []);
  const onStartOrContinue = async () => {
    if (isLast() || progress?.status === 'completed') {
      // Done this because all pages comes completed but lesson progress 67 and in progress have to fix in backend
      const pl = {
        pageId: pages[pages?.length - 1]?.id,
      };
      setIsLoading(true);
      const resp = await api
        .TrackLesson(id, pl) // TODO Why we have not added it in LessonService
        .catch((err) => console.log(err));
      setProgress(resp);
      setIsLoading(false);
    } else if (pageId) {
      const jumpTo = pages.find((page) => page.id === pageId);
      if (jumpTo.order === pages.length) {
        jump(jumpTo.order + 1);
      } else {
        // + 1 skipping the current slide when you resume lesson, dont know why so removing it
        jump(jumpTo.order + 2); // i dunno why this works?
      }
    } else {
      next();
    }
  };

  async function onHandleFavorite(e) {
    e.preventDefault();
    const favorite = await lessonService.PutFavoriteByLessonId({ id });

    if (favorite) setFavorite((prevState) => !prevState);
  }
  const onDownload = async () => {
    try {
      const file = await lessonService.PdfLinkByLesson(documents);

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
  };

  return (
    <>
      <div className="text-center position-relative active pt-3">
        {isLoading ? (
          <Spinner color="primary" size="sm" className="spinner-grow-sm2" />
        ) : (
          <>
            <AlertWrapper>
              <Alert
                message={errorMessage}
                setMessage={setErrorMessage}
                color="danger"
              />
            </AlertWrapper>
            <div className="my-5 py-5">
              {!completed && (
                <span
                  style={{ width: 72, height: 72 }}
                  className="m-auto text-center d-block mt-5"
                >
                  <TopicIcon
                    icon={
                      category?.icon ||
                      icon ||
                      categoriesDefaultInfo[category?.title] ||
                      'savings'
                    }
                    iconBg="bg-primary-soft"
                    iconStyle={{ width: 72, height: 72 }}
                    iconClasses="font-size-3em text-primary"
                  />
                </span>
              )}
              {inDraft && (
                <span className="bg-gray-dark text-white d-inline-block position-absolute top-0 right-0 p-1 px-3 ml-auto font-weight-medium rounded fs-9">
                  {DRAFT.toUpperCase()}
                </span>
              )}
              {completed ? (
                <>
                  <div className="text-center mb-2">
                    <span className="font-size-6xl">&#127881;</span>
                    <h3 className="card-title mb-0 mt-3">{title || ''}!</h3>
                    <p className="card-text text-black mb-3">{subheading}</p>
                  </div>
                  <div
                    className="btn btn-primary btn-pill px-5 cursor-pointer"
                    onClick={retakeLesson}
                  >
                    {RETAKE_LABEL}
                  </div>
                </>
              ) : (
                <h3 className="card-title mt-5 mb-2">{title || ''}</h3>
              )}
              {course && completed && (
                <>
                  <div
                    className="mx-2  btn btn-primary btn-pill px-5 cursor-pointer"
                    onClick={goToNextLesson}
                  >
                    {nextLessons?.length > 0 ? NEXT_LABEL : FINISH_COURSE}
                  </div>
                </>
              )}
              {!completed && (
                <button
                  type="button"
                  className="btn btn-primary btn-pill px-5 mb-5"
                  onClick={onStartOrContinue}
                >
                  {label}
                </button>
              )}
            </div>
            <div className="row justify-content-between align-items-center pt-5 mt-5">
              <div className="col-auto">
                <TooltipComponent
                  title={favorite ? REMOVE_FROM_FAVORITES : ADD_TO_LESSON}
                  placement="top"
                >
                  <button
                    className="btn btn-icon btn-icon-sm icon-ignore btn-soft-primary btn-sm rounded-circle cursor-pointer"
                    data-original-title={
                      favorite ? REMOVE_FROM_FAVORITES : ADD_TO_LESSON
                    }
                    onClick={(e) => onHandleFavorite(e)}
                  >
                    <MaterialIcon
                      icon={favorite ? 'favorite' : 'favorite_border'}
                    />
                  </button>
                </TooltipComponent>

                {documents && (
                  <TooltipComponent title="Download PDF" placement="top">
                    <button
                      className="btn btn-icon btn-icon-sm icon-ignore btn-soft-primary btn-sm rounded-circle cursor-pointer"
                      data-original-title="Add to My Lessons"
                      style={{ marginLeft: `10px` }}
                      onClick={onDownload}
                    >
                      <MaterialIcon
                        icon="download_for_offline"
                        clazz="text-reset"
                      />
                    </button>
                  </TooltipComponent>
                )}

                {isCompleted && (
                  <TooltipComponent title="Completed">
                    <button
                      className="mx-1 btn btn-icon btn-icon-sm icon-ignore btn-soft-success no-hover p-2 btn-sm rounded-circle cursor-default"
                      onClick={(e) => onDownload(e)}
                    >
                      <MaterialIcon
                        filled
                        icon="check_circle"
                        clazz="mx-1 text-success font-size-xl"
                      />
                    </button>
                  </TooltipComponent>
                )}
              </div>
              <div
                className="col-auto text-black fs-7"
                data-uw-styling-context="true"
              >
                {points > 0 && (
                  <>
                    {points} points{' '}
                    <span className="legend-indicator bg-primary mx-2"></span>{' '}
                  </>
                )}

                {duration && (
                  <>
                    <span>~{Math.round(duration)} mins </span>{' '}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
