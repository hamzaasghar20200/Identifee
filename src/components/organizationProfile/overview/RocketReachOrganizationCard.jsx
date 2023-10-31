import { Image } from 'react-bootstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import locationCircle from '../../../assets/svg/location-circle.svg';
import phoneCircle from '../../../assets/svg/phone-circle.svg';
import sicCircle from '../../../assets/svg/sic-circle.svg';
import naicsCircle from '../../../assets/svg/naics-circle.svg';
import revenueCircle from '../../../assets/svg/revenue-circle.svg';
import foundedCircle from '../../../assets/svg/founded-circle.svg';
import webCircle from '../../../assets/svg/web-circle.svg';
import textCircle from '../../../assets/svg/text-circle.svg';
import faxCircle from '../../../assets/svg/fax-circle.svg';
import {
  addressify,
  numbersWithComma,
  roundNumbers,
} from '../../../utils/Utils';
import ProfilePicOrFallbackAvatar from '../../commons/ProfilePicOrFallbackAvatar';
import ViewMoreLess from '../../commons/ViewMoreLess';
import React from 'react';

const pretty = (value) => {
  if (!value) {
    return 'N/A';
  }

  return value;
};

const LookupOrganizationItem = ({
  label,
  text,
  icon,
  isLink,
  isMaterialIcon = false,
}) => {
  return (
    <>
      {text !== 'N/A' && (
        <p className="m-0 p-0 lead fs-7 d-flex align-items-center py-1">
          {isMaterialIcon ? (
            <MaterialIcon
              icon={icon}
              clazz="p-1 bg-gray-300 rounded-circle fs-7 mr-1 text-black"
            />
          ) : (
            <Image src={icon} className="mr-1" />
          )}
          <span>
            <span className="font-weight-semi-bold mr-1">{label}:</span>
            <>
              {isLink ? (
                <a
                  href={`https://${text}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {text}
                </a>
              ) : (
                <span>{text}</span>
              )}{' '}
            </>
          </span>
        </p>
      )}
    </>
  );
};

const RocketReachOrganizationCard = ({ prospect, showDescription = true }) => {
  return (
    <>
      <div className="d-flex align-items-center">
        <div className="mr-2">
          <ProfilePicOrFallbackAvatar
            prospect={prospect}
            style={{ width: 70, height: 70 }}
          />
        </div>
        <div>
          <h4 className="prospect-typography-h4 mb-0 text-left">
            {pretty(prospect.name)}
          </h4>
        </div>
      </div>

      <div className="text-left fs-7 mt-3">
        <LookupOrganizationItem
          label="Website"
          text={pretty(prospect.domain)}
          icon={webCircle}
          isLink={true}
        />
        {prospect.ticker && (
          <LookupOrganizationItem
            label="Ticker"
            text={prospect.ticker}
            icon="area_chart"
            isMaterialIcon={true}
          />
        )}
        {prospect.revenue && (
          <LookupOrganizationItem
            label="Revenue"
            text={`$${pretty(roundNumbers(prospect.revenue, 'long', 2))}`}
            icon={revenueCircle}
          />
        )}
        <p className="m-0 p-0 lead fs-7 py-1">
          <MaterialIcon
            icon="people"
            clazz="p-1 bg-gray-300 rounded-circle fs-7 text-black"
          />
          <span>
            {' '}
            <span className="font-weight-semi-bold">Employees:</span>{' '}
            {numbersWithComma(prospect.employees)}
          </span>
        </p>

        <LookupOrganizationItem
          label="Founded"
          text={pretty(prospect.founded || prospect.year_founded)}
          icon={foundedCircle}
        />

        <p className="m-0 p-0 lead fs-7 py-1">
          <Image src={locationCircle} className="mr-1" />
          <span className="font-weight-semi-bold">Address: </span>
          <span>{addressify(prospect, 'company')}</span>
        </p>

        <LookupOrganizationItem
          label="Phone"
          text={pretty(prospect.phone)}
          icon={phoneCircle}
        />
        <LookupOrganizationItem
          label="Fax"
          text={pretty(prospect.fax)}
          icon={faxCircle}
        />
        <LookupOrganizationItem
          label="SIC"
          text={pretty(prospect.sic)}
          icon={sicCircle}
        />
        <LookupOrganizationItem
          label="NAICS"
          text={pretty(prospect.naics)}
          icon={naicsCircle}
        />
        {showDescription && prospect?.description && (
          <div className="m-0 p-0 py-1">
            <Image src={textCircle} className="mr-1" />
            <span>
              <span className="font-weight-semi-bold">Description:</span>{' '}
              <ViewMoreLess text={prospect?.description} limit={150} />
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default RocketReachOrganizationCard;
