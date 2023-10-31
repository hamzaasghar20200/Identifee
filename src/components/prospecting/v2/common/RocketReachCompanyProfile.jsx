import React, { useEffect, useState } from 'react';
import prospectService from '../../../../services/prospect.service';
import { ProspectTypes } from '../constants';
import { CardBody, Col, PopoverBody, Row, Spinner } from 'reactstrap';
import NoDataFound from '../../../commons/NoDataFound';
import ProfilePicOrFallbackAvatar from '../../../commons/ProfilePicOrFallbackAvatar';
import {
  addressify,
  numbersWithComma,
  roundNumbers,
} from '../../../../utils/Utils';
import IconText from '../../../loaders/IconText';
import { Card, OverlayTrigger, Popover } from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import PeopleProspectWithCompany from './PeopleProspectWithCompany';
import { Link } from 'react-router-dom';
import routes from '../../../../utils/routes.json';
import CompanyProspectWithGrowth from './CompanyProspectWithGrowth';

const RocketReachCompanyProfile = ({
  prospect,
  inline,
  type,
  searchEmployees,
}) => {
  // load company details when hover on, so...
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState({});
  const [person, setPerson] = useState({});
  const [isOpened, setIsOpened] = useState(false);
  const [noDataFound, setNoDataFound] = useState(false);

  const loadPersonDetailsById = async () => {
    setIsLoading(true);
    try {
      const { data } = await prospectService.getContact({ id: prospect.id });
      const companyData = await prospectService.query(
        {
          name: [prospect.employer || prospect.current_employer],
          id: [data?.current_employer_id],
        },
        {
          page: 1,
          limit: 1,
          type: ProspectTypes.company,
        }
      );

      if (companyData?.data?.data?.length) {
        setCompany(companyData?.data?.data[0]);
      } else {
        setCompany({});
        setNoDataFound(true);
      }
      setPerson(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanyDetailsById = async () => {
    setIsLoading(true);
    try {
      setCompany(prospect);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const { data } = await prospectService.query(
        { name: [prospect.employer || prospect.current_employer] },
        {
          page: 1,
          limit: 1,
          type: ProspectTypes.company,
        }
      );

      if (data?.data?.length) {
        setCompany(data?.data[0]);
      } else {
        setCompany({});
        setNoDataFound(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataByType = async () => {
    if (type === ProspectTypes.people) {
      loadPersonDetailsById();
    } else if (type === ProspectTypes.company) {
      loadCompanyDetailsById();
    } else {
      loadCompany();
    }
  };

  useEffect(() => {
    isOpened && loadDataByType();
  }, [isOpened]);

  useEffect(() => {
    prospect?.isExpanded && loadDataByType();
  }, [prospect?.isExpanded]);

  const OrgItemRow = ({ children }) => {
    return <Row className="my-1">{children}</Row>;
  };

  const Title = () => {
    return <h5 className="mb-0">No details found.</h5>;
  };

  const CompanyDetails = () => {
    return (
      <>
        {noDataFound ? (
          <NoDataFound
            title={<Title />}
            icon="search"
            iconStyle="font-size-2em"
            containerStyle="w-100 text-gray-900 py-2 my-0"
          />
        ) : (
          <>
            <Row className="mb-2">
              <Col>
                <div className="d-flex align-items-center gap-1">
                  <ProfilePicOrFallbackAvatar
                    prospect={company}
                    style={{ width: 40, height: 40 }}
                  />
                  <h5>{prospect.employer || prospect.current_employer}</h5>
                </div>
              </Col>
            </Row>
            {company.domain && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Website</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8">{company.domain}</p>
                </Col>
              </OrgItemRow>
            )}
            {company.ticker && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Ticker</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8">{company.ticker}</p>
                </Col>
              </OrgItemRow>
            )}
            {company.revenue && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Revenue</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8">
                    ${roundNumbers(company.revenue, 'long', 2)}
                  </p>
                </Col>
              </OrgItemRow>
            )}
            {company.employees && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Employees</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">
                    {numbersWithComma(company.employees)}
                  </p>
                </Col>
              </OrgItemRow>
            )}
            {(company.founded || company.year_founded) && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Founded</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">
                    {company.founded || company.year_founded}
                  </p>
                </Col>
              </OrgItemRow>
            )}
            <OrgItemRow>
              <Col md={4}>
                <p className="mb-0 fs-8 font-weight-semi-bold">Address</p>
              </Col>
              <Col md={8}>
                <p className="mb-0 fs-8 text-capitalize">
                  {addressify(company, 'company')}
                </p>
              </Col>
            </OrgItemRow>
            {company.phone && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Phone</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">{company.phone}</p>
                </Col>
              </OrgItemRow>
            )}
            {company.fax && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Fax</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">{company.fax}</p>
                </Col>
              </OrgItemRow>
            )}
            {company.industry && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">Category</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">
                    {company.industry}
                  </p>
                </Col>
              </OrgItemRow>
            )}
            {company.sic && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">SIC</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">{company.sic}</p>
                </Col>
              </OrgItemRow>
            )}
            {company.naics && (
              <OrgItemRow>
                <Col md={4}>
                  <p className="mb-0 fs-8 font-weight-semi-bold">NAICS</p>
                </Col>
                <Col md={8}>
                  <p className="mb-0 fs-8 text-capitalize">{company.naics}</p>
                </Col>
              </OrgItemRow>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {inline ? (
        <>
          {isLoading ? (
            <>
              {type === ProspectTypes.people ? (
                <div className="p-2">
                  <IconText count={4} circleSize={{ height: 15, width: 15 }} />
                  <Card className="mt-3">
                    <CardBody>
                      <div className="d-flex align-items-center gap-3 justify-content-between">
                        <div className="flex-fill">
                          <IconText
                            count={1}
                            circleSize={{ height: 52, width: 52 }}
                          />
                        </div>
                        <Skeleton height={32} width={120} />
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ) : (
                <div className="p-2">
                  <IconText count={6} circleSize={{ height: 15, width: 15 }} />
                </div>
              )}
            </>
          ) : (
            <>
              {inline ? (
                <>
                  {type === ProspectTypes.people ? (
                    <PeopleProspectWithCompany
                      person={person}
                      company={company}
                    />
                  ) : (
                    <CompanyProspectWithGrowth
                      company={company}
                      search={searchEmployees}
                    />
                  )}
                </>
              ) : (
                <CompanyDetails />
              )}
            </>
          )}
        </>
      ) : (
        <OverlayTrigger
          trigger={['hover', 'focus']}
          show={isOpened}
          placement="bottom"
          onToggle={setIsOpened}
          overlay={
            isLoading ? (
              <Popover className="rounded">
                <PopoverBody className="py-2 px-3">
                  <Spinner className="text-primary spinner-grow-xs" />
                </PopoverBody>
              </Popover>
            ) : (
              <Popover style={{ minWidth: 300 }} className="rounded">
                <PopoverBody className={noDataFound ? 'py-2 px-0' : ''}>
                  <CompanyDetails />
                </PopoverBody>
              </Popover>
            )
          }
        >
          <Link
            to={`${routes.resourcesOrganization.replace(
              ':name',
              prospect?.employer
            )}?tab=${
              ProspectTypes.people
            }&swot=false&ticker=${prospect.ticker?.trim()}`}
            className="prospect-typography-h6 cursor-pointer hoverLink p-0 m-0"
          >
            <span className="hoverLink text-wrap">{prospect.employer}</span>
          </Link>
        </OverlayTrigger>
      )}
    </>
  );
};

export default RocketReachCompanyProfile;
