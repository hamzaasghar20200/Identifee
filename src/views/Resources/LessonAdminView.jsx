import { useContext, useEffect, useReducer, useState } from 'react';

import LessonAdminHeader from '../../components/manageLessons/LessonAdminHeader';
import LessonForm from '../../components/manageLessons/LessonForm';
import lessonService from '../../services/lesson.service';
import userService from '../../services/user.service';
import {
  BAD_UPLOAD_VIDEO,
  DRAFT,
  initialLessonState,
  LESSON_CREATED,
  LESSON_CREATE_REQUIRED,
  LESSON_UPDATED,
  OPTIONS_ANSWER,
  OPTIONS_LENGTH_ERROR,
  OPTIONS_WITHOUT_DESCRIPTION,
  PAGE_CREATE_REQUIRED,
  PDF_UPLOAD_ERROR,
  PUBLISHED,
  QUIZ,
  SLIDE,
  QUIZ_REVIEW,
  VIDEO,
  WISTIA_UPLOAD_VIDEO,
  // WISTIA_UPLOAD_VIDEO_ERROR,
} from '../../utils/constants';
import { createBlobObject } from '../../utils/Utils';
import { API } from '../../services/api';
import AlertWrapper from '../../components/Alert/AlertWrapper';
import Alert from '../../components/Alert/Alert';
import { useForm } from 'react-hook-form';
import { CategoriesContext } from '../../contexts/categoriesContext';
import { v4 as uuidv4 } from 'uuid';

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
      return initialLessonState;
    default:
      return state;
  }
}

