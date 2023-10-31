import { Card, Image } from 'react-bootstrap';
import { CardBody, Col } from 'reactstrap';
import MaterialIcon from '../../../commons/MaterialIcon';
import ProfilePicOrFallbackAvatar from '../../../commons/ProfilePicOrFallbackAvatar';
import ButtonIcon from '../../../commons/ButtonIcon';
import routes from '../../../../utils/routes.json';
import { ProspectTypes } from '../constants';
import React, { useState } from 'react';
import _ from 'lodash';
import RocketReachLocation from './RocketReachLocation';
import { useHistory } from 'react-router-dom';
import NoDataFound from '../../../commons/NoDataFound';

const Skills = ({ skills }) => {
  return (
    <div className="d-flex align-items-center flex-wrap">
      {skills.map((skill, index) => (
        <span key={index}>
          {skill}
          {index < skills.length - 1 ? <span>,</span> : ''}&nbsp;
        </span>
      ))}
    </div>
  );
};

const Education = ({ education }) => {
  const [expand, setExpand] = useState(false);
  const [showCount, setShowCount] = useState(1);
  const degrees = education; // ?.filter((edu) => !!edu.degree);
  return (
    <>
      {degrees.slice(0, showCount).map((edu, index) => (
        <div key={index}>
          {edu.start && edu.end ? (
            <>
              {edu.start} - {edu.end} {edu.degree} @ {edu.school}
            </>
          ) : (
            <>
              {edu.degree && <span>{edu.degree} @ </span>} {edu.school}
            </>
          )}{' '}
        </div>
      ))}
      {degrees.length > 1 && !expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(degrees.length);
            setExpand(true);
          }}
        >
          See More
        </a>
      )}
      {degrees.length > 1 && expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(1);
            setExpand(false);
          }}
        >
          See Less
        </a>
      )}
    </>
  );
};

const JobHistory = ({ jobs }) => {
  const [expand, setExpand] = useState(false);
  const [showCount, setShowCount] = useState(1);
  const currentJob = jobs.find((j) => j.is_current);
  const groupedByCompany = _.groupBy(
    jobs.filter((j) => !j.is_current),
    'company'
  );
  return (
    <>
      <div>
        {currentJob?.title} @ {currentJob?.company}
      </div>

      {expand &&
        Object.entries(groupedByCompany)
          .slice(0, showCount)
          .map((job) => (
            <div key={job[0]}>
              <>
                {job[1][0].title} @ {job[1][0].company}
              </>
            </div>
          ))}

      {jobs.length > 1 && !expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(jobs.length);
            setExpand(true);
          }}
        >
          See More
        </a>
      )}
      {jobs.length > 1 && expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(1);
            setExpand(false);
          }}
        >
          See Less
        </a>
      )}
    </>
  );
};

const ItemWithIcon = ({ label, icon, isCustomIcon }) => {
  return (
    <p className="m-0 p-0 lead fs-9 d-flex gap-1 align-items-center font-weight-semi-bold py-1">
      {isCustomIcon || <Image src={icon} />}
      <span>{label}</span>
    </p>
  );
};

const IconDetails = ({ icon, details }) => {
  return (
    <div className="row my-1">
      <Col md={2} style={{ width: 110 }}>
        {icon}
      </Col>
      <Col md={10}>{details}</Col>
    </div>
  );
};

const Title = () => {
  return <h5 className="mb-0">No company details found.</h5>;
};

const PeopleProspectWithCompany = ({ person, company }) => {
  const history = useHistory();

  return (
    <Card className="border-0 p-0 shadow-none bg-transparent">
      <CardBody className="p-2">
        {person ? (
          <>
            <IconDetails
              icon={
                <ItemWithIcon
                  isCustomIcon={
                    <MaterialIcon clazz="font-size-md" icon="location_on" />
                  }
                  label="Location"
                />
              }
              details={
                <p className="mb-0 fs-9">
                  <RocketReachLocation prospect={person} />
                </p>
              }
            />
            {person?.job_history && person?.job_history.length ? (
              <IconDetails
                icon={
                  <ItemWithIcon
                    isCustomIcon={
                      <MaterialIcon
                        clazz="font-size-md"
                        icon="business_center"
                      />
                    }
                    label="Work"
                  />
                }
                details={
                  <p className="mb-0 fs-9">
                    <JobHistory jobs={person?.job_history} />
                  </p>
                }
              />
            ) : (
              <></>
            )}
            {person?.education && person?.education.length ? (
              <IconDetails
                icon={
                  <ItemWithIcon
                    isCustomIcon={
                      <MaterialIcon clazz="font-size-md" icon="school" />
                    }
                    label="Education"
                  />
                }
                details={
                  <p className="mb-0 fs-9">
                    <Education education={person?.education} />
                  </p>
                }
              />
            ) : (
              <></>
            )}
            {person?.skills && person?.skills.length ? (
              <IconDetails
                icon={
                  <ItemWithIcon
                    isCustomIcon={
                      <MaterialIcon clazz="font-size-md" icon="book" />
                    }
                    label="Skills"
                  />
                }
                details={
                  <p className="mb-0 fs-9">
                    <Skills skills={person?.skills} />
                  </p>
                }
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
        <>
          {company?.id ? (
            <Card className="mt-2">
              <CardBody>
                <div className="d-flex align-items-center gap-2 justify-content-between">
                  <div className="flex-fill d-flex align-items-center gap-2">
                    <ProfilePicOrFallbackAvatar
                      prospect={company}
                      style={{ width: 48, height: 48 }}
                    />
                    <p className="prospect-typography-h4 mb-0 p-0 text-wrap font-weight-semi-bold">
                      {company.name}
                    </p>
                  </div>
                  <ButtonIcon
                    icon=""
                    label="View Company Page"
                    color="outline-primary"
                    classnames="btn-sm"
                    onclick={() => {
                      history.push(
                        `${routes.resourcesOrganization.replace(
                          ':name',
                          company?.name
                        )}?tab=${
                          ProspectTypes.company
                        }&swot=false&ticker=${company.ticker?.trim()}&id=${
                          company.id
                        }`
                      );
                    }}
                  />
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="mt-2">
              <CardBody className="text-center">
                <NoDataFound
                  title={<Title />}
                  icon="search"
                  iconStyle="font-size-2em"
                  containerStyle="w-100 text-gray-900 py-2 my-0"
                />
              </CardBody>
            </Card>
          )}
        </>
      </CardBody>
    </Card>
  );
};

export default PeopleProspectWithCompany;
