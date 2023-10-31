import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import routes from '../../../utils/routes.json';
import { formatPhoneNumber } from '../../../utils/Utils';

const margin = 5;

const ItemBasic = ({ value = '', name, contactType = '', valueColor, id }) => {
  const right = (
    <span
      className={`font-weight-medium ml-auto ${
        valueColor ? 'badge badge-secondary font-12' : ''
      }`}
      style={{ background: valueColor }}
    >
      {name.includes('Phone') ? formatPhoneNumber(value) : value}
    </span>
  );
  const rightExt = (
    <span className="font-weight-medium ml-auto">{contactType}</span>
  );
  return (
    <li className="list-group-item">
      <Row>
        <Col md={margin}>
          {<span className="text-muted font-weight-medium">{name}</span>}
        </Col>
        <Col className="text-right">
          {name?.includes('Email') ? (
            <a
              href={`mailto:${value}`}
              target="_blank"
              className="d-inline-block"
              style={{ maxWidth: 210 }}
              rel="noopener noreferrer"
            >
              {right}
            </a>
          ) : name === 'Company' ? (
            <Link to={`${routes.companies}/${id}/organization/profile`}>
              {right}
            </Link>
          ) : (
            right
          )}
          {rightExt}
        </Col>
      </Row>
    </li>
  );
};

const OverviewCard = ({ fieldData, overviewData = [] }) => {
  return (
    <div className="card-body p-3">
      <ul className="list-group list-group-flush list-group-no-gutters">
        {fieldData?.map((item) => {
          return (
            <>
              {overviewData?.[item?.columnName] ? (
                <ItemBasic
                  value={
                    item?.columnName === 'label_id'
                      ? overviewData?.label?.name
                      : item?.columnName === 'organization_id'
                      ? overviewData?.organization?.name
                      : overviewData?.[item?.columnName] || ''
                  }
                  valueColor={
                    item?.columnName === 'label_id'
                      ? overviewData?.label?.color
                      : ''
                  }
                  id={overviewData?.organization?.id}
                  key={item?.key}
                  name={item?.key}
                />
              ) : (
                ''
              )}
            </>
          );
        })}
      </ul>
    </div>
  );
};

export default OverviewCard;
