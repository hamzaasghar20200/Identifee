import { useHistory } from 'react-router';
import React, { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import MaterialIcon from '../../../components/commons/MaterialIcon';
import {
  addressify,
  numbersWithComma,
  overflowing,
  roundNumbers,
} from '../../../utils/Utils';
import ButtonIcon from '../../../components/commons/ButtonIcon';
import RocketReachSocialLinks from '../../../components/organizationProfile/overview/RocketReachSocialLinks';
import { Image } from 'react-bootstrap';
import locationCircle from '../../../assets/svg/location-circle.svg';
import phoneCircle from '../../../assets/svg/phone-circle.svg';
import sicCircle from '../../../assets/svg/sic-circle.svg';
import revenueCircle from '../../../assets/svg/revenue-circle.svg';
import foundedCircle from '../../../assets/svg/founded-circle.svg';
import webCircle from '../../../assets/svg/web-circle.svg';
import Skeleton from 'react-loading-skeleton';
import IconTextLoader from '../../../components/loaders/IconText';
import routes from '../../../utils/routes.json';
import NoDataFound from '../../../components/commons/NoDataFound';
import naicsCircle from '../../../assets/svg/naics-circle.svg';
import ProfilePicOrFallbackAvatar from '../../commons/ProfilePicOrFallbackAvatar';
import ViewMoreLess from '../../commons/ViewMoreLess';
import { ProspectTypes } from './constants';
import AnimatedTabs from '../../commons/AnimatedTabs';
import { TabsContext } from '../../../contexts/tabsContext';
import TypeWriter from '../../commons/TypeWriter';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import { AlertMessageContext } from '../../../contexts/AlertMessageContext';
import PageTitle from '../../commons/PageTitle';
import DotDot from '../../commons/DotDot';
import AnthropicService from '../../../services/anthropic.service';
const TABS = {
  CompanyInformation: 1,
  SwotAnalysis: 2,
};

const OrgItemRow = ({ children }) => {
  return <Row className="my-1">{children}</Row>;
};

const OrgItemWithIcon = ({ label, icon, isCustomIcon }) => {
  return (
    <p className="m-0 p-0 lead fs-7 d-flex align-items-center font-weight-semi-bold py-1">
      {isCustomIcon || <Image src={icon} className="mr-1" />}
      <span>{label}</span>
    </p>
  );
};

const LoaderSkeleton = () => {
  return (
    <Card className="col-lg-12">
      <CardHeader className="justify-content-center">
        <div className="d-flex align-items-center py-2">
          <span
            style={{ width: 70, height: 70 }}
            className="avatar-initials avatar-icon-font-size p-2 mr-2 rounded-circle text-primary"
          >
            <Skeleton height={70} width={70} circle />
          </span>
          <h1>
            <Skeleton height={15} width={300} />
            <br />
            <div className="d-flex align-items-center gap-2">
              <Skeleton height={30} width={30} circle className="mr-2" />
              <Skeleton height={30} width={30} circle className="mr-2" />
              <Skeleton height={30} width={30} circle />
            </div>
          </h1>
        </div>
      </CardHeader>
      <CardBody className="justify-content-center text-center">
        <Skeleton height={10} width={600} />
        <br />
        <br />
        <Skeleton height={10} width={300} />
        <br />
        <br />
        <IconTextLoader count={8} />
      </CardBody>
    </Card>
  );
};

const NoCompanyDetailsFound = ({ fromDomainMenu }) => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const tab = params.get('tab');
  const gobackToResources = () => {
    history.push(`${routes.resources}?tab=${tab}`);
  };

  const Description = () => {
    return (
      <div className="text-center">
        <p>
          We couldn&apos;t find details of the company please click below to
        </p>
        <ButtonIcon
          icon="west"
          label="Go back to resources"
          classnames="btn-sm"
          color="primary"
          onclick={gobackToResources}
        />
      </div>
    );
  };
  const Title = () => {
    return <div className="text-gray-search">No company details found.</div>;
  };

  const TitleDomain = () => {
    return <div className="text-gray-search">Let&apos;s start searching!</div>;
  };

  const DescriptionDomain = () => {
    return (
      <>
        Get started by putting a domain name or for a more refined search, use
        the <MaterialIcon icon="filter_alt" /> filters to the left!
      </>
    );
  };
  return (
    <Card className="position-relative col-lg-12">
      <CardBody>
        {fromDomainMenu ? (
          <NoDataFound
            icon="domain_disabled"
            title={<TitleDomain />}
            description={<DescriptionDomain />}
            containerStyle={'text-gray-search py-6 my-6'}
          />
        ) : (
          <NoDataFound
            icon="domain_disabled"
            title={<Title />}
            description={<Description />}
            containerStyle={'text-gray-search py-6 my-6'}
          />
        )}
      </CardBody>
    </Card>
  );
};

