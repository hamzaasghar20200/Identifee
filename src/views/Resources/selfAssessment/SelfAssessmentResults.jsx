import React, { useEffect, useState, useContext } from 'react';
import { Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import AssessmentResults from './AssessmentResults';
import routes from '../../../utils/routes.json';
import { useHistory, useParams } from 'react-router-dom';
import SelfAssessmentService from '../../../services/selfAssessment.service';
import Alert from '../../../components/Alert/Alert';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Skeleton from 'react-loading-skeleton';
import NoDataFound from '../../../components/commons/NoDataFound';
import SelfAssessmentWrapper from './SelfAssessmentWrapper';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import TooltipComponent from '../../../components/lesson/Tooltip';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';

export default function SelfAssessmentResults() {
  const [errorMessage, setErrorMessage] = useState('');
  const [assessment, setAssessment] = useState({});
  const [loader, setLoader] = useState(true);
  const history = useHistory();
  const isPublic = !history.location.pathname.includes('training');
  const isAdaptionInstitute = history.location.pathname.includes('adaption');
  const params = useParams();
  const { successMessage, setSuccessMessage } = useContext(AlertMessageContext);
  const [generateLink, setGenerateLink] = useState(false);

  const getAssessmentById = async () => {
    setLoader(true);
    try {
      const data = await SelfAssessmentService.getSubmittedAssessmentById(
        params.id
      );
      setAssessment(data);
    } catch (e) {
      console.log(e);
      setErrorMessage('Error in getting assessment.');
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getAssessmentById();
  }, []);

  const retakeAssessment = (e) => {
    e.preventDefault();
    if (isPublic) {
      if (isAdaptionInstitute) {
        history.push(routes.selfAssessmentAdaption);
      } else {
        history.push(routes.selfAssessmentPublic);
      }
    } else {
      history.push(routes.selfAssessment);
    }
  };

  const copyUrl = async (e) => {
    e.preventDefault();
    setGenerateLink(true);
    const { data } = await SelfAssessmentService.createTinyUrl(document.URL);
    navigator.clipboard.writeText(data.tiny_url);
    setSuccessMessage('Link copied!');
    setGenerateLink(false);
  };

  const NoAssessmentResultsFound = () => {
    const Description = () => {
      return (
        <div className="text-center">
          <p>
            We couldn&apos;t find self-assessment results. Please click below to
          </p>
          <ButtonIcon
            icon=""
            label="Take Self-Assessment"
            classnames="btn-sm"
            color="primary"
            onclick={retakeAssessment}
          />
        </div>
      );
    };
    const Title = () => {
      return (
        <div className="text-gray-search">
          No self-assessment results found.
        </div>
      );
    };

    return (
      <NoDataFound
        icon="assessment"
        title={<Title />}
        description={<Description />}
        containerStyle={'text-gray-search py-6 my-6'}
      />
    );
  };

  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <SelfAssessmentWrapper isAdaptionInstitute={isAdaptionInstitute}>
        <Card className="mx-sm-2">
          {loader ? (
            <>
              <CardHeader>
                <h3 style={{ height: 25, width: 200 }}>
                  <Skeleton height="10" width="200" />
                </h3>
                <h3 style={{ height: 25, width: 200 }}>
                  <Skeleton height="10" width="200" />
                </h3>
              </CardHeader>
              <CardBody className="text-center position-relative">
                <Skeleton count={3} height={10} className={'mb-2'} />
              </CardBody>
            </>
          ) : (
            <>
              {assessment?.personality ? (
                <>
                  <CardHeader>
                    <h3 className="mb-0">You Are...</h3>
                    <div className="d-flex align-items-center gap-2">
                      <TooltipComponent title="Retake Self-Assessment">
                        <a
                          href=""
                          className="icon-hover-bg border"
                          onClick={retakeAssessment}
                        >
                          <MaterialIcon icon="cached" />
                        </a>
                      </TooltipComponent>
                      {isPublic && (
                        <TooltipComponent title="Share Link">
                          <a
                            href=""
                            className="icon-hover-bg border"
                            onClick={copyUrl}
                          >
                            <MaterialIcon icon="link" />
                          </a>
                        </TooltipComponent>
                      )}
                      {generateLink && (
                        <TooltipComponent title="">
                          <a className="icon-hover-bg border">
                            <Spinner className="spinner-grow-xs" />
                          </a>
                        </TooltipComponent>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody
                    className={`text-center position-relative sa-results ${
                      isAdaptionInstitute ? 'ai' : ''
                    }`}
                  >
                    <AssessmentResults results={assessment?.personality} />
                  </CardBody>
                </>
              ) : (
                <NoAssessmentResultsFound />
              )}
            </>
          )}
        </Card>
      </SelfAssessmentWrapper>
    </>
  );
}
