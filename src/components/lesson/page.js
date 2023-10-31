import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Spinner } from 'reactstrap';
import { useLocation, useHistory } from 'react-router-dom';
import WistiaEmbed from '../wistia';
import { API } from '../../services/api';
import lessonService from '../../services/lesson.service';
import MuxPlayer from '@mux/mux-player-react';
import {
  CLOSE,
  CORRECT_LABEL,
  NOT_QUITE,
  QUIZ,
  RETAKE_QUIZ_LABEL,
  SLIDE,
  VIDEO,
} from '../../utils/constants';
import Alert from '../Alert/Alert';
import AlertWrapper from '../Alert/AlertWrapper';

function Correct() {
  return (
    <>
      <img
        className="avatar avatar-md mb-3"
        src="/img/components/check-bg-green.svg"
        alt="Image Description"
      />
      <div
        className="h2 font-weight-bolder text-success mb-4"
        data-uw-styling-context="true"
      >
        {CORRECT_LABEL}
      </div>
    </>
  );
}

function Incorrect({ onClick }) {
  return (
    <>
      <i
        className="material-icons-outlined"
        style={{ color: '#f44336', fontSize: '4rem' }}
      >
        {CLOSE}
      </i>
      <div
        className="h2 font-weight-bolder text-danger mb-4"
        data-uw-styling-context="true"
      >
        {NOT_QUITE}
      </div>
      <div className="d-flex justify-content-center align-items-center gap-2">
        <div
          className="btn btn-primary btn-sm btn-pill px-5 cursor-pointer"
          onClick={onClick}
        >
          {RETAKE_QUIZ_LABEL}
        </div>
      </div>
    </>
  );
}

export default function Page(props) {
  const { page, title, state, next } = props;
  const history = useHistory();
  const api = new API();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [track, setTrack] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playParams, setPlayParams] = useState({
    playId: page.videoId,
    videoId: page.videoId,
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  // const [routeChange, setRouteChange] = useState(false);
  const [locationKeys, setLocationKeys] = useState([]);
  const isPreview = location.search === '?preview';

  let routeChange = false;
  const handleContinue = () => {
    state.disable_nav = false;
    state.disable_progress = false;
    state.retake = false;
    next();
  };

  useEffect(() => {
    // temp workaround to not submit data on rout chagne
    return history.listen((location) => {
      routeChange = true;
      if (history.action === 'PUSH') {
        setLocationKeys([location.key]);
      }

      if (history.action === 'POP') {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys);

          // Handle forward event
        } else {
          setLocationKeys((keys) => [location.key, ...keys]);

          // Handle back event
        }
      }
    });
  }, [locationKeys]);

  useEffect(() => {
    return () => {
      setLoading(true);
      // For now have to do it like this, on page change submit progress
      (async () => {
        if (!track && !isPreview && !routeChange) {
          setTrack(true);

          await trackLesson().catch((err) => console.log(err));
        }
        setLoading(false);
      })();
    };
  }, []);

  const submitAnswer = async () => {
    const answer = state.userAnswer;
    setLoading(true);
    const resp = await lessonService
      .SubmitAnswer(page.lesson_id, page.id, answer)
      .catch((err) => console.log(err));

    setLoading(false);
    setHasAnswered(true);
    if (resp.success) {
      setHasAnswered(true);
      state.disable_nav = false;
      state.disable_progress = false;
      state.retake = false;
      state.correctAnswer = true;
    } else {
      state.disable_progress = true;
      state.retake = true;
      state.correctAnswer = false;
    }
  };

  const setUserAnswer = (e) => {
    setShowCheck(true);
    props.state.userAnswer = e.target.value;
  };

  const getVideoId = (url) => {
    // strip any html tags
    url = url.replace(/(<([^>]+)>)/gi, '');
    if (url.indexOf('https://') !== -1) {
      const parts = url.split('/');
      return parts[parts.length - 1];
    }
    return url;
  };

  const trackLesson = () => {
    const pl = {
      pageId: page.id,
    };

    return api.TrackLesson(page.lesson_id, pl);
  };

  useEffect(() => {
    if (page.type === QUIZ) {
      props.state.disable_nav = true;
    }
  }, []);
  useEffect(() => {
    if (page.videoId) {
      if (page.video?.muxUploadId) {
        loadAsset(page.video.muxUploadId);
      } else {
        setPlayParams({
          playId: '',
        });
      }
    } else {
      setPlayParams({
        playId: '',
      });
    }
  }, [page.videoId]);

  const loadAsset = async (vId) => {
    if (vId) {
      const response = await lessonService
        .getVideo(vId)
        .catch((err) => console.log(err));

      if (response) {
        setPlayParams({
          playId: response.data.playback_ids[0].id,
          videoId: response.data.playback_ids[0].id,
        });
      }
    }
  };

  return (
    <>
      {loading ? (
        <Spinner className="spinner-grow-xs" />
      ) : (
        <div>
          <AlertWrapper className="alert-position">
            <Alert
              color="danger"
              message={errorMessage}
              setMessage={setErrorMessage}
            />
          </AlertWrapper>
          <h2 className="card-title fw-bolder text-center mb-4">{title}</h2>

          {page.type === SLIDE && (
            <div
              className="text-lext font-size-sm slide"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}

          {page.type === QUIZ && !hasAnswered && (
            <div className="text-lext">
              <Form className="font-size-sm">
                {page.qoption?.map((opt, indx) => (
                  <FormGroup
                    key={indx}
                    check
                    className="custom-control custom-radio mb-2"
                  >
                    <Label check className="text-black">
                      <Input
                        type="radio"
                        name="quiz-option"
                        value={opt.id}
                        onChange={setUserAnswer}
                      />
                      {`${opt.id}. ${opt.answer}`}
                    </Label>
                  </FormGroup>
                ))}
                {showCheck && (
                  <Button
                    className="btn btn-sm btn-primary"
                    onClick={submitAnswer}
                  >
                    {loading ? (
                      <Spinner className="spinner-grow-xs" />
                    ) : (
                      'Submit Answer'
                    )}
                  </Button>
                )}
              </Form>
            </div>
          )}
          {hasAnswered && (
            <div>
              <div className="text-center">
                {state.userAnswer && state.correctAnswer ? (
                  <>
                    <Correct />
                    <div
                      className="quiz"
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                    <div
                      className="btn btn-sm btn-primary btn-pill my-2 px-5 cursor-pointer"
                      onClick={handleContinue}
                    >
                      Next
                    </div>
                  </>
                ) : (
                  <Incorrect onClick={() => setHasAnswered(false)} />
                )}
              </div>
            </div>
          )}

          {page.type === VIDEO && (
            <div>
              {' '}
              {page.type === VIDEO &&
              !page?.video?.muxUploadId &&
              page?.content ? (
                <div className="text-center">
                  <div style={{ width: '100%', margin: '0 auto' }}>
                    <WistiaEmbed
                      hashedId={getVideoId(props.page.content)}
                      isResponsive={true}
                      videoFoam={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <MuxPlayer
                    streamType="on-demand"
                    playbackId={playParams.playId}
                    metadata={{
                      videoId: playParams.videoId,
                      video_title: page.title,
                      viewer_user_id: playParams.videoId,
                    }}
                    autoPlay={true}
                    controls={true}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