const CompanyInformationTab = ({
  company,
  redirectToProspectsSearch,
  socialLinks,
  switchToSwot,
}) => {
  return (
    <>
      <CardHeader tag="h1" className="justify-content-center flex-column py-4">
        <div className="d-flex align-items-center gap-1 py-2">
          <ProfilePicOrFallbackAvatar
            prospect={company}
            style={{ width: 70, height: 70 }}
          />
          <h1>
            <p className="mb-0">{company.name}</p>
            <RocketReachSocialLinks links={socialLinks} />
          </h1>
        </div>
      </CardHeader>
      <CardBody>
        <div className="justify-content-center">
          {company?.description && (
            <ViewMoreLess text={company?.description} limit={900} />
          )}
        </div>
        <div className="d-flex gap-2 justify-content-center align-items-center mt-3 py-2 mb-4">
          <ButtonIcon
            icon="search"
            label="Search Employees"
            onclick={redirectToProspectsSearch}
            className="btn btn-success font-weight-semi-bold px-6 text-white"
          />
          {company?.ticker && (
            <ButtonIcon
              icon="grid_view"
              label="SWOT Analysis"
              className="btn-outline-primary rounded font-weight-semi-bold py-2 px-6 bg-white"
              onclick={switchToSwot}
              style={{ borderWidth: '1px' }}
            />
          )}
        </div>
        {company.domain && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={webCircle} label="Website" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7">
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.domain}
                </a>
              </p>
            </Col>
          </OrgItemRow>
        )}
        {company.ticker && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon
                isCustomIcon={
                  <MaterialIcon
                    icon="area_chart"
                    clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                  />
                }
                label="Ticker"
              />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7">{company.ticker?.trim()}</p>
            </Col>
          </OrgItemRow>
        )}
        {company.revenue && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={revenueCircle} label="Revenue" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7">
                ${roundNumbers(company.revenue, 'long', 2)}
              </p>
            </Col>
          </OrgItemRow>
        )}
        {company.employees && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon
                isCustomIcon={
                  <MaterialIcon
                    icon="people"
                    clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                  />
                }
                label="Employees"
              />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">
                {numbersWithComma(company.employees)}
              </p>
            </Col>
          </OrgItemRow>
        )}
        {(company.founded || company.year_founded) && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={foundedCircle} label="Founded" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">
                {company.founded || company.year_founded}
              </p>
            </Col>
          </OrgItemRow>
        )}
        <OrgItemRow>
          <Col md={2}>
            <OrgItemWithIcon icon={locationCircle} label="Address" />
          </Col>
          <Col md={10}>
            <p className="mb-0 fs-7 text-capitalize">
              {addressify(company, 'company')}
            </p>
          </Col>
        </OrgItemRow>
        {company.phone && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={phoneCircle} label="Phone" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">{company.phone}</p>
            </Col>
          </OrgItemRow>
        )}
        {company.fax && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon
                isCustomIcon={
                  <MaterialIcon
                    icon="fax"
                    clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                  />
                }
                label="Fax"
              />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">{company.fax}</p>
            </Col>
          </OrgItemRow>
        )}
        {company.techStack?.length > 0 && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon
                isCustomIcon={
                  <MaterialIcon
                    icon="apps"
                    clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                  />
                }
                label="Technologies"
              />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7">
                <ViewMoreLess
                  text={company.techStack.join(', ')}
                  byWords={15}
                />
              </p>
            </Col>
          </OrgItemRow>
        )}
        {company.industries && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon
                isCustomIcon={
                  <MaterialIcon
                    icon="category"
                    clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
                  />
                }
                label="Category"
              />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">
                {company.industries.join(', ')}
              </p>
            </Col>
          </OrgItemRow>
        )}
        {company.sic && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={sicCircle} label="SIC" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">
                {company.sic || 'N/A'}
              </p>
            </Col>
          </OrgItemRow>
        )}
        {company.naics && (
          <OrgItemRow>
            <Col md={2}>
              <OrgItemWithIcon icon={naicsCircle} label="NAICS" />
            </Col>
            <Col md={10}>
              <p className="mb-0 fs-7 text-capitalize">
                {company.naics || 'N/A'}
              </p>
            </Col>
          </OrgItemRow>
        )}
      </CardBody>
    </>
  );
};

