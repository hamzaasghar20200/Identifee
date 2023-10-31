import { Card, CardBody, CardHeader } from 'reactstrap';
import MuxPlayer from '@mux/mux-player-react';
import { AssessmentOverview } from './assessmentConstants';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import { ProgressBar } from 'react-bootstrap';
import AssessmentQuestionnaire from './AssessmentQuestionnaire';
import AssessmentResults from './AssessmentResults';
import React from 'react';

const SelfAssessmentCard = ({
  assessment,
  loader,
  retakeAssessment,
  updateAssessment,
  assessmentQuestions,
  redirectToResults,
  submitQuestionnaire,
  isPublic,
  isAdaptionInstitute,
}) => {
  return (
    <Card className="mx-sm-2">
      {!assessment.start ? (
        <>
          <CardHeader>
            <h3 className="mb-0">Communication Style Self-Assessment</h3>
          </CardHeader>
          <CardBody className="p-5">
            <div className="text-center mb-3">
              <MuxPlayer
                streamType="on-demand"
                playbackId={AssessmentOverview.video.playId}
                style={{
                  maxWidth: 600,
                }}
                className="rounded"
                poster={AssessmentOverview.video.poster}
                metadata={{
                  videoId: AssessmentOverview.video.videoId,
                  video_title: 'Overview',
                  viewer_user_id: AssessmentOverview.video.videoId,
                }}
                autoPlay={false}
              />
            </div>
            <p>
              Consider each of the following questions separately and select the
              option that corresponds to the description that best fits you. If
              you have trouble selecting only one answer, ask yourself which
              response, at work, would be the most natural or likely for you to
              make.
            </p>
            <p>
              After scoring your responses, you will notice you are not just one
              style, and neither is anyone else, so you have to adjust your
              communication accordingly. It is important not to label someone
              because we are all different and complex and no one individual
              fits into a box. This tool, as with other tools, is meant to be a
              guide and to give you ideas, but the best learning is through
              trial, error, reflection and trying again.
            </p>
            <div className="text-center">
              <ButtonIcon
                label="Start Your Self-Assessment"
                color={isAdaptionInstitute ? 'ai-institute' : 'primary'}
                loading={loader}
                classnames="mt-2"
                onclick={() => updateAssessment({ start: true })}
              />
            </div>
          </CardBody>
        </>
      ) : (
        <>
          {assessment.showResults && (
            <CardHeader>
              <h3 className="mb-0">You Are...</h3>
              <ButtonIcon
                label="Retake Self-Assessment"
                onclick={retakeAssessment}
                classnames="btn-sm ml-auto"
                color={isAdaptionInstitute ? 'ai-institute' : 'primary'}
              />
            </CardHeader>
          )}
          <CardBody className="text-center position-relative">
            {!assessment.showResults && !assessment.completed && (
              <ProgressBar
                now={assessment.progress}
                className={`w-100 position-absolute flat-progress top-0 left-0 ${
                  isAdaptionInstitute ? 'ai' : ''
                }`}
              />
            )}
            {!assessment.completed && (
              <AssessmentQuestionnaire
                assessmentQuestions={assessmentQuestions}
                isAdaptionInstitute={isAdaptionInstitute}
                finishQuestionnaire={(results, submissionRequest) => {
                  updateAssessment({ finalResult: results });
                  updateAssessment({ completed: true });
                  submitQuestionnaire(submissionRequest);
                }}
                setProgress={(newProgress) => {
                  updateAssessment({ progress: newProgress });
                }}
                isPublic={isPublic}
              />
            )}

            {assessment.completed && !assessment.showResults && (
              <div className="text-center mb-2">
                <div>
                  <span className="font-size-5em">&#127881;</span>
                </div>
                <h1 className="text-black my-2">Congratulations!</h1>
                <p>
                  You have successfully completed your communication style
                  self-assessment.
                </p>
                <ButtonIcon
                  label="See Your Results"
                  loading={loader}
                  onclick={redirectToResults}
                  color={isAdaptionInstitute ? 'ai-institute' : 'primary'}
                />
              </div>
            )}

            {assessment.showResults && (
              <AssessmentResults results={assessment.finalResult} />
            )}
          </CardBody>
        </>
      )}
    </Card>
  );
};

export default SelfAssessmentCard;
