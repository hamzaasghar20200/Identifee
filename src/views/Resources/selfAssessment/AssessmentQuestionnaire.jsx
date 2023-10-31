import React, { useEffect, useReducer, useState } from 'react';
import { Card, FormGroup, Label } from 'reactstrap';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import AssessmentScoring from './assessmentScoring.json';

import ValidationErrorText from '../../../components/commons/ValidationErrorText';
import { validateEmail } from '../../../utils/Utils';
import { useTenantContext } from '../../../contexts/TenantContext';

const SlideType = {
  info: 'info',
};
const userInfo = [
  {
    id: 'q1',
    key: 'name',
    type: SlideType.info,
    title: 'Hello, please introduce yourself!',
    choices: [
      { key: 'name', type: 'input', value: '' },
      { key: 'email', type: 'email', value: '' },
      { key: 'company', type: 'input', value: '' },
    ],
  },
];
export default function AssessmentQuestionnaire({
  assessmentQuestions,
  finishQuestionnaire,
  setProgress,
  isPublic,
  isAdaptionInstitute,
}) {
  const [questions, setQuestions] = isPublic
    ? useState([...userInfo, ...assessmentQuestions])
    : useState([...assessmentQuestions]);
  const [assessmentQuestionnaire, updateAssessmentQuestionnaire] = useReducer(
    (prev, next) => {
      return { ...prev, ...next };
    },
    {
      currentIndex: 0,
      currentQuestion: questions[0],
      results: {
        Amiable: 0,
        Analytical: 0,
        Driver: 0,
        Expressive: 0,
      },
      error: false,
      errorMsg: 'Please fill this info to proceed',
    }
  );
  const { tenant } = useTenantContext();

  const updateProgress = () => {
    setProgress(
      Math.round(
        ((assessmentQuestionnaire.currentIndex + 1) / questions.length) * 100
      )
    );
  };

  const answered = () => {
    updateAssessmentQuestionnaire({
      errorMsg: 'Please fill this info to proceed',
    });
    if (assessmentQuestionnaire.currentQuestion?.type === SlideType.info) {
      let isEmptyFields = assessmentQuestionnaire.currentQuestion.choices.every(
        (field) => !!field.value
      );
      // check for email validation
      const emailField = assessmentQuestionnaire.currentQuestion.choices.find(
        (f) => f.type === 'email'
      );
      const isValidEmail = validateEmail(emailField.value);
      if (!isValidEmail && isEmptyFields) {
        updateAssessmentQuestionnaire({
          errorMsg: 'Please enter a valid email address.',
        });
        isEmptyFields = isValidEmail;
      }
      return isEmptyFields;
    }
    return assessmentQuestionnaire.currentQuestion?.choices?.some(
      (opt) => opt.isSelected
    );
  };

  useEffect(() => {
    updateAssessmentQuestionnaire({
      currentQuestion: questions[assessmentQuestionnaire.currentIndex],
      error: false,
    });
    updateProgress();
  }, [assessmentQuestionnaire.currentIndex]);

  const handleNext = () => {
    // validate option selected from current question
    if (!answered()) {
      updateAssessmentQuestionnaire({ error: true });
      return;
    }

    if (assessmentQuestionnaire.currentIndex + 1 < questions.length) {
      updateAssessmentQuestionnaire({
        currentIndex: assessmentQuestionnaire.currentIndex + 1,
      });
    } else {
      const userDetails = {};
      // if its public then minus first one because we are handling it below
      const pickedQuestions = isPublic ? questions.slice(1) : questions;
      const submissionRequest = {
        submission: pickedQuestions.map((q) => {
          const selectedChoice = q.choices.find((c) => c.isSelected);
          return {
            selfAssessmentQuestionId: q.selfAssessmentQuestionId,
            choice: {
              id: selectedChoice.id,
              correct: true,
              personality: selectedChoice.personality,
              answer: selectedChoice.answer,
            },
          };
        }),
        personality: Object.assign(
          ...Object.keys(assessmentQuestionnaire.results).map((k) => ({
            [k.toLowerCase()]: assessmentQuestionnaire.results[k],
          }))
        ),
        tenantId: tenant?.id,
      };

      // if its public then fill name, email, company
      if (isPublic) {
        questions[0].choices.forEach((f) => {
          userDetails[f.key] = f.value;
        });
      }
      finishQuestionnaire(assessmentQuestionnaire.results, {
        ...submissionRequest,
        ...userDetails,
      });
    }
  };
  const handlePrev = () => {
    updateAssessmentQuestionnaire({
      currentIndex: assessmentQuestionnaire.currentIndex - 1,
    });
  };

  const markCurrentSelected = (choices, selectedOption) => {
    return choices.map((choice) => ({
      ...choice,
      isSelected: selectedOption.id === choice.id,
    }));
  };
  const saveAnswer = (selectedOption, index) => {
    const scoringObject =
      AssessmentScoring[
        assessmentQuestionnaire.currentIndex +
          1 -
          (isPublic ? userInfo.length : 0)
      ];
    const legend = scoringObject[index];
    const newResults = {
      ...assessmentQuestionnaire.results,
      [legend]: assessmentQuestionnaire.results[legend] + 1,
    };
    updateAssessmentQuestionnaire({ results: newResults, error: false });

    const updatedQuestion = {
      ...assessmentQuestionnaire.currentQuestion,
      choices: markCurrentSelected(
        assessmentQuestionnaire.currentQuestion.choices,
        selectedOption
      ),
    };
    updateAssessmentQuestionnaire({ currentQuestion: updatedQuestion });

    setQuestions(
      [...questions].map((question) =>
        question.selfAssessmentQuestionId ===
        updatedQuestion.selfAssessmentQuestionId
          ? { ...updatedQuestion }
          : question
      )
    );
  };

  const NextButton = () => {
    return (
      <div className="d-flex align-items-center font-weight-medium gap-1 px-3">
        <span>Next</span>
        <MaterialIcon icon={'arrow_forward_ios'} clazz="font-size-md" />
      </div>
    );
  };

  const handleChange = (e, currentField) => {
    const updatedQuestion = {
      ...assessmentQuestionnaire.currentQuestion,
      choices: [...assessmentQuestionnaire.currentQuestion.choices].map(
        (f) => ({
          ...f,
          value: f.key === currentField.key ? e.target.value : f.value,
        })
      ),
    };
    updateAssessmentQuestionnaire({ currentQuestion: updatedQuestion });

    setQuestions(
      [...questions].map((question) =>
        question.selfAssessmentQuestionId ===
        updatedQuestion.selfAssessmentQuestionId
          ? { ...updatedQuestion }
          : question
      )
    );
  };

  return (
    <div className="d-flex justify-content-center m-auto align-items-center w-100">
      <div className="w-100 px-md-0 px-sm-0 p-lg-4">
        <p className="text-uppercase mb-2 font-size-sm">
          Question {assessmentQuestionnaire.currentIndex + 1}/{questions.length}
        </p>
        <h1 className="mb-3 m-auto">
          {assessmentQuestionnaire.currentQuestion.title.replaceAll('*', '')}
        </h1>

        <>
          {assessmentQuestionnaire.currentQuestion?.type === SlideType.info ? (
            <>
              {assessmentQuestionnaire.currentQuestion.choices.map((field) => (
                <FormGroup key={field.key} className="text-left">
                  <Label className="text-capitalize font-size-md">
                    {field.key} *
                  </Label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Enter your ${field.key}`}
                    value={field.value}
                    onChange={(e) => handleChange(e, field)}
                  />
                </FormGroup>
              ))}
            </>
          ) : (
            <>
              {assessmentQuestionnaire.currentQuestion?.choices.map(
                (opt, index) => (
                  <Card
                    onClick={() => saveAnswer(opt, index)}
                    key={opt.id}
                    className={`mb-2 p-2 option-hover ${
                      isAdaptionInstitute ? 'ai' : ''
                    } ${opt.isSelected ? 'selected' : ''}`}
                  >
                    <div className="d-flex gap-2 align-items-center">
                      <MaterialIcon
                        icon={
                          !opt.isSelected
                            ? 'radio_button_unchecked'
                            : 'radio_button_checked'
                        }
                        clazz={`font-size-2xl checked-icon ${
                          opt.isSelected
                            ? isAdaptionInstitute
                              ? 'text-ai'
                              : 'text-primary'
                            : ''
                        }`}
                      />
                      <p className="mb-0 text-left">{opt.answer}</p>
                    </div>
                  </Card>
                )
              )}
            </>
          )}
        </>

        {assessmentQuestionnaire.error && (
          <div
            className={`transition fadeIn ${
              assessmentQuestionnaire.error ? 'opacity-1' : 'opacity-0'
            }`}
          >
            <ValidationErrorText
              text={
                assessmentQuestionnaire.currentQuestion?.type === SlideType.info
                  ? assessmentQuestionnaire.errorMsg
                  : `Please make a selection to proceed.`
              }
              extraClass="my-0 bg-soft-red rounded p-2 position-relative text-left"
            />
          </div>
        )}

        <div className="navigation d-flex align-items-center mt-6 justify-content-between">
          {assessmentQuestionnaire.currentIndex + 1 > 1 && (
            <ButtonIcon
              icon="arrow_back_ios"
              label="Back"
              color={
                isAdaptionInstitute ? 'outline-ai-institute' : 'outline-primary'
              }
              classnames="btn-sm font-weight-medium pl-2 pr-3"
              iconClass="font-size-md font-weight-medium"
              onclick={handlePrev}
            />
          )}
          {assessmentQuestionnaire.currentIndex + 1 <= questions.length && (
            <ButtonIcon
              label={
                assessmentQuestionnaire.currentIndex + 1 < questions.length ? (
                  <NextButton />
                ) : (
                  'Finish'
                )
              }
              color={isAdaptionInstitute ? 'ai-institute' : 'primary'}
              classnames={`btn-sm ml-auto ${
                assessmentQuestionnaire.currentIndex + 1 < questions.length
                  ? 'pl-3 pr-2'
                  : 'px-3'
              }`}
              onclick={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