const LessonAdminView = ({ lessonId, setLessonId, setCreate }) => {
  const api = new API();

  const [pdf, setPdf] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lessonSuccess, setLessonSuccess] = useState('');
  const [pages, setPages] = useState([]);
  const [isPublish, setIsPublish] = useState(DRAFT);
  const [lessonForm, dispatch] = useReducer(reducer, initialLessonState);
  const { setRefresh } = useContext(CategoriesContext);
  const [muxID, setMuxID] = useState('');
  const [allowSubmit, setAllowSubmit] = useState(true);
  const [validData, setValidData] = useState([]);
  const videoRegex =
    /^(?:https?:\/\/)?(.+)?(identifee\.wistia\.com|wi\.st)\/(medias)\/(\w+)\/?(?=[^/]*$)/;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    getFieldState,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    const getLessonAdmin = async () => {
      const lesson = await api
        .GetLessonById(lessonId)
        .catch((err) => console.log(err));
      const {
        id,
        title,
        content,
        category_id,
        category,
        max_points,
        max_attempts,
        duration,
        tags,
        documents,
        pages,
        status,
        videoId,
      } = lesson || {};

      // hook form setting value of lesson name, category_id here
      setValue('title', title);
      setValue('category_id', category_id);
      const parsedTags = tags.length && JSON.parse(tags);
      setValue('tagHidden', parsedTags?.length ? tags : '');

      setPages(pages);

      const pdf = documents && (await getPdf(documents));

      if (pdf)
        setPdf({
          name: pdf.filename_download,
          size: pdf.filesize,
        });

      setIsPublish(status);

      dispatch({
        type: 'edit',
        payload: {
          id,
          title,
          content,
          category_id,
          max_points,
          max_attempts,
          duration,
          tags: JSON.parse(tags),
          documents,
          status,
          videoId,
          category,
        },
      });
    };

    if (lessonId) getLessonAdmin();
  }, [lessonId, isPublish]);

  const onAddPage = ({ type, placeholder }) => {
    const newPages = pages.slice();

    const defaultPageObject = {
      pageLocalId: uuidv4(),
      title: null,
      lesson_id: lessonId || null,
      content: null,
      type,
      quizId: null,
      qtype: null,
      qoption: [],
      order: pages.length + 1,
      placeholder,
      isNew: true, // just for expand newly created item, rest needs to be collapsed
    };

    if (type === QUIZ) {
      newPages.push({
        ...defaultPageObject,
        title: '',
        type: QUIZ,
        order: pages.length + 2,
      });
    } else if (type === VIDEO) {
      setAllowSubmit(false);
      newPages.push({
        ...defaultPageObject,
        isVideoUrl: false,
        type,
        order: pages.length + 2,
        videoId: '',
      });
    } else {
      newPages.push(defaultPageObject);
    }

    setPages(newPages);
  };

  const getPdf = async (documentId) => {
    const response = await userService.getFile(documentId);

    return response?.data;
  };

  const onUploadPdf = async () => {
    const form = new FormData();

    form.append('file', await createBlobObject(pdf), pdf.name);
    form.append('isPublic', true);
    const {
      data: {
        data: { id },
      },
    } = await userService.uploadAvatar(form);

    return id;
  };

  const createLessonPages = (id) => {
    const newPages = pages.map((page, index) => {
      if (page.type !== VIDEO && page.type !== QUIZ_REVIEW && !page.title) {
        return setErrorMessage(PAGE_CREATE_REQUIRED);
      }

      delete page.id;

      if (page.type === QUIZ) {
        return {
          ...page,
          lesson_id: id,
          content: '',
          qtype: 'mc',
        };
      }

      if (page.type === QUIZ_REVIEW) {
        const title = pages[index - 1].title;
        const content = pages[index - 1].content;

        return {
          ...page,
          lesson_id: id,
          title,
          content,
        };
      }

      if (page.type.toUpperCase() === VIDEO) {
        if (!videoRegex.test(page.content))
          return setErrorMessage(BAD_UPLOAD_VIDEO);

        return {
          ...page,
          lesson_id: id,
        };
      }

      return {
        ...page,
        lesson_id: id,
      };
    });

    return lessonService
      .upsertPages(id, newPages.filter(Boolean))
      .catch((err) => console.log(err));
  };

  const updateLessonPages = (id) => {
    const newPages = pages?.map((page, index) => {
      if (page.type === QUIZ) {
        return {
          ...page,
          lesson_id: id || lessonId,
          qtype: 'mc',
        };
      }

      if (page.type === QUIZ_REVIEW) {
        const title = pages[index - 1].title;
        const content = pages[index - 1].content;

        return {
          ...page,
          lesson_id: id || lessonId,
          title,
          content,
        };
      }
      if (page.type === SLIDE) {
        return {
          ...page,
          lesson_id: id || lessonId,
        };
      }

      if (page.type === VIDEO) {
        if (page.isNew) delete page.id;
        return {
          ...page,
          lesson_id: id || lessonId,
        };
      }

      return page;
    });

    return lessonService
      .upsertPages(
        id,
        newPages.map((page) => {
          const { tenant_id, created_at, updated_at, ...rest } = page;
          return rest;
        })
      )
      .catch((err) => console.log(err));
  };

  const setAndUploadPdf = async () => {
    lessonForm.documents = null;

    if (pdf) {
      const pdfId = await onUploadPdf().catch((err) => console.log(err));

      if (!pdfId) {
        setIsLoading(false);
        setPdf(null);
        return setErrorMessage(PDF_UPLOAD_ERROR);
      }

      lessonForm.documents = pdfId;
    }
  };

  const validateQuiz = () => {
    const quizExist = pages?.filter((page) => page.type === QUIZ);

    if (!quizExist.length) {
      return true;
    }

    const errors = {};

    [...quizExist].forEach((q) => {
      // question title must be supplied
      if (!q.title || !q?.title.trim()) {
        errors[q.id] = {
          question: q,
          errors: [
            ...(errors[q.id]?.errors || []),
            'Question title is required.',
          ],
        };
      }

      // all options must have answers text
      if (!q.qoption.every((c) => !!c.answer)) {
        errors[q.id] = {
          question: q,
          errors: [
            ...(errors[q.id]?.errors || []),
            'All options text is required.',
          ],
        };
      }

      // at least one correct option must be selected
      if (!q.qoption.some((c) => c.correct)) {
        errors[q.id] = {
          question: q,
          errors: [
            ...(errors[q.id]?.errors || []),
            'At least one correct option must be selected.',
          ],
        };
      }
    });

    const errorKeys = Object.keys(errors);
    if (errorKeys.length) {
      // show error messages
      setErrorMessage(errors[errorKeys[0]]?.errors?.join('\n'));
      return false;
    }
    return errorKeys.length === 0;
  };

  const onHandlePublish = async () => {
    if (!validateQuiz()) {
      return;
    }
    // TODO: this needs to be done with react-hook-form to show inline errors, okay for now? :P
    const quizExist = pages?.filter((page) => page.type === QUIZ);
    const videoExist = pages?.filter((page) => page.type === VIDEO);
    const textExist = pages?.filter(
      (page) => page.type !== VIDEO && page.type !== QUIZ
    );

    let optionsOutRange = false;
    let optionsWithoutAnswer = false;
    let optionsWithoutDescription = false;

    quizExist?.forEach((quiz) => {
      if (
        (quiz?.title && quiz?.qoption.length < 2) ||
        quiz?.qoption.length > 5
      ) {
        optionsOutRange = true;
      }

      quiz?.qoption?.map((option) => {
        if (!option.answer) optionsWithoutDescription = true;

        return optionsWithoutDescription;
      });

      const optionCorrectExist = quiz?.qoption?.filter((opt) => opt.correct);

      if (quiz?.title && !optionCorrectExist?.length) {
        optionsWithoutAnswer = true;
      }
    });

    if (quizExist?.length && optionsOutRange) {
      return setErrorMessage(OPTIONS_LENGTH_ERROR);
    }

    if (quizExist?.length && optionsWithoutAnswer) {
      return setErrorMessage(OPTIONS_ANSWER);
    }

    if (quizExist?.length && optionsWithoutDescription) {
      return setErrorMessage(OPTIONS_WITHOUT_DESCRIPTION);
    }

    if (videoExist?.length && !isVideoValidated(videoExist)) {
      return setErrorMessage(WISTIA_UPLOAD_VIDEO);
    }

    if (videoExist?.length && !isTextValidated(videoExist)) {
      return setErrorMessage(PAGE_CREATE_REQUIRED);
    }

    if (textExist?.length && !isTextValidated(textExist)) {
      return setErrorMessage(PAGE_CREATE_REQUIRED);
    }
    if (!pages.length) {
      return setErrorMessage('At least 1 Text or Video is required.');
    }
    delete lessonForm.tagHidden;
    setLoadingPublish(true);
    await setAndUploadPdf();
    const objLesson = lessonForm;
    const resp = await lessonService
      .createUpdateLesson({
        ...objLesson,
        tags: JSON.stringify(lessonForm.tags),
        status: PUBLISHED,
      })
      .catch((err) => setErrorMessage(err));
    await updateLessonPages(resp?.data?.id);

    setIsPublish(PUBLISHED);

    setLessonSuccess(PUBLISHED);
    setLoadingPublish(false);
    setCreate(false);
  };

  // if all videos of pages have valid url/content
  const isVideoValidated = (videos) => {
    return videos.every((video) => {
      if (video.isVideoUrl) {
        return (
          video.content && video.isVideoUrl && videoRegex.test(video.content)
        );
      }
      if (video.content) {
        return video.content && videoRegex.test(video.content);
      }
      return true;
    });
  };

  // if all slide pages have valid title
  const isTextValidated = (texts) => {
    return texts.every((text) => {
      return !!text.title;
    });
  };
  const onSubmit = async () => {
    // TODO: this needs to be done with react-hook-form to show inline errors, okay for now? :P
    if (!validateQuiz()) {
      return;
    }
    const quizExist = pages?.filter((page) => page.type === QUIZ);
    const videoExist = pages?.filter((page) => page.type === VIDEO);
    const textExist = pages?.filter(
      (page) => page.type !== VIDEO && page.type !== QUIZ
    );

    let optionsOutRange = false;
    let optionsWithoutAnswer = false;
    let optionsWithoutDescription = false;

    quizExist?.forEach((quiz) => {
      if (
        (quiz?.title && quiz?.qoption.length < 2) ||
        quiz?.qoption.length > 5
      ) {
        optionsOutRange = true;
      }

      quiz?.qoption?.map((option) => {
        if (!option.answer) optionsWithoutDescription = true;

        return optionsWithoutDescription;
      });

      const optionCorrectExist = quiz?.qoption?.filter((opt) => opt.correct);

      if (quiz?.title && !optionCorrectExist?.length) {
        optionsWithoutAnswer = true;
      }
    });

    if (quizExist?.length && optionsOutRange) {
      return setErrorMessage(OPTIONS_LENGTH_ERROR);
    }

    if (quizExist?.length && optionsWithoutAnswer) {
      return setErrorMessage(OPTIONS_ANSWER);
    }

    if (quizExist?.length && optionsWithoutDescription) {
      return setErrorMessage(OPTIONS_WITHOUT_DESCRIPTION);
    }

    if (videoExist?.length && !isVideoValidated(videoExist)) {
      return setErrorMessage(WISTIA_UPLOAD_VIDEO);
    }

    if (videoExist?.length && !isTextValidated(videoExist)) {
      return setErrorMessage(PAGE_CREATE_REQUIRED);
    }

    if (textExist?.length && !isTextValidated(textExist)) {
      return setErrorMessage(PAGE_CREATE_REQUIRED);
    }
    if (!pages.length) {
      return setErrorMessage('At least 1 Text or Video is required.');
    }

    delete lessonForm.tagHidden;

    if (!lessonId) {
      delete lessonForm.id;
    }
    if (!lessonForm.title || !lessonForm.category_id)
      return setErrorMessage(LESSON_CREATE_REQUIRED);

    setIsLoading(true);

    await setAndUploadPdf();

    const resp = await lessonService
      .createUpdateLesson({
        ...lessonForm,
        tags: JSON.stringify(lessonForm.tags),
        status: DRAFT,
      })
      .catch((err) => setErrorMessage(err));

    if (lessonId) {
      await updateLessonPages(lessonId);
      setLessonSuccess(LESSON_UPDATED);
    }

    if (!lessonId) {
      const {
        data: { id },
        status,
      } = resp || {};

      if (status === 200) {
        if (pages.length) {
          await createLessonPages(id);
        }
        setLessonSuccess(LESSON_CREATED);
        setLessonId(id);
      }
    }

    setIsLoading(false);
    setCreate(false);
    reset({});
    // this is updating a categories context so that when any category is updated
    // we also trigger an update to refresh call from api for sidemenu navigation
    setRefresh((prevState) => prevState + 1);
  };

  const onSetPageInfo = ({ pageLocalId, name, value }) => {
    const slicePages = pages.slice();

    const pageSelected = slicePages?.find(
      (page) => page.id === pageLocalId || page.pageLocalId === pageLocalId
    );

    const pageIndex = slicePages?.findIndex(
      (page) => page.id === pageLocalId || page.pageLocalId === pageLocalId
    );

    if (pageSelected) {
      const newPageInfo = {
        ...pageSelected,
        [name]: value,
      };

      slicePages.splice(pageIndex, 1, newPageInfo);
      setPages(slicePages);
    }
  };

  const onRemovePage = (pageLocalId) => {
    const pageIsQuiz = pages.find(
      (page) => page.id === pageLocalId && page.type === QUIZ
    );

    if (pageIsQuiz) {
      delete pages[pageIsQuiz.order];
    }

    const newPages = pages?.filter((page) => {
      if (page.isNew) {
        return page.pageLocalId !== pageLocalId;
      } else {
        return page.id !== pageLocalId;
      }
    });

    setPages(newPages);
    const index = validData.filter((item) => item.pageId !== pageLocalId);
    setValidData([index]);
  };

  const onHandleChangeOrder = (result) => {
    const { source, destination } = result;

    if (!source || !destination) return;

    const newOrderPages = pages.slice();

    const [removed] = newOrderPages.splice(source.index, 1);

    newOrderPages.splice(destination.index, 0, removed);

    const newPages = newOrderPages.map((page, index) => ({
      ...page,
      order: index + 1,
    }));

    setPages(newPages);
  };
  const onHandleUploadVideo = (result) => {
    if (result && result.videoId) {
      setAllowSubmit(true);
      setMuxID(result.videoId);
      dispatch({
        payload: result,
      });
    }
  };

  // found this to prevent form submission for windows PC chrome/IE
  const checkKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <section>
        <div className="tab-pane fade show active" id="users">
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} onKeyDown={checkKeyDown}>
              <LessonAdminHeader
                validData={validData}
                lessonId={lessonId}
                lessonForm={lessonForm}
                dispatch={dispatch}
                handleSubmit={handleSubmit}
                loading={loading}
                loadingPublish={loadingPublish}
                onHandlePublish={handleSubmit(onHandlePublish)}
                isPublish={isPublish}
                goBack={setCreate}
                errors={errors}
                register={register}
                allowSubmit={allowSubmit}
              />

              <LessonForm
                lessonId={lessonId}
                validData={validData}
                setValidData={setValidData}
                lessonForm={lessonForm}
                dispatch={dispatch}
                pdf={pdf}
                setPdf={setPdf}
                onAddPage={onAddPage}
                pages={pages}
                setPages={setPages}
                onSetPageInfo={onSetPageInfo}
                onRemovePage={onRemovePage}
                setErrorMessage={setErrorMessage}
                setSuccessMessage={setLessonSuccess}
                onHandleChangeOrder={onHandleChangeOrder}
                onHandleUploadVideo={onHandleUploadVideo}
                videoId={muxID}
                errors={errors}
                register={register}
                setValue={setValue}
                control={control}
                setAllowSubmit={setAllowSubmit}
                getFieldState={getFieldState}
                goBack={setCreate}
              />
            </form>
          </div>
        </div>
      </section>
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={lessonSuccess}
          setMessage={setLessonSuccess}
        />
      </AlertWrapper>
    </>
  );
};

export default LessonAdminView;
