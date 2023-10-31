import React, { useContext, useEffect, useState } from 'react';
import { Card, FormGroup, ListGroup } from 'react-bootstrap';
import { Label } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import DropdownLesson from '../../../components/lesson/DropdownLesson';
import categoryService from '../../../services/category.service';
import courseService from '../../../services/course.service';
import { courseInit } from './courses.constants';
import stringConstants from '../../../utils/stringConstants.json';
import HeaderCardCourses from '../../../components/courses/HeaderCardCourse';
import FormCourses from '../../../components/courses/FormCourses';
import {
  CATEGORY_REQUIRED,
  DRAFT,
  PUBLISHED,
  SEARCH_FOR_CATEGORY,
  SERVER_ERROR,
} from '../../../utils/constants';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import { Controller, useForm } from 'react-hook-form';
import ValidationErrorText from '../../../components/commons/ValidationErrorText';
import Asterick from '../../../components/commons/Asterick';
import NoDataFound from '../../../components/commons/NoDataFound';
import { CategoriesContext } from '../../../contexts/categoriesContext';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import TooltipComponent from '../../../components/lesson/Tooltip';
import AutoComplete from '../../../components/AutoComplete';
import lessonService from '../../../services/lesson.service';

const constants = stringConstants.settings.resources.courses;
const ItemLesson = ({ lesson, index, deleteItem }) => {
  return (
    <Draggable key={lesson.id} draggableId={`id-${lesson.id}`} index={index}>
      {(provided) => (
        <ListGroup.Item
          className="border-0 p-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="d-flex bg-hover-gray-dark rounded align-items-center py-2 pr-1 justify-content-between">
            <div id={lesson.id} className="item-user d-flex align-items-center">
              <div {...provided.dragHandleProps}>
                <MaterialIcon
                  icon="drag_indicator"
                  clazz="icon-list-size text-gray-600"
                />
              </div>
              <h5 className="mb-0 d-flex align-items-center ml-1">
                <span className="mr-1">{index + 1}.</span>
                <span>{lesson.title}</span>
              </h5>
            </div>
            <div>
              <TooltipComponent title="Delete">
                <a
                  className="cursor-pointer btn btn-icon-sm btn-icon icon-hover-bg"
                  onClick={() => {
                    deleteItem(index);
                  }}
                >
                  <MaterialIcon icon="delete" />
                </a>
              </TooltipComponent>
            </div>
          </div>
        </ListGroup.Item>
      )}
    </Draggable>
  );
};

const ListLesson = ({ lessons, deleteItem, onDragEnd }) => {
  const Title = () => {
    return <div className="text-muted">No Lessons</div>;
  };
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ListGroup
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mt-3"
              variant="flush"
            >
              {lessons.map((lesson, index) => (
                <ItemLesson
                  key={index}
                  lesson={lesson}
                  index={index}
                  deleteItem={deleteItem}
                />
              ))}
              {provided.placeholder}
            </ListGroup>
          )}
        </Droppable>
      </DragDropContext>
      {lessons.length === 0 && (
        <NoDataFound
          title={<Title />}
          icon="menu_book"
          containerStyle="w-100 border bg-gray-200 rounded border-dashed-gray min-h-120 text-muted"
        />
      )}
    </>
  );
};

