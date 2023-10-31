import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Badge } from 'reactstrap';

import {
  addressify,
  isToFixedNoRound,
  numbersWithComma,
} from '../../../utils/Utils';
import stringConstants from '../../../utils/stringConstants.json';
import { renderValueField } from '../../peoples/constantsPeople';
import routes from '../../../utils/routes.json';
import { Link } from 'react-router-dom';

const constants = stringConstants.deals.contacts.profile;
const defaultMargin = 5;
const OrgCardRow = ({ left, right, margin = defaultMargin }) => {
  return (
    <Row>
      <Col md={margin}>{left}</Col>
      <Col className="text-right">{right}</Col>
    </Row>
  );
};

const items = {
  phone_office: constants.phoneLabel,
  annual_revenue: constants.totalRevenue,
  employees: constants.employeesLabel,
  website: constants.websiteLabel,
  naics_code: constants.naicsCodeLabel,
  industry: constants.industryLabel,
};

const ItemList = ({ value = '', name }) => {
  if (name === 'annual_revenue') value = isToFixedNoRound(value, 2);
  if (name === 'employees') value = numbersWithComma(value);

  const left = (
    <span className="text-muted font-weight-medium mr-2">{items[name]}</span>
  );
  const right = <span className="font-weight-medium ml-auto">{value}</span>;
  return (
    <li className="list-group-item">
      <OrgCardRow
        left={left}
        right={
          name === 'website' ? (
            <a
              href={value.includes('http') ? value : 'https://' + value}
              target="_blank"
              rel="noopener noreferrer"
            >
              {right}
            </a>
          ) : (
            right
          )
        }
        margin={defaultMargin}
      />
    </li>
  );
};

const nameDetails = (data) => {
  return (
    <>
      <li className="list-group-item">
        <OrgCardRow
          left={
            <span className="text-muted text-capitalize">
              {constants.nameLabel}
            </span>
          }
          right={
            <Link to={`${routes.companies}/${data.id}/organization/profile`}>
              <span className="font-weight-medium"> {data.name} </span>
            </Link>
          }
          margin={defaultMargin}
        />
      </li>
      <li className="list-group-item">
        <OrgCardRow
          left={<span className="text-muted">{constants.statusLabel}</span>}
          right={
            <span className="font-weight-medium">
              <Badge
                id={data?.label?.id}
                style={{
                  fontSize: '12px',
                  backgroundColor: `${data?.label?.color}`,
                }}
                className="text-uppercase"
              >
                {data?.label?.name}
              </Badge>
            </span>
          }
        />
      </li>
    </>
  );
};

const getEncodedURL = (data) => {
  const string =
    (data.address_street || '') +
    (data.address_city || '') +
    (data.address_state ? ', ' : '') +
    (data.address_state || '') +
    (data.address_postalcode || '') +
    (data.address_country || '');

  const encodedurl = encodeURIComponent(string);
  return encodedurl;
};

const Organization = ({ data, peopleContact = false }) => {
  return (
    <div className="card-body toggle-org py-2">
      <ul className="list-group list-group-flush list-group-no-gutters">
        {peopleContact && nameDetails(data)}
        <li className="list-group-item">
          <OrgCardRow
            left={<span className="text-muted">{constants.addressLabel}</span>}
            right={
              <span className="font-weight-medium ml-auto">
                <a
                  target={'_blank'}
                  rel="noreferrer"
                  className="d-inline-flex flex-wrap"
                  style={{ gap: 2 }}
                  href={`https://www.google.com/maps/search/?api=1&query=${getEncodedURL(
                    data
                  )}`}
                >
                  {addressify(data)}
                </a>
              </span>
            }
          />
        </li>

        {Object.keys(items).map((key) => {
          return <ItemList value={data?.[key] || ''} key={key} name={key} />;
        })}

        {data?.fields &&
          data?.fields?.map((item) => {
            const { id, field, value } = item;
            return (
              <li key={id} className="list-group-item">
                <OrgCardRow
                  left={
                    <span className="text-muted font-weight-medium text-capitalize">
                      {field.key}
                    </span>
                  }
                  right={
                    <span className="font-weight-medium ml-auto">
                      {renderValueField(field.field_type, value)}
                    </span>
                  }
                />
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default Organization;
