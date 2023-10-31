import React, { useContext, useEffect, useState } from 'react';
import prospectService from '../../../services/prospect.service';
import { ProspectTypes } from '../../prospecting/v2/constants';
import { scrollToTop } from '../../../utils/Utils';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import { Card, CardBody } from 'reactstrap';
import TypeWriter from '../../commons/TypeWriter';
import ButtonIcon from '../../commons/ButtonIcon';
import NoDataFound from '../../commons/NoDataFound';
import FunnyLoaderBlinker from '../../commons/FunnyLoaderBlinker';
import Skeleton from 'react-loading-skeleton';
import AIReferences from '../../commons/AIReferences';
import IdfTooltip from '../../idfComponents/idfTooltip';
import AnthropicService from '../../../services/anthropic.service';

const getLocation = (apiOrgInfo, rrOrgInfo) => {
  if (apiOrgInfo?.address_city && apiOrgInfo?.address_state) {
    return `${apiOrgInfo?.address_city}, ${apiOrgInfo?.address_state}`;
  }

  if (rrOrgInfo?.city && rrOrgInfo?.state) {
    return `${rrOrgInfo?.city}, ${rrOrgInfo?.state}`;
  }
};

const PreCallPlan = ({ profileInfo }) => {
  const [loader, setLoader] = useState(false);
  const [content, setContent] = useState('');
  const [noDataFound, setNoDataFound] = useState('');
  const [references, setReferences] = useState([]);
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const getCompanyRRInfo = async () => {
    setNoDataFound('');
    try {
      setLoader(true);
      const response = await prospectService.query(
        { name: [profileInfo?.name] },
        {
          page: 1,
          limit: 1,
          type: ProspectTypes.company,
          order_by: 'popularity',
        }
      );

      const responseData = response?.data;
      let rocketReachCompanyDetails = null;
      if (responseData?.data?.length) {
        rocketReachCompanyDetails = responseData?.data[0];
      }

      const companyDescription = rocketReachCompanyDetails?.description;
      const companyDescriptionQuery = companyDescription
        ? `Company Description: '${companyDescription}'`
        : '';
      const companyName = profileInfo?.name || rocketReachCompanyDetails?.name;
      const companyWebsite =
        profileInfo?.website || rocketReachCompanyDetails?.domain;
      const companyLocation = getLocation(
        profileInfo,
        rocketReachCompanyDetails
      );
      const companyLocationQuery = companyLocation
        ? `, 
        located in ${companyLocation}.`
        : '';
      const stockSymbol = rocketReachCompanyDetails?.ticker
        ? `, Stock Symbol: '${rocketReachCompanyDetails?.ticker}'`
        : '';

      const companyIndustry = rocketReachCompanyDetails?.industry;
      const companyIndustryQuery = companyIndustry
        ? `Company Industry Category: '${companyIndustry}'`
        : '';

      const promptQuery = `Write a pre-call plan for: '${companyName}' ${stockSymbol} ${companyLocationQuery}
        Use current year: '${new Date().getFullYear()}', latest news and company website at '${companyWebsite}'. Include source or domain for the information gathered.
        ${companyDescriptionQuery}
        ${companyIndustryQuery}
        Breakdown pre-call plan:
            1. Summary of the company including revenue. Title "Company Overview:".
            2. What unique service or solution does the company provide, who are their notable competitors. Title "Service and Competition:".
            3. What are the company's core vision and values? Title "Vision and Values:".
            4. List latest news in current year from company including company website '${companyWebsite}' and other news sources. Title "Latest News from Company:".
            5. Summary of the industry including new trends and pain points. Title "Industry Trends:". 
            6. Title should be bolded and add break line right after each title heading.`;
      callAI(promptQuery);
    } catch (e) {
      console.log(e);
    }
  };

  const callAI = async (promptText) => {
    setLoader(true);
    setContent('');
    scrollToTop();
    try {
      // call Anthropic AI
      const response = await AnthropicService.createCompletion({
        prompt: promptText,
        max_tokens_to_sample: 1500,
      });
      setContent(response.completion);
      setReferences([]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(content);
    setSuccessMessage('Text copied!');
  };

  useEffect(() => {
    getCompanyRRInfo();
  }, []);
  return (
    <>
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
          time={8000}
        />
      </AlertWrapper>
      <div className="rpt-bg-light-gray">
        <p className="text-center mb-0 py-2">{profileInfo.name}</p>
      </div>
      <div className="p-3">
        <Card className="mt-2 rpt-bg-light-gray position-relative">
          <div className="text-right position-absolute top-0 right-0 m-1">
            {content && !loader && !noDataFound && (
              <IdfTooltip text="Copy">
                <ButtonIcon
                  color="outline-primary"
                  label=""
                  icon="content_copy"
                  onclick={handleCopyResponse}
                  classnames="btn-xs bg-white px-2 shadow-lg"
                />
              </IdfTooltip>
            )}
          </div>
          <CardBody className="pt-5 text-left">
            {loader ? (
              <>
                <FunnyLoaderBlinker />
                <Skeleton height={10} width={150} />
                <Skeleton count={3} height={10} className={'my-2'} />
                <br />
                <Skeleton height={10} width={150} />
                <Skeleton count={3} height={10} className={'my-2'} />
                <br />
                <Skeleton height={10} width={150} />
                <Skeleton count={3} height={10} className={'my-2'} />
              </>
            ) : (
              <>
                {content ? (
                  <>
                    <TypeWriter text={content} speed={30} />
                    {references.length > 0 && (
                      <AIReferences list={references} />
                    )}
                  </>
                ) : (
                  <>
                    {noDataFound ? (
                      <NoDataFound
                        icon="auto_awesome"
                        iconStyle="font-size-3em"
                        title={
                          <div className="font-normal text-center font-size-sm2">
                            {noDataFound}
                          </div>
                        }
                        containerStyle="text-gray-search my-2 py-2"
                      />
                    ) : (
                      <p className="text-muted font-size-sm2 text-left">
                        Your AI generated content will be shown here
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default PreCallPlan;