const ManagementCourses = ({ currentCourseId, setCreate }) => {
  const [currentCourse, setCurrentCourse] = useState(courseInit);
  const [allCategories, setAllCategories] = useState([]);
  const [allLessons, setAllLessons] = useState([]);
  const [selectLessons, setSelectLessons] = useState([]);
  const [removedLessons, setRemovedLessons] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [quiz, setQuiz] = useState({ maxAttempts: 10 });
  const [questions, setQuestions] = useState([]);
  const { setRefresh } = useContext(CategoriesContext);
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

  const getCategoryIds = () => {
    return selectedCategories?.map((c) => c.id || c.categoryId);
  };

  const onHandleChangeForm = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === 'name') {
      setValue('name', value);
    }

    if (name === 'description') {
      setValue('description', value);
    }

    if (name === 'is_learning_path') {
      value = !currentCourse.is_learning_path;
    }

    setCurrentCourse({
      ...currentCourse,
      [name]: value,
    });
  };

  const getCategories = async ({ search, limit = 1000 }) => {
    const options = { search, order: ['updated_at', 'DESC'] };
    try {
      const response = await categoryService.GetCategories(options, { limit });
      const { data } = response;
      setAllCategories([...data].map((m) => ({ ...m, icon: null })));
      setLoadingCategories(false);
    } catch (e) {
      setErrorMessage(SERVER_ERROR);
    }
  };

  const getLessons = async (query) => {
    if (selectedCategories?.length) {
      try {
        const data = await lessonService.getLessons({
          page: 1,
          limit: 100,
          categoryId: getCategoryIds(),
          ...query,
        });

        setAllLessons(data?.data);
      } catch (e) {
        setErrorMessage(SERVER_ERROR);
      }
    }
  };

  const onHandleDeleteLesson = (index) => {
    const lessons = selectLessons?.slice();
    const [removed] = lessons.splice(index, 1);

    setSelectLessons(lessons);

    if (currentCourse.id) {
      const removedId = [...removedLessons];
      if (removed.CourseLessonModel)
        removedId.push(removed.CourseLessonModel.id);

      setRemovedLessons(removedId);
    }
  };

  const updateCourse = async () => {
    const lessons = selectLessons.map((item) => item.id);
    const { id, name, is_learning_path, category } = currentCourse;
    const courseUpdate = {
      name,
      description: currentCourse.description || '',
      is_learning_path,
      lessons,
      removedLessons,
      category_id: category?.id,
      categoryIds: getCategoryIds(),
      status: DRAFT,
    };

    setLoading(true);

    // TODO: put all below request and promise.all in one go
    saveQuiz();

    try {
      await courseService.updateCourseLessons(id, courseUpdate);
      setSuccessMessage(constants.courseUpdateSuccessMessage);
      reset({});
      // this is updating a categories context so that when any category is updated
      // we also trigger an update to refresh call from api for sidemenu navigation
      setRefresh((prevState) => prevState + 1);
      setCreate(false);
    } catch (e) {
      setErrorMessage(SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const validateQuiz = () => {
    if (!quiz?.questions?.length) {
      return true;
    }

    const errors = {};

    [...questions].forEach((q) => {
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
      if (!q.choices.every((c) => !!c.answer)) {
        errors[q.id] = {
          question: q,
          errors: [
            ...(errors[q.id]?.errors || []),
            'All options text is required.',
          ],
        };
      }

      // at least one correct option must be selected
      if (!q.choices.some((c) => c.correct)) {
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

  const saveQuiz = async () => {
    if (quiz?.questions?.length) {
      // save quiz
      try {
        await courseService.createCourseQuiz(currentCourseId, {
          order: 1,
          quiz: removeKeysFromQuestion(quiz),
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const onHandleSaveCourse = async () => {
    const lessons = selectLessons;

    if (!lessons || lessons.length < 2) {
      setErrorMessage('Minimum 2 lessons are required');
      return;
    }

    // TODO: this needs to be done with react-hook-form to show inline errors, okay for now? :P
    if (!validateQuiz()) {
      return;
    }

    if (currentCourse.id) {
      updateCourse();
    }
  };

  const removeKeysFromQuestion = (quiz) => {
    const newQuiz = { ...quiz };
    newQuiz.questions = newQuiz.questions.map((q) => {
      const newQ = { title: q.title, order: q.order, type: q.type };
      if (q.quizQuestionId) {
        delete q.id;
      }
      newQ.choices = q.choices.map((c) => {
        return {
          id: c.id,
          answer: c.answer,
          correct: c.correct,
          order: c.order,
        };
      });
      return newQ;
    });
    return newQuiz;
  };

  const onHandlePublished = async () => {
    const lessons = selectLessons;

    if (!lessons || lessons.length < 2) {
      setErrorMessage('Minimum 2 lessons are required');
      return;
    }

    // TODO: this needs to be done with react-hook-form to show inline errors, okay for now? :P
    if (!validateQuiz()) {
      return;
    }

    setLoadingPublish(true);
    const lessonIds = selectLessons.map((item) => item.id);
    const status = PUBLISHED;
    const { id, name, is_learning_path, category } = currentCourse;
    const courseUpdate = {
      name,
      description: currentCourse.description || '',
      is_learning_path,
      lessons: lessonIds,
      removedLessons,
      category_id: category?.id,
      status,
      categoryIds: getCategoryIds(),
    };

    // TODO: put all below request and promise.all in one go
    saveQuiz();

    await courseService.updateCourseLessons(id, courseUpdate);

    courseService
      .updateCourse(currentCourse.id, { status })
      .then(() => {
        currentCourse.status = PUBLISHED;
        setSuccessMessage(
          currentCourse.status === PUBLISHED
            ? constants.coursePublishedSuccessMessage
            : constants.courseUnpublishedSuccessMessage
        );
        reset({});
        setCreate(false);
      })
      .catch((e) => {
        setErrorMessage(SERVER_ERROR);
      })
      .finally(() => {
        setLoadingPublish(false);
      });
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onHandleDragEndLessons = (result) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      selectLessons,
      result.source.index,
      result.destination.index
    );

    setSelectLessons(items);
  };

  const clearLessons = () => {
    if (currentCourse.id) {
      const removedId = [];
      selectLessons.forEach((lesson) => {
        if (lesson.CourseLessonModel) {
          removedId.push(lesson.CourseLessonModel.id);
        }
      });

      setRemovedLessons([...removedLessons, ...removedId]);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await getCategories({});
    };

    getData();
  }, []);

  useEffect(() => {
    clearLessons();
    setSelectLessons([]);
    setCurrentCourse({
      ...currentCourse,
      category: {},
    });
  }, [currentCourse.is_learning_path]);

  useEffect(() => {
    const getData = async () => {
      await getLessons({});
    };
    getData();
  }, [selectedCategories]);

  const processCourseResponse = (course) => {
    if (course) {
      const {
        id,
        name,
        description,
        is_learning_path,
        badge,
        quiz,
        status,
        lessons,
        category,
        categoryCourses,
      } = course;

      setCurrentCourse({
        id,
        name,
        description,
        is_learning_path,
        status,
        badge,
        quiz,
        category,
      });

      setValue('name', name);
      setValue('categoryId', [category?.id]);
      setSelectedCategories(
        categoryCourses?.map((c) => c.category) ?? [category.id]
      );

      const lessonsOrder = lessons.sort((next, prox) => {
        if (next.CourseLessonModel.position > prox.CourseLessonModel.position) {
          return 1;
        }
        return -1;
      });

      setSelectLessons(lessonsOrder);
    }
  };

  const processQuizResponse = (quizData) => {
    const { data } = quizData;
    const courseQuiz = data?.data[0] || {};
    setQuiz(courseQuiz.quiz);
    setQuestions(
      [...courseQuiz.quiz.questions].map((m) => ({
        ...m,
        id: m.quizQuestionId,
      }))
    );
  };

  useEffect(() => {
    const getDataCourse = async () => {
      if (currentCourseId && currentCourseId !== 'new') {
        try {
          const responses = await Promise.all([
            courseService.getCourseLessonsById(currentCourseId),
            courseService.getQuizByCourse(currentCourseId),
          ]);
          processCourseResponse(responses[0]);
          processQuizResponse(responses[1]);
        } catch (e) {}
      }
    };

    getDataCourse();
  }, [currentCourseId]);

  return (
    <div>
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <Card>
        <form onSubmit={handleSubmit(onHandleSaveCourse)}>
          <HeaderCardCourses
            published={currentCourse.status?.toLowerCase() !== 'published'}
            loading={loading}
            loadingPublish={loadingPublish}
            onHandleSave={onHandleSaveCourse}
            onHandlePublished={handleSubmit(onHandlePublished)}
            flagNew={currentCourse.id}
            goBack={() => {
              reset({});
              setCreate(false);
            }}
            register={register}
            errors={errors}
            courseForm={currentCourse}
            onHandleChange={onHandleChangeForm}
            courseId={currentCourseId}
          />
          <Card.Body className="px-3">
            <div className="d-flex">
              <div className="w-100">
                <div>
                  <Controller
                    render={({ field }) => (
                      <FormGroup>
                        <Label htmlFor="categoryId">
                          {constants.selectCategory} <Asterick />{' '}
                        </Label>
                        <AutoComplete
                          {...field}
                          id="categoryId"
                          placeholder={SEARCH_FOR_CATEGORY}
                          name="categoryId"
                          data={allCategories}
                          loading={loadingCategories}
                          fieldState={getFieldState('categoryId')}
                          onChange={(items, itemToRemove) => {
                            const updatedCategories = [...items].filter(
                              (c) => c.id !== itemToRemove.id
                            );
                            setSelectedCategories(updatedCategories);
                            const ids = updatedCategories.map((c) => c.id);
                            setValue(
                              'categoryId',
                              !ids.length ? '' : ids.join(',')
                            );
                            // clear lessons list once all categories are removed from dropdown.
                            if (!updatedCategories.length) {
                              setSelectLessons([]);
                            }
                          }}
                          customKey="title"
                          isMultiple={true}
                          selected={selectedCategories}
                        />
                      </FormGroup>
                    )}
                    name="categoryId"
                    rules={{ required: true }}
                    control={control}
                  />
                  {errors.categoryId && !selectedCategories?.length && (
                    <ValidationErrorText text={CATEGORY_REQUIRED} />
                  )}
                </div>

                {selectedCategories?.length > 0 && (
                  <div className="pt-0">
                    <FormGroup>
                      <Label
                        htmlFor="selectLessonDropdown"
                        className="form-label"
                      >
                        {constants.searchLessonPlaceholder} <Asterick />{' '}
                        <span className="fs-8 font-weight-normal">
                          (minimum 2 are required)
                        </span>
                      </Label>
                      <DropdownLesson
                        id={`selectLessonDropdown`}
                        title={constants.searchLessonPlaceholder}
                        placeholder={constants.searchLessonPlaceholder}
                        value={''}
                        results={allLessons}
                        error={'nada'}
                        selection={selectLessons}
                        setSelection={setSelectLessons}
                        onDeleteLesson={onHandleDeleteLesson}
                        onChange={(e) => {
                          if (e) {
                            const { value } = e.target;
                            getLessons({ search: value });
                          }
                        }}
                      />
                    </FormGroup>
                    <ListLesson
                      lessons={selectLessons}
                      deleteItem={onHandleDeleteLesson}
                      onDragEnd={onHandleDragEndLessons}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
          <Card.Footer className="px-3">
            <FormCourses
              course={currentCourse}
              errors={errors}
              register={register}
              setValue={setValue}
              onHandleChange={onHandleChangeForm}
            />
          </Card.Footer>
        </form>
      </Card>
    </div>
  );
};

export default ManagementCourses;
