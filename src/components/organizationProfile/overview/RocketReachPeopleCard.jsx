import React from 'react';
import RocketReachViewInfoCard from './RocketReachViewInfoCard';
import { Link } from 'react-router-dom';
import routes from '../../../utils/routes.json';
import RocketReachSocialLinks from './RocketReachSocialLinks';
import ProfilePicOrFallbackAvatar from '../../commons/ProfilePicOrFallbackAvatar';
import ProfileIcon from '../../commons/ProfileIcon';
import { getKeysWithData } from '../../../utils/Utils';
import { useFilterProspectContext } from '../../../contexts/filterProspectContext';
import MaterialIcon from '../../commons/MaterialIcon';
import { ProspectTypes } from '../../prospecting/v2/constants';

// withCompany: will show company if true
// withLocation: will show location if true
// Same component is being used from right prospect lookup under org/people profile and Find prospects table
const RocketReachPeopleCard = ({
  prospect,
  showSocialLinks = true,
  withCompany = true,
  withLocation = true,
  withContactInfo = false,
  avatarStyle = { width: 80, height: 80 },
  isCompanyProfile = false,
  containerStyle,
  chargeFilter = () => {},
  refreshView = () => {},
  setInfoLoading = () => {},
}) => {
  const { globalFiltersCompany, setGlobalFiltersCompany } =
    useFilterProspectContext();
  const Logo = () => {
    return (
      <>
        {prospect.profile_pic || prospect.logo_url ? (
          <ProfilePicOrFallbackAvatar prospect={prospect} style={avatarStyle} />
        ) : (
          <ProfileIcon
            prospect={prospect}
            defaultSize={avatarStyle.width === 80 ? 'xl' : 'lg'}
            sizeIcon={avatarStyle.width === 80 ? 'fs-2' : 'fs-1'}
          />
        )}
      </>
    );
  };

  return (
    <div className={`d-flex ${containerStyle}`}>
      <div className="mr-3">
        {isCompanyProfile ? (
          <Link
            to={`${routes.resourcesOrganization.replace(
              ':name',
              prospect?.full_name
            )}?tab=${
              ProspectTypes.company
            }&swot=false&ticker=${prospect.ticker?.trim()}&id=${prospect.id}`}
          >
            <Logo />
          </Link>
        ) : (
          <Logo />
        )}
      </div>
      <div className="text-left d-flex flex-column justify-content-center flex-grow-1">
        <p className="prospect-typography-h4 p-0 mb-0 text-wrap mw-fix-200 font-weight-semi-bold">
          {isCompanyProfile ? (
            <>
              <Link
                to={`${routes.resourcesOrganization.replace(
                  ':name',
                  prospect?.full_name
                )}?tab=${
                  ProspectTypes.company
                }&swot=false&ticker=${prospect.ticker?.trim()}&id=${
                  prospect.id
                }`}
              >
                <a className="prospect-typography-h6 text-black">
                  {prospect.full_name}
                </a>
              </Link>
              {(prospect.ticker || prospect.founded) && (
                <div className="d-flex align-items-center gap-1">
                  {prospect.ticker && (
                    <span className="font-weight-semi-bold d-flex align-items-center text-black-50 font-size-xs">
                      <MaterialIcon icon="area_chart" />
                      <span>{prospect.ticker?.trim()}</span>
                    </span>
                  )}
                  {prospect.founded && (
                    <span className="font-weight-medium d-flex align-items-center text-black-50 font-size-xs">
                      <MaterialIcon icon="flag" filled clazz="font-size-md" />
                      <span>{prospect.founded}</span>
                    </span>
                  )}
                </div>
              )}
              <a
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                href={`https://${prospect.domain}`}
                className="d-block text-hover-blue"
              >
                <span className="font-weight-normal text-black text-hover-blue font-size-sm2">
                  {prospect.domain}
                </span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="d-block text-hover-blue"
                onClick={(e) => {
                  e.preventDefault();
                  const industryFilter = {
                    ...globalFiltersCompany,
                    industry: { industry: [prospect.industry] },
                  };
                  setGlobalFiltersCompany(industryFilter);
                  chargeFilter(getKeysWithData(industryFilter));
                  refreshView((prevState) => prevState + 1);
                }}
              >
                <span className="font-weight-normal text-black text-hover-blue font-size-sm2">
                  {prospect.industry}
                </span>
              </a>
            </>
          ) : (
            prospect.full_name
          )}
        </p>
        {prospect.title && prospect.title !== 'None' && (
          <p
            style={{ maxWidth: 200 }}
            className="prospect-typography-h6 p-0 mb-1 fs-7 text-wrap text-truncate text-gray-900"
          >
            {prospect.title}
          </p>
        )}
        {withLocation && prospect.location ? (
          <p className="prospect-typography-h6 p-0 mb-1">
            <span className="material-icons-outlined bg-gray-300 p-1 rounded-circle fs-7 text-black mr-1">
              location_on
            </span>
            <>
              {prospect.location ? (
                <span className="fs-7">{prospect.location}</span>
              ) : (
                <span className="fs-7">
                  {prospect.city && <span>{prospect.city}</span>}
                  {prospect.state && <span>, {prospect.state}</span>}{' '}
                </span>
              )}
            </>
          </p>
        ) : (
          ''
        )}
        {withCompany &&
        prospect.employer &&
        prospect.employer !== 'None' &&
        prospect.employer.toLowerCase() !== 'undefined' ? (
          <p className="prospect-typography-h6 p-0 m-0 text-wrap">
            <span className="material-icons-outlined mr-1 p-1 bg-gray-300 rounded-circle fs-7 text-black">
              corporate_fare
            </span>
            <span className="fs-7 text-gray-900">{prospect.employer}</span>
          </p>
        ) : (
          ''
        )}
        {showSocialLinks && (
          <RocketReachSocialLinks
            links={{
              linkedin: prospect?.linkedin_url,
              twitter: prospect?.twitter_url,
              facebook: prospect?.facebook_url,
              crunchbase: prospect?.links?.crunchbase,
            }}
          />
        )}
        {withContactInfo && (
          <RocketReachViewInfoCard
            prospect={prospect}
            layout="row"
            load={withContactInfo}
            setInfoLoading={setInfoLoading}
          />
        )}
      </div>
    </div>
  );
};

export default RocketReachPeopleCard;
