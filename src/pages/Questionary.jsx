import qs from 'qs';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useHistory, useParams } from 'react-router';
import AlertWrapper from '../components/Alert/AlertWrapper';
import courseService from '../services/course.service';
import Alert from '../components/Alert/Alert';
import PageTitle from '../components/commons/PageTitle';
import { CardBody, Input, ListGroup, ListGroupItem } from 'reactstrap';
import ButtonIcon from '../components/commons/ButtonIcon';
import Skeleton from 'react-loading-skeleton';
import IconText from '../components/loaders/IconText';
import NoDataFound from '../components/commons/NoDataFound';
import QuizResultModal from '../components/modal/QuizResultModal';
import routes from '../utils/routes.json';

const QuestionLoader = ({ count = 2 }) => {
  const [lookupCount] = useState(Array(count).fill(0));
  const SkeletonTemplate = () => {
    return (
      <div className="mb-3">
        <Skeleton height="13" width={200} className="d-block mb-2" />
        <ListGroup>
          <ListGroupItem className="p-2">
            <IconText count={1} />
          </ListGroupItem>
          <ListGroupItem className="p-2">
            <IconText count={1} />
          </ListGroupItem>
          <ListGroupItem className="p-2">
            <IconText count={1} />
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  };
  return (
    <div>
      {lookupCount.map((_, index) => (
        <SkeletonTemplate key={index} />
      ))}
    </div>
  );
};

const Question = ({ question, updateAnswers }) => {
  return (
    <Card className="border-0 p-0 shadow-0 shadow-none">
      <CardBody className="p-0">
        <h4>{question.title}</h4>
        <ListGroup className="mb-3">
          {question.choices.map((opt) => (
            <ListGroupItem key={opt.id} className="p-2">
              <p className="d-flex m-0 align-items-center p-0 mb-0 w-100">
                <span
                  className="material-icons-outlined mr-2 cursor-pointer"
                  data-uw-styling-context="true"
                  onClick={() => updateAnswers(question, opt)}
                >
                  {opt.isSelected
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked'}
                </span>
                <Input
                  type="text"
                  name="answer"
                  readOnly={true}
                  disabled={true}
                  className={`border-0 bg-transparent font-size-sm-2 p-0 ${
                    opt.isSelected ? 'font-weight-semi-bold' : ''
                  }`}
                  style={{ height: 32 }}
                  placeholder="Option"
                  value={opt.answer || ''}
                />
              </p>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

const Questionary = () => {
  const { courseId } = useParams();
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const history = useHistory();
  const [course, setCourse] = useState({});
  const [quiz, setQuiz] = useState({});
  const [questions, setQuestions] = useState([]);
  const [submitLoader, setSubmitLoader] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [allowSubmit, setAllowSubmit] = useState(false);
  const [score, setScore] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setPageLoader(true);
      try {
        const responses = await Promise.all([
          courseService.getCourseLessonsById(courseId),
          courseService.getQuizByCourse(courseId),
        ]);
        setCourse(responses[0] || {});
        const { data } = responses[1];
        const courseQuiz = data?.data[0] || {};
        setQuiz(courseQuiz.quiz);
        setQuestions(courseQuiz.quiz.questions);
      } catch (e) {
        console.log(e);
      } finally {
        setPageLoader(false);
      }
    };
    getData();
  }, []);

  const updateAnswers = (question, answer) => {
    const updatedQuestion = { ...question };
    updatedQuestion.choices = updatedQuestion.choices.map((o) =>
      o.id === answer.id
        ? { ...o, isSelected: true }
        : { ...o, isSelected: false }
    );
    const updatedQuestions = [...questions].map((q) =>
      q.quizQuestionId === question.quizQuestionId
        ? { ...updatedQuestion }
        : { ...q }
    );
    setQuestions(updatedQuestions);

    const answers = [...updatedQuestions].map((q) => {
      return {
        quizQuestionId: q.quizQuestionId,
        id: q.choices.find((c) => c.isSelected)?.id,
      };
    });

    // checking if all answers are given then allow submission
    setAllowSubmit(answers.filter((f) => !!f.id).length === questions.length);
  };

  const handleSubmitAnswers = async () => {
    setSubmitLoader(true);
    const answers = [...questions].map((q) => {
      return {
        quizQuestionId: q.quizQuestionId,
        id: q.choices.find((c) => c.isSelected)?.id,
      };
    });
    try {
      const result = await courseService.submitCourseQuizAnswers(
        courseId,
        quiz.quizId,
        {
          answers,
        }
      );
      if (result?.data?.score) {
        setScore(result?.data?.score);
        setShowResultModal(true);
      }
      // TODO revisit this..
      await courseService.continue(courseId, {
        courseContentId: query?.courseContentId,
      });
    } catch (e) {
      console.log(e);
      setErrorMessage('Error in submitting answers. Please try again.');
    } finally {
      setSubmitLoader(false);
    }
  };

  const onHandleCloseModal = async () => {
    setShowResultModal(false);
    setTimeout(() => {
      history.push(`${routes.courses}/${courseId}`);
    }, 100);
  };

  return (
    <>
      <PageTitle page={`${course?.name} - Quiz`} pageModule="Training" />
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <QuizResultModal
        showModal={showResultModal}
        setShowModal={setShowResultModal}
        score={score}
        onHandleCloseModal={onHandleCloseModal}
      />
      <AlertWrapper>
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <Card className="px-0">
        <Card.Header as="h3" className="px-3 fw-bold">
          {pageLoader ? (
            <Skeleton height="10" width={100} />
          ) : (
            <>{course?.name} - Quiz </>
          )}
        </Card.Header>
        <Card.Body>
          {pageLoader ? (
            <QuestionLoader />
          ) : (
            <>
              {questions.length > 0 ? (
                <>
                  {questions?.map((quest) => (
                    <Question
                      question={quest}
                      key={quest.quizQuestionId}
                      updateAnswers={updateAnswers}
                    />
                  ))}
                </>
              ) : (
                <NoDataFound
                  title="No quiz found for this course"
                  icon="quiz"
                  containerStyle="text-gray-900 my-6 py-6"
                />
              )}
            </>
          )}
        </Card.Body>
        <Card.Footer
          className={`text-right ${
            !pageLoader && questions.length > 0 ? '' : 'border-0'
          }`}
        >
          {pageLoader ? (
            <Skeleton height="13" width={80} />
          ) : (
            <>
              {questions.length > 0 ? (
                <ButtonIcon
                  label={'Submit'}
                  color="primary"
                  type="button"
                  classnames="btn-sm"
                  loading={submitLoader}
                  onclick={handleSubmitAnswers}
                  disabled={!allowSubmit}
                />
              ) : (
                <></>
              )}
            </>
          )}
        </Card.Footer>
      </Card>
    </>
  );
};

export default Questionary;
