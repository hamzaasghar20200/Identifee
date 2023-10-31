import React, { useEffect, useReducer, useState } from 'react';
import { PersonalityTypes, SelfAssessmentTypes } from './assessmentConstants';
import { useHistory } from 'react-router-dom';
import AssessmentQuestions from './assessmentQuestions.json';
import AssessmentScoring from './assessmentScoring.json';
import SelfAssessmentService from '../../../services/selfAssessment.service';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import routes from '../../../utils/routes.json';
import SelfAssessmentWrapper from './SelfAssessmentWrapper';
import SelfAssessmentCard from './SelfAssessmentCard';
import useUrlSearchParams from '../../../hooks/useUrlSearchParams';

export default function SelfAssessment() {
  const [defaultAssessment, setDefaultAssessment] = useState({});
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loader, setLoader] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState({});
  const params = useUrlSearchParams();
  const startAssessment = params.get('start') || false;
  const [assessment, updateAssessment] = useReducer(
    (prev, next) => {
      return { ...prev, ...next };
    },
    {
      start: false,
      completed: false,
      showResults: false,
      finalResult: {},
      progress: 0,
    }
  );
  const history = useHistory();
  const isPublic = !history.location.pathname.includes('learn');
  const isAdaptionInstitute = history.location.pathname.includes('adaption');

  const createDefaultAssessment = async () => {
    setLoader(true);
    try {
      const newAssessment = {
        selfAssessmentType: SelfAssessmentTypes.Both,
        questions: [],
      };

      for (let i = 0; i < AssessmentQuestions.fields.length; i++) {
        const currentQuestion = AssessmentQuestions.fields[i];
        const scoringLegend = AssessmentScoring[i + 1];
        const newQuestion = {
          type: 'multipleChoice',
          order: i + 1,
          title: currentQuestion.title.replaceAll('*', ''),
        };
        newQuestion.choices = currentQuestion.properties.choices.map(
          (choice, index) => {
            return {
              id: choice.id,
              answer: choice.label,
              correct: false,
              personality: PersonalityTypes[scoringLegend[index]],
            };
          }
        );
        newAssessment.questions.push(newQuestion);
      }

      const { data } = await SelfAssessmentService.createDefaultQuestions(
        newAssessment
      );
      setDefaultAssessment(data);
    } catch (e) {
      console.log(e);
      setErrorMessage('Error in getting questions.');
    } finally {
      setLoader(false);
    }
  };

  const getAssessments = async () => {
    setLoader(true);
    try {
      const { data } = await SelfAssessmentService.getAssessments();
      if (data?.length > 0) {
        setDefaultAssessment(data[0]);
      } else {
        createDefaultAssessment();
      }
    } catch (e) {
      console.log(e);
      setErrorMessage('Error in getting assessment.');
    } finally {
      setLoader(false);
    }
  };

  const getAssessmentQuestions = async () => {
    const data = await SelfAssessmentService.getAssessmentQuestions(
      defaultAssessment.selfAssessmentId
    );
    setAssessmentQuestions(data);
    if (startAssessment) {
      updateAssessment({ start: true });
    }
  };

  useEffect(() => {
    getAssessments();
  }, []);

  useEffect(() => {
    if (defaultAssessment?.selfAssessmentId) {
      getAssessmentQuestions();
    }
  }, [defaultAssessment]);

  const retakeAssessment = () => {
    updateAssessment({
      completed: false,
      start: true,
      finalResult: {},
      progress: 0,
      showResults: false,
    });
    setAssessmentQuestions(assessmentQuestions);
  };

  const submitQuestionnaire = async (submissionRequest) => {
    try {
      setLoader(true);
      const data = await SelfAssessmentService.submitAssessment(
        { ...submissionRequest, source: isAdaptionInstitute ? 'adaption' : '' },
        defaultAssessment.selfAssessmentId
      );
      setAssessmentResults(data);
    } catch (e) {
      console.log(e);
      setErrorMessage('Error in submitting questionnaire.');
    } finally {
      setLoader(false);
    }
  };

  const redirectToResults = () => {
    if (isPublic) {
      if (isAdaptionInstitute) {
        history.push(
          `${routes.selfAssessmentAdaption}/${assessmentResults.selfAssessmentSubmissionId}/results`
        );
      } else {
        history.push(
          `${routes.selfAssessmentPublic}/${assessmentResults.selfAssessmentSubmissionId}/results`
        );
      }
    } else {
      history.push(
        `${routes.selfAssessment}/${assessmentResults.selfAssessmentSubmissionId}/results`
      );
    }
  };

  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
      </AlertWrapper>
      <SelfAssessmentWrapper isAdaptionInstitute={isAdaptionInstitute}>
        <SelfAssessmentCard
          loader={loader}
          isPublic={isPublic}
          assessment={assessment}
          retakeAssessment={retakeAssessment}
          updateAssessment={updateAssessment}
          redirectToResults={redirectToResults}
          submitQuestionnaire={submitQuestionnaire}
          assessmentQuestions={assessmentQuestions}
          isAdaptionInstitute={isAdaptionInstitute}
        />
      </SelfAssessmentWrapper>
    </>
  );
}
