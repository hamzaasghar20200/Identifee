import ButtonIcon from '../../../components/commons/ButtonIcon';
import { ADD_QUIZ, SELECT_OPTIONS_DESCRIPTION } from '../../../utils/constants';
import { FormGroup, Input } from 'reactstrap';
import TooltipComponent from '../../../components/lesson/Tooltip';
import { v4 as uuidv4 } from 'uuid';

const Question = ({ question, updateQuestion, children }) => {
  return (
    <>
      <FormGroup className="d-flex pb-1 justify-content-between align-items-center">
        <Input
          type="text"
          name="title"
          className="w-100"
          placeholder="What is the Question?"
          value={question.title || ''}
          onChange={(e) =>
            updateQuestion({ ...question, title: e.target.value })
          }
        />
      </FormGroup>
      {children}
    </>
  );
};

const QuizOption = ({ opt, onSelectAnswer, onRemoveOption, onChange }) => {
  return (
    <div className="option-wrapper">
      <p className="d-flex m-0 align-items-center p-2 w-100">
        <span
          className="material-icons-outlined mr-2 cursor-pointer"
          data-uw-styling-context="true"
          onClick={() => onSelectAnswer(opt)}
        >
          {!opt.correct ? 'radio_button_unchecked' : 'radio_button_checked'}
        </span>
        <Input
          type="text"
          name="answer"
          className="border-0 bg-transparent"
          placeholder="Option"
          value={opt.answer || ''}
          onChange={(e) => onChange(e, opt)}
        />
      </p>

      <TooltipComponent title="Remove Option">
        <span
          className="material-icons-outlined mr-2 icon-hover-bg cursor-pointer"
          data-uw-styling-context="true"
          onClick={() => onRemoveOption(opt)}
        >
          delete
        </span>
      </TooltipComponent>
    </div>
  );
};

const QuestionOptions = ({ question, updateQuestion }) => {
  const onAddQuizOption = () => {
    const updatedQuestion = { ...question };
    updatedQuestion.choices = [
      ...updatedQuestion.choices,
      {
        id: uuidv4(),
        answer: '',
        correct: false,
        order: updatedQuestion?.choices?.length
          ? updatedQuestion?.choices?.length + 1
          : 1,
      },
    ];
    updateQuestion(updatedQuestion);
  };

  const onSelectAnswer = (correct) => {
    const updatedQuestion = { ...question };
    updatedQuestion.choices = updatedQuestion.choices.map((o) =>
      o.id === correct.id ? { ...o, correct: true } : { ...o, correct: false }
    );
    updateQuestion(updatedQuestion);
  };

  const onRemoveOption = (opt) => {
    const updatedQuestion = { ...question };
    updatedQuestion.choices = updatedQuestion.choices.filter(
      (f) => f.id !== opt.id
    );
    updateQuestion(updatedQuestion);
  };

  const onChange = (e, opt) => {
    const updatedQuestion = { ...question };
    updatedQuestion.choices = updatedQuestion.choices.map((o) =>
      o.id === opt.id ? { ...o, answer: e.target.value } : o
    );
    updateQuestion(updatedQuestion);
  };

  return (
    <div className="text-center pb-0 pt-0 d-gray">
      <p>{SELECT_OPTIONS_DESCRIPTION}</p>

      {question?.choices?.map((opt) => (
        <QuizOption
          key={opt.id}
          opt={opt}
          onSelectAnswer={onSelectAnswer}
          onRemoveOption={onRemoveOption}
          onChange={onChange}
        />
      ))}

      <ButtonIcon
        icon="add_circle"
        type="button"
        onclick={onAddQuizOption}
        classnames="w-100 mb-3"
        color="primary"
        label="Add Option"
        disabled={question?.choices?.length > 4}
      />
    </div>
  );
};

const CourseQuizAdd = ({ quiz, setQuiz, questions, setQuestions }) => {
  const handleAddQuiz = () => {
    const newQuestion = {
      id: uuidv4(),
      title: '',
      type: 'multipleChoice',
      choices: [],
      isNew: true,
      order: questions.length ? questions.length + 1 : 1,
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateQuestion = (question) => {
    const updatedQuestions = [...questions].map((q) =>
      q.id === question.id ? { ...question } : { ...q }
    );
    setQuestions(updatedQuestions);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  return (
    <>
      {questions?.map((quest) => (
        <Question
          key={quest.id}
          question={quest}
          updateQuestion={updateQuestion}
        >
          <QuestionOptions question={quest} updateQuestion={updateQuestion} />
        </Question>
      ))}
      <div className="card bg-gray-200 rounded d-flex my-2 justify-content-center align-items-center min-h-120">
        <div className="text-center">
          <div className="d-flex justify-content-center gap-2 slide-button-wrapper">
            {!quiz?.quizId && ( // TODO once edit course quiz api get done will remove this check
              <ButtonIcon
                icon={!questions.length ? 'analytics' : 'add_circle'}
                label={!questions.length ? ADD_QUIZ : 'Add Question'}
                color="primary"
                type="button"
                onclick={handleAddQuiz}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseQuizAdd;
