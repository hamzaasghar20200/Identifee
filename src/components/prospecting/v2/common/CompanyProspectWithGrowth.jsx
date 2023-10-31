import { Card, Image } from 'react-bootstrap';
import { CardBody, Col, Row } from 'reactstrap';
import MaterialIcon from '../../../commons/MaterialIcon';
import React, { useState } from 'react';
import {
  addressify,
  formatUSPhoneNumber,
  numbersWithComma,
  roundNumbers,
} from '../../../../utils/Utils';

const CommaList = ({ list, count = 10 }) => {
  const [expand, setExpand] = useState(false);
  const [showCount, setShowCount] = useState(count);
  const excludedNulls = list?.filter((l) => l !== 'null') || [];
  return (
    <div className="d-flex align-items-center flex-wrap">
      {excludedNulls.slice(0, showCount).map((item, index) => (
        <span key={index}>
          {item}
          {index < excludedNulls.length - 1 ? <span>,</span> : ''}&nbsp;
        </span>
      ))}
      {excludedNulls.length > 9 && !expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(excludedNulls.length);
            setExpand(true);
          }}
        >
          (View more)
        </a>
      )}
      {excludedNulls.length > 9 && expand && (
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setShowCount(count);
            setExpand(false);
          }}
        >
          (Show fewer)
        </a>
      )}
    </div>
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
      <Col md={2} style={{ width: 125 }}>
        {icon}
      </Col>
      <Col md={10}>{details}</Col>
    </div>
  );
};

const CompanyProspectWithGrowth = ({ company, search }) => {
  return (
    <Card className="border-0 p-0 shadow-none bg-transparent">
      <CardBody className="p-2">
        <h5>{company?.name} Key Information</h5>
        <Row>
          <Col md={12}>
            {company ? (
              <>
                {company.domain && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="language" />
                        }
                        label="Website"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        <a
                          href={`https://${company.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {company.domain}
                        </a>
                      </p>
                    }
                  />
                )}
                {company?.ticker && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon
                            clazz="font-size-md"
                            icon="area_chart"
                          />
                        }
                        label="Ticker"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">{company?.ticker?.trim()}</p>
                    }
                  />
                )}
                {company.revenue && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon
                            clazz="font-size-md"
                            icon="monetization_on"
                          />
                        }
                        label="Revenue"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        ${roundNumbers(company.revenue, 'long', 2)}
                      </p>
                    }
                  />
                )}
                {company.employees && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="people" />
                        }
                        label="Employees"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        {numbersWithComma(company.employees)}
                      </p>
                    }
                  />
                )}
                {(company.founded || company.year_founded) && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon
                            clazz="font-size-md"
                            icon="photo_album"
                          />
                        }
                        label="Founded"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        {company.founded || company.year_founded}
                      </p>
                    }
                  />
                )}
                <IconDetails
                  icon={
                    <ItemWithIcon
                      isCustomIcon={
                        <MaterialIcon clazz="font-size-md" icon="location_on" />
                      }
                      label="Address"
                    />
                  }
                  details={
                    <p className="mb-0 fs-9">
                      {addressify(company, 'company')}
                    </p>
                  }
                />
                {company.phone && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="phone" />
                        }
                        label="Phone"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        {formatUSPhoneNumber(company.phone || '')}
                      </p>
                    }
                  />
                )}
                {company?.industries?.length > 0 ? (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="category" />
                        }
                        label="Category"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        <CommaList list={company.industries} />{' '}
                      </p>
                    }
                  />
                ) : (
                  <></>
                )}
                {company?.competitors?.length > 0 ? (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="equalizer" />
                        }
                        label="Competitors"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        <CommaList list={company?.competitors || []} />{' '}
                      </p>
                    }
                  />
                ) : (
                  <></>
                )}

                {company.sic && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon
                            clazz="font-size-md"
                            icon="merge_type"
                          />
                        }
                        label="SIC"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">{company.sic || 'N/A'}</p>
                    }
                  />
                )}
                {company.naics && (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="numbers" />
                        }
                        label="NAICS"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">{company.naics || 'N/A'}</p>
                    }
                  />
                )}
                {company.techStack?.length > 0 ? (
                  <IconDetails
                    icon={
                      <ItemWithIcon
                        isCustomIcon={
                          <MaterialIcon clazz="font-size-md" icon="apps" />
                        }
                        label="Technologies"
                      />
                    }
                    details={
                      <p className="mb-0 fs-9">
                        <CommaList list={company?.techStack || []} />{' '}
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
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default CompanyProspectWithGrowth;
