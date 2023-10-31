import { useEffect, useReducer, useState } from 'react';
import { Button, Input, FormGroup, FormFeedback } from 'reactstrap';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import LessonAdminQuizOption from './LessonAdminQuizOptions';
import { abcId, initialOptionsState } from './ManageLessonsConstants';
import WistiaEmbed from '../wistia';
import {
  CONTENT_LABEL,
  QUESTION_REVIEW_LABEL,
  QUIZ,
  SELECT_OPTIONS_DESCRIPTION,
  SLIDE_DEFAULT_TEXT,
  TITLE_LABEL,
  VIDEO,
  VIDEO_PLAYER_WIDTH,
} from '../../utils/constants';
import MaterialIcon from '../commons/MaterialIcon';
import TableActions from '../commons/TableActions';

import UploadAdapter from './UploadAdapter';
import MuxUpload from './MuxUpload';
import { CheckboxInput } from '../layouts/CardLayout';
import lessonService from '../../services/lesson.service';
import { Form, FormCheck } from 'react-bootstrap';

const LessonAdminPage = (props) => {
  const {
    validData,
    setValidData,
    index,
    type,
    id,
    title,
    placeholder,
    content,
    qoption,
    onSetPageInfo,
    pages,
    setPages,
    onRemovePage,
    lessonId,
    isNew,
    onHandleUploadVideo,
    setErrorMessage,
    isVideoUrl,
    videoId,
    video,
    contactAccessible,
    setAllowSubmit,
    setFuncIsVideoUrl,
    slide,
  } = props;

  const [minimize, setMinimize] = useState(!isNew);
  const [quizOptions, setQuizOptions] = useState([]);
  const [videoLink, setVideoLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [videosId, setvideosId] = useState(null);
  const [isVideoLink, setisVideoLink] = useState(false);
  const [invalidLink, setInvalidLink] = useState();
  const [muxID, setMuxID] = useState(videoId || '');
  const newList = [...validData];

  const slideIcons = {
    video: 'smart_display',
    slide: 'description',
    quiz: 'analytics',
  };

  const initialLessonPagesState = {
    type,
    placeholder,
    title: '',
    lessonId: '',
    content: '',
  };
  function reducer(state, action) {
    switch (action.type) {
      case 'set':
        return {
          ...state,
          [action.input]: action.payload,
        };
      case 'edit':
        return {
          ...state,
          ...action.payload,
        };
      case 'reset':
        return initialLessonPagesState;
      default:
        return state;
    }
  }

  const [pagesForm, dispatch] = useReducer(reducer, initialLessonPagesState);

  useEffect(() => {
    const setPageData = () => {
      dispatch({
        type: 'set',
        input: TITLE_LABEL,
        payload: title,
      });

      dispatch({
        type: 'set',
        input: 'lessonId',
        payload: lessonId,
      });

      dispatch({
        type: 'set',
        input: CONTENT_LABEL,
        payload: content,
      });

      if (type === VIDEO) {
        setVideoLink(content);
        onCheckLink(content);
      }

      setQuizOptions(qoption);
    };

    if (lessonId) setPageData();
  }, []);

  const isClientChange = (e) => {
    onSetPageInfo({
      pageLocalId: id,
      name: 'contactAccessible',
      value: !contactAccessible,
    });
    onHandleUploadVideo({
      videoId: muxID,
    });
  };

  useEffect(() => {
    setLoading(false);
  }, [pagesForm.content]);

  useEffect(() => {
    if (isVideoUrl) {
      setisVideoLink(true);
    }
  }, [isVideoUrl]);

  const updateValidData = (value) => {
    const index = validData.findIndex((i) => i.pageId === id);
    if (index !== -1) {
      newList[index] = { ...newList[index], val: value };
      setValidData([...newList]);
    } else {
      setValidData([...validData, { pageId: id, val: value }]);
    }
  };

  useEffect(() => {
    if (isVideoLink) fetchVideo();
  }, [videoId]);
  const fetchVideo = async () => {
    try {
      const response = await fetch(
        `https://fast.wistia.com/embed/medias/${videosId}`
      );
      if (response.status === 200) {
        const data = await response.json();
        if (data.error) {
          updateValidData(true);
        }
      }
    } catch (error) {
      updateValidData(false);
    }
  };
  const onInputChange = (e) => {
    const { name, value } = e.target;

    dispatch({
      type: 'set',
      input: name,
      payload: value,
    });

    onSetPageInfo({ pageLocalId: id, name, value });
  };

  const onAddQuizOption = () => {
    const newQuizOptions = quizOptions.slice();

    newQuizOptions.push({
      id: abcId[quizOptions.length],
      ...initialOptionsState,
    });

    setQuizOptions(newQuizOptions);
  };

  const onRemoveOption = (optionId) => {
    const newQuizOptions = quizOptions?.filter((page) => page.id !== optionId);

    setQuizOptions(newQuizOptions);

    onSetPageInfo({
      pageLocalId: id,
      name: 'qoption',
      value: newQuizOptions,
    });
  };

  const onSetOptionInfo = ({ optionId, name, value }) => {
    const sliceQuizOptions = quizOptions.map((opt) => ({
      ...opt,
      correct: false,
    }));

    const optionSelected = sliceQuizOptions?.find(
      (page) => page.id === optionId
    );
    const optionsIndex = sliceQuizOptions?.findIndex(
      (page) => page.id === optionId
    );

    if (optionSelected) {
      const newOptionInfo = {
        ...optionSelected,
        [name]: value,
      };

      sliceQuizOptions.splice(optionsIndex, 1, newOptionInfo);

      setQuizOptions(sliceQuizOptions);
      onSetPageInfo({
        pageLocalId: id,
        name: 'qoption',
        value: sliceQuizOptions,
      });
    }
  };

  const onCheckLink = (link) => {
    if (link) {
      const videoRegex =
        /https?:\/\/(.+)?(identifee.wistia\.com|wi\.st)\/(medias)\//;

      const videosId = link.replace(videoRegex, '');

      dispatch({
        type: 'set',
        input: CONTENT_LABEL,
        payload: link,
      });

      onSetPageInfo({
        pageLocalId: id,
        name: CONTENT_LABEL,
        value: link,
      });

      setvideosId(videosId);
    }
  };

  const onAddLink = (e) => {
    setLoading(true);
    onCheckLink(e.target.value);
  };

  const actionItems = [
    {
      id: 1,
      title: 'Edit',
      icon: minimize ? 'add' : 'remove',
      onClick: () => setMinimize(!minimize),
    },
    {
      id: 2,
      title: 'Delete',
      icon: 'delete',
      onClick: () => onRemovePage(id),
      style: 'ml-2 text-danger',
    },
  ];

  const fileUploaded = (data) => {
    console.log('fileUploaded', data);
  };
  // just removing image/video upload from editor, need an extra logic to place custom file uploader plugin as ckeditor suggests
  const defaultConfig = {
    ...ClassicEditor.defaultConfig,
    extraPlugins: [
      function (editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
          // Create new object and pass server url
          return new UploadAdapter(loader, '/api/files', fileUploaded);
        };
      },
    ],
  };
  defaultConfig.toolbar.removeItems = ['mediaEmbed'];
  ClassicEditor.defaultConfig = { ...defaultConfig };
  const handleLinkChange = async (e) => {
    const link = e.target.value.split('/');
    if (
      link[2] === 'identifee.wistia.com' &&
      link.length === 5 &&
      link[4] !== '' &&
      e.target.value
    ) {
      setAllowSubmit(true);
      setInvalidLink(false);
    } else {
      setAllowSubmit(false);
      setInvalidLink(true);
    }

    setVideoLink(e.target.value);
    onAddLink(e);
    if (e.target.value) {
      const response = await lessonService
        .createVideoURL(e.target.value)
        .catch((err) => console.log(err));
      const slicePages = pages.slice();

      const pageSelected = slicePages?.find(
        (page) => page.id === id || page.pageLocalId === id
      );

      const pageIndex = slicePages?.findIndex(
        (page) => page.id === id || page.pageLocalId === id
      );

      if (pageSelected) {
        const newPageInfo = {
          ...pageSelected,
          videoId: response.data.videoId,
          video: response.data,
          content: e.target.value,
        };

        slicePages.splice(pageIndex, 1, newPageInfo);
        setPages(slicePages);
      }
    } else {
      const slicePages = pages.slice();

      const pageSelected = slicePages?.find(
        (page) => page.id === id || page.pageLocalId === id
      );

      const pageIndex = slicePages?.findIndex(
        (page) => page.id === id || page.pageLocalId === id
      );
      const newPageInfo = {
        ...pageSelected,
        videoId: '',
        video: '',
        content: null,
      };
      slicePages.splice(pageIndex, 1, newPageInfo);
      setPages(slicePages);
    }
  };

  return (
    <div className={`card rounded mb-3`}>
      <div
        className="d-flex align-items-center justify-content-between p-3"
        onClick={() => setMinimize(!minimize)}
      >
        <div>
          <span
            className="material-icons-outlined cursor-grab mr-1"
            data-uw-styling-context="true"
          >
            drag_indicator
          </span>
          <span className="text-primary cursor-pointer fw-bold">
            <MaterialIcon icon={slideIcons[slide.type]} />{' '}
            {slide.title ? slide.title : SLIDE_DEFAULT_TEXT}
          </span>
        </div>

        <TableActions item={{ id }} actions={actionItems} />
      </div>

      <div className={`dropdown-divider m-0`} />

      <div className={minimize ? 'd-none' : 'd-block'}>
        {type !== VIDEO && (
          <div className="p-3 cursor-text" onSubmit={(e) => e.preventDefault()}>
            <FormGroup className="d-flex pb-1 justify-content-between align-items-center">
              <Input
                type="text"
                name="title"
                id="title"
                className="w-100"
                placeholder={placeholder}
                value={slide.title || ''}
                onChange={onInputChange}
              />
            </FormGroup>

            {type === QUIZ && (
              <div className="text-center pb-0 pt-0 d-gray">
                <p>{SELECT_OPTIONS_DESCRIPTION}</p>

                {quizOptions?.map((opt) => (
                  <LessonAdminQuizOption
                    lessonId={lessonId}
                    key={opt.id}
                    opt={opt}
                    pageLocalId={id}
                    onRemoveOption={onRemoveOption}
                    onSetOptionInfo={onSetOptionInfo}
                  />
                ))}

                <Button
                  color="primary"
                  className="w-100 mb-3"
                  onClick={onAddQuizOption}
                  disabled={quizOptions.length > 4}
                >
                  <span
                    className="material-icons-outlined mr-2"
                    data-uw-styling-context="true"
                  >
                    add_circle
                  </span>
                  Add Option
                </Button>
              </div>
            )}

            {type === QUIZ && (
              <h4 className="pb-3 pt-1 mb-0">{QUESTION_REVIEW_LABEL}</h4>
            )}

            <CKEditor
              editor={ClassicEditor}
              className="border border-gray-200"
              id={id}
              onReady={(editor) => {
                editor.editing.view.document.on(
                  'keydown',
                  (evt, data) => {
                    if (data.keyCode === 13) {
                      if (data.isSoft) {
                        editor.execute('shiftEnter');
                      } else {
                        editor.execute('enter');
                      }
                      data.preventDefault();
                      evt.stop();
                      editor.editing.view.scrollToTheSelection();
                    }
                  },
                  { priority: 'high' }
                );
              }}
              data={slide.content || ''}
              onChange={(event, editor) => {
                const data = editor.getData();
                onSetPageInfo({
                  pageLocalId: id,
                  name: CONTENT_LABEL,
                  value: data,
                });
              }}
            />
          </div>
        )}

        {type === VIDEO && (
          <>
            <div>
              <FormGroup className="p-3 pb-0">
                <CheckboxInput
                  id={`checkbox-manual-${id}`}
                  name={`checkbox-manual-${id}`}
                  onChange={(e) => {
                    setFuncIsVideoUrl(!e.target.checked);
                    setisVideoLink(e.target.checked);
                    const body = {
                      pageLocalId: id,
                      name: 'isVideoUrl',
                      value: e.target.checked,
                    };
                    onSetPageInfo(body);
                  }}
                  checked={isVideoLink}
                  label={'Have Video Link?'}
                />
                <Input
                  type="text"
                  name="title"
                  id="title"
                  className="w-100 mb-3"
                  placeholder="Title"
                  value={slide.title || ''}
                  onChange={onInputChange}
                />
                {isVideoLink && (
                  <>
                    <Input
                      type={'text-' + id}
                      name="Video Link"
                      id={'VideoLink-' + id}
                      className="w-100"
                      placeholder={
                        'https://identifee.wistia.com/medias/45x9yv6mvq'
                      }
                      invalid={invalidLink}
                      value={videoLink}
                      onChange={(e) => handleLinkChange(e)}
                    />
                    <FormFeedback>
                      <MaterialIcon icon="warning" />
                      Invalid Video Link
                    </FormFeedback>
                  </>
                )}
              </FormGroup>

              <div id="wistia-admin">
                {!loading && videosId && isVideoLink ? (
                  <div style={{ width: VIDEO_PLAYER_WIDTH, margin: '0 auto' }}>
                    <div className="pt-2 pb-3">
                      <WistiaEmbed
                        hashedId={videosId || ''}
                        isResponsive={true}
                        videoFoam={true}
                      />
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
            {isVideoLink || (
              <MuxUpload
                lessonId={lessonId}
                onHandleUploadVideo={onHandleUploadVideo}
                setErrorMessage={setErrorMessage}
                videoId={videoId}
                video={video}
                index={index}
                pageId={id}
                pages={pages}
                setPages={setPages}
                setMuxID={setMuxID}
              />
            )}
            <Form className="ml-3">
              <FormCheck
                type="switch"
                id={id}
                label="Client Portal"
                custom={contactAccessible}
                checked={contactAccessible}
                onChange={isClientChange}
              />
            </Form>
          </>
        )}
      </div>
    </div>
  );
};

export default LessonAdminPage;
