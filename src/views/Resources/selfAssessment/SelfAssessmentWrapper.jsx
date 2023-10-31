import PageTitle from '../../../components/commons/PageTitle';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { changeFavIcon } from '../../../utils/Utils';

const AdaptionLogo = () => {
  return (
    <>
      <PageTitle
        page={['Self-Assessment']}
        customName="Adaption Institute"
      ></PageTitle>
      <div className="py-3 mt-lg-2 mt-sm-0 text-center">
        <img
          className="z-index-2 size-logo-login"
          src={'/img/sa-images/AdaptionInstitute-Logo.png'}
          alt={`Adaption Institute Logo`}
        />
      </div>
    </>
  );
};

const DefaultLogo = () => {
  return (
    <>
      <PageTitle page={['Self-Assessment']}></PageTitle>
      <div className="py-3 mt-lg-2 mt-sm-0 text-center">
        <img
          className="z-index-2 size-logo-login"
          src={'/img/logo.svg'}
          alt={`Identifee Logo`}
        />
      </div>
    </>
  );
};

const SelfAssessmentWrapper = ({ children, isAdaptionInstitute }) => {
  const history = useHistory();
  const isPublic = !history.location.pathname.includes('learn');

  useEffect(() => {
    if (isAdaptionInstitute) {
      changeFavIcon('/img/sa-images/AdaptionInstitute-Favicon.ico');
    }
  }, []);

  return (
    <>
      <div className="pipeline-header">
        <div
          className="mx-xs-2 m-md-auto m-lg-auto mb-2"
          style={{ maxWidth: 900 }}
        >
          {isPublic &&
            (isAdaptionInstitute ? <AdaptionLogo /> : <DefaultLogo />)}
          {children}
        </div>
        {isAdaptionInstitute && (
          <div className="p-2 text-center my-2">
            Powered by{' '}
            <a
              className="text-primary fw-bold"
              href="https://identifee.com"
              target="_blank"
              rel="noreferrer"
            >
              Identifee
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default SelfAssessmentWrapper;