const SkeletonBullets = ({ header, child, plus = 0 }) => {
  return (
    <>
      <Skeleton height={10} width={header} className="my-2 mt-4" />
      {child.map((c, index) => (
        <Skeleton
          key={index}
          height={10}
          width={c + plus}
          className={'mb-2 d-block'}
        />
      ))}
    </>
  );
};
const SwotAnalysis = ({ company }) => {
  const [regenerate, setRegenerate] = useState(0);
  const [loader, setLoader] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const ticker = params.get('ticker');
  const name = params.get('name');
  const { successMessage, setSuccessMessage, errorMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const getSWOTAnalysis = async () => {
    setLoader(true);
    try {
      const queryAI = `Write a SWOT analysis for company name: "${
        name || company.name
      }" and stock symbol: "${
        ticker || company.ticker.trim()
      }", include a company overview summary and TOWS Matrix. Make the headings bold.`;
      // call Anthropic AI
      const response = await AnthropicService.createCompletion({
        prompt: queryAI,
        max_tokens_to_sample: 4097,
      });
      setAnalysis(response.completion);
    } catch (err) {
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    if (regenerate > 0) {
      setAnalysis('');
      getSWOTAnalysis();
      setRegenerate(0);
    }
  }, [regenerate]);
  useEffect(() => {
    if (name || company?.name) {
      getSWOTAnalysis();
    }
  }, [company]);

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(analysis);
    setSuccessMessage('Text copied!');
  };

  return (
    <>
      <AlertWrapper>
        <Alert message={successMessage} setMessage={setSuccessMessage} />
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
          time={8000}
        />
      </AlertWrapper>
      <div className="p-3">
        {loader && (
          <div className="pt-2">
            <p>
              We are gathering information, please wait
              <DotDot />
            </p>
            <Skeleton height={10} width={200} className="mb-4" />
            <Skeleton count={3} height={10} className={'mb-2'} />
            <SkeletonBullets header={150} child={[300, 300, 300]} />
            <SkeletonBullets header={150} child={[300, 300, 300]} />
            <SkeletonBullets header={150} child={[300, 300, 300]} />
            <SkeletonBullets
              header={200}
              child={[300, 300, 300, 300]}
              plus={40}
            />
            <SkeletonBullets header={300} child={[440, 460, 480, 500]} />
          </div>
        )}
        {analysis && !loader && (
          <div
            className="d-flex align-items-center position-absolute gap-2 justify-content-end"
            style={{ top: 1, right: 9 }}
          >
            <ButtonIcon
              onclick={() => setRegenerate((prevState) => prevState + 1)}
              icon={'refresh'}
              label="Regenerate Response"
              color="primary"
              classnames="my-2 btn-sm"
            />
            <ButtonIcon
              onclick={handleCopyResponse}
              icon={'copy'}
              label="Copy"
              color="outline-primary"
              classnames="my-2 btn-sm"
            />
          </div>
        )}
        {analysis && <TypeWriter text={analysis} speed={30} />}
      </div>
    </>
  );
};

const RRCompanyDetails = ({ company, socialLinks, loader, allowBack }) => {
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const tab = params.get('tab');
  const swot = params.get('swot');
  const gobackToResources = () => {
    history.push(`${routes.resources}?tab=${tab}`);
  };

  const redirectToProspectsSearch = () => {
    overflowing();
    history.push(
      `${routes.resources}?id=${company.id}&current_employer=${company.name}&tab=${ProspectTypes.people}`
    );
  };

  let tabsData = [
    {
      title: 'Company Information',
      component: (
        <CompanyInformationTab
          company={company}
          socialLinks={socialLinks}
          redirectToProspectsSearch={redirectToProspectsSearch}
          switchToSwot={() => toggle(TABS.SwotAnalysis)}
        />
      ),
      tabId: TABS.CompanyInformation,
    },
  ];

  if (company?.ticker || swot === 'true') {
    tabsData = [
      ...tabsData,
      {
        title: 'SWOT Analysis',
        component: <SwotAnalysis company={company} />,
        tabId: TABS.SwotAnalysis,
      },
    ];
  }
  const [activeTabId, setActiveTabId] = useState(
    swot === 'true' ? TABS.SwotAnalysis : TABS.CompanyInformation
  );
  const { setActivatedTab } = useContext(TabsContext);

  const toggle = (tabId) => {
    if (activeTabId !== tabId) {
      setActiveTabId(tabId);

      setActivatedTab({
        [location.pathname]: tabId,
      });
    }
  };
  return (
    <>
      <PageTitle page={tabsData.find((t) => t.tabId === activeTabId)?.title} />
      <div className="row justify-content-center">
        <div className="col-md-12">
          {loader ? (
            <LoaderSkeleton />
          ) : (
            <>
              {company?.name || swot === 'true' ? (
                <Card className="position-relative">
                  <div className="border-bottom w-100 pt-2">
                    <div className="d-flex align-items-center gap-2">
                      <ButtonIcon
                        icon="west"
                        label="Back"
                        classnames="btn-sm text-nowrap mx-2 mb-2"
                        color="white"
                        onclick={gobackToResources}
                      />
                      <AnimatedTabs
                        tabsData={tabsData}
                        activeTab={activeTabId}
                        toggle={(tab) => toggle(tab.tabId)}
                        tabClasses="link-active-wrapper w-100 nav-sm-down-break"
                      />
                    </div>
                  </div>
                  <TabContent>
                    <TabPane className="mt-1">
                      {
                        tabsData.find((item) => item.tabId === activeTabId)
                          ?.component
                      }
                    </TabPane>
                  </TabContent>
                </Card>
              ) : (
                <NoCompanyDetailsFound fromDomainMenu={!allowBack} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RRCompanyDetails;
