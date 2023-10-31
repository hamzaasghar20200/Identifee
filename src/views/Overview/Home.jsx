import { Link } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import MaterialIcon from '../../components/commons/MaterialIcon';
import routes from '../../utils/routes.json';
import {
  clearMenuSelection,
  isModuleAllowed,
  isPermissionAllowed,
  LearnViewTypes,
} from '../../utils/Utils';
import { TenantContext } from '../../contexts/TenantContext';
import PageTitle from '../../components/commons/PageTitle';
import { useProfileContext } from '../../contexts/profileContext';
import Avatar from '../../components/Avatar';
import useIsTenant from '../../hooks/useIsTenant';
import TopicIcon from '../../components/commons/TopicIcon';
import Skeleton from 'react-loading-skeleton';
import { CardBody } from 'reactstrap';
import { NewHomePage } from './NewHome/NewHome';

const HomeItem = ({ item }) => {
  return (
    <div
      className={`card home-card-item cursor-pointer btn-outline-primary border-2 position-relative h-100`}
      style={{ maxWidth: 280 }}
    >
      <Link
        to={item.url}
        className={`card-body p-4`}
        onClick={(e) => clearMenuSelection(e)}
      >
        <MaterialIcon icon={item.icon} clazz="font-size-3em" />
        <div className="d-flex align-items-center mt-4 justify-content-between">
          <h4 className="font-weight-semi-bold">{item.name}</h4>
          <MaterialIcon icon="arrow_circle_right" clazz="font-size-2em" />
        </div>
      </Link>
    </div>
  );
};

const HomeItemNewLoader = () => {
  return (
    <div
      className={`card home-card-item-new card-hover-shadow cursor-pointer hover-actions rounded shadow-sm position-relative h-100`}
      style={{ maxWidth: 370, maxHeight: 162, minHeight: 162 }}
    >
      <CardBody className="p-4">
        <Skeleton height={42} width={42} circle className="rounded-circle" />
        <div className="mt-2">
          <Skeleton height="10" width="80" className="mb-1" />
          <Skeleton height="10" width="150" />
        </div>
      </CardBody>
    </div>
  );
};

const HomeItemNew = ({ item }) => {
  return (
    <div
      className={`card home-card-item-new card-hover-shadow cursor-pointer hover-actions rounded shadow-sm position-relative h-100`}
      style={{ maxWidth: 370, maxHeight: 162, minHeight: 162 }}
    >
      <Link
        to={item.url}
        onClick={(e) => clearMenuSelection(e)}
        className={`card-body p-4`}
      >
        <TopicIcon
          icon={item.icon}
          iconBg="bg-primary-soft"
          iconStyle={{ width: 42, height: 42 }}
          iconClasses="font-size-em text-primary"
        />
        <div className="mt-2">
          <h4 className="font-weight-semi-bold mb-1">{item.name}</h4>
          <p className="text-muted font-size-sm2 mb-0 font-weight-normal">
            {item.description}
          </p>
        </div>
      </Link>
      <div
        className="abs-center-y position-absolute action-items"
        style={{ right: 10 }}
      >
        <MaterialIcon icon="east" clazz="font-size-em text-primary" />
      </div>
    </div>
  );
};
const Home = () => {
  const { tenant } = useContext(TenantContext);
  const { profileInfo } = useProfileContext();
  const [ownerAccess, setOwnerAccess] = useState(false);
  const [loader, setLoader] = useState(true);

  const { isExcelBank, isSynovusBank } = useIsTenant();

  useEffect(() => {
    if (profileInfo?.role) {
      setOwnerAccess(profileInfo.role.owner_access);
    }
  }, [profileInfo]);

  // eslint-disable-next-line no-unused-vars
  const NewHome = () => {
    useEffect(() => {
      if (tenant?.id && profileInfo?.id) {
        setLoader(false);
      }
    }, [tenant, profileInfo]);

    return (
      <>
        <div className="m-auto text-center mt-4">
          <div>
            <Avatar
              user={profileInfo}
              defaultSize="md"
              sizeIcon="avatar-dark"
            />
            <p className="mt-2 mb-4">Welcome, {profileInfo?.first_name}!</p>
          </div>
          <h3 className="mt-4">What would you like to do today?</h3>
        </div>
        {loader ? (
          <div className="p-3 mt-2">
            <div
              className="row row-cols-2 m-auto justify-content-between font-weight-medium"
              style={{ gap: 10, maxWidth: 750 }}
            >
              {Array(6)
                .fill(0)
                .map((s, index) => (
                  <HomeItemNewLoader key={index} />
                ))}
            </div>
          </div>
        ) : (
          <div className="p-3 mt-2">
            <div
              className="row row-cols-2 m-auto justify-content-between font-weight-medium"
              style={{ gap: 10, maxWidth: 750 }}
            >
              {((isModuleAllowed(tenant.modules, 'companies') &&
                isPermissionAllowed('contacts', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Create an Insight',
                    description:
                      'Generate a customer specific, benchmark reports.',
                    icon: 'corporate_fare',
                    url: isSynovusBank
                      ? `${routes.insightsCompanies}?filter=MyOrganization`
                      : `${routes.companies}?filter=MyOrganization&id=${profileInfo?.id}`,
                  }}
                />
              )}
              {((isModuleAllowed(tenant.modules, 'prospecting') &&
                isPermissionAllowed('prospects', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Prospecting',
                    description: 'Search 720M professionals, worldwide.',
                    icon: 'person_search',
                    url: routes.prospecting,
                  }}
                />
              )}
              {((isModuleAllowed(tenant.modules, 'learn') &&
                isPermissionAllowed('lessons', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Learn',
                    description: 'On-demand micro lessons.',
                    icon: 'school',
                    url: `${routes.learnMain}?viewType=${LearnViewTypes.Overview}`,
                  }}
                />
              )}
              {((isModuleAllowed(tenant.modules, 'activities') &&
                isPermissionAllowed('activities', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Activities',
                    description: 'Create, assign, and manage activities.',
                    icon: 'event_available',
                    url: routes.Activities,
                  }}
                />
              )}
              {((isModuleAllowed(tenant.modules, 'prospecting') &&
                isPermissionAllowed('prospects', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Content AI',
                    description: 'Generate content with the power of AI.',
                    icon: 'auto_awesome',
                    url: routes.aiAssist,
                  }}
                />
              )}
              {((isModuleAllowed(tenant.modules, 'companies') &&
                isPermissionAllowed('contacts', 'view')) ||
                ownerAccess) && (
                <HomeItemNew
                  item={{
                    name: 'Opportunities',
                    description: 'View your most recent opportunities.',
                    icon: 'trending_up',
                    url: isSynovusBank
                      ? routes.insightsCompanies
                      : routes.companies,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const OldHome = () => {
    return (
      <div className="p-3">
        <div
          className="row row-cols-1 m-auto row-cols-sm-2 row-cols-md-3 row-cols-lg-3 font-weight-medium"
          style={{ gap: 30, maxWidth: 900 }}
        >
          {((isModuleAllowed(tenant.modules, 'companies') &&
            isPermissionAllowed('contacts', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: isSynovusBank ? 'Insights' : 'Companies',
                icon: 'corporate_fare',
                url: isSynovusBank
                  ? routes.insightsCompanies
                  : routes.companies,
              }}
            />
          )}
          {((isModuleAllowed(tenant.modules, 'contacts') &&
            isPermissionAllowed('contacts', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: 'Contacts',
                icon: 'people',
                url: routes.contacts,
              }}
            />
          )}
          {((isModuleAllowed(tenant.modules, 'pipelines') &&
            isPermissionAllowed('deals', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: 'Pipeline',
                icon: 'monetization_on',
                url: routes.pipeline,
              }}
            />
          )}
          {((isModuleAllowed(tenant.modules, 'activities') &&
            isPermissionAllowed('activities', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: 'Activities',
                icon: 'event_available',
                url: routes.Activities,
              }}
            />
          )}
          {((isModuleAllowed(tenant.modules, 'prospecting') &&
            isPermissionAllowed('prospects', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: 'Prospecting',
                icon: 'person_search',
                url: routes.prospecting,
              }}
            />
          )}
          {((isModuleAllowed(tenant.modules, 'learn') &&
            isPermissionAllowed('lessons', 'view')) ||
            ownerAccess) && (
            <HomeItem
              item={{
                name: 'Learn',
                icon: 'school',
                url: routes.favorites,
              }}
            />
          )}
          {isModuleAllowed(tenant.modules, 'settings') && (
            <HomeItem
              item={{
                name: 'Settings',
                icon: 'settings',
                url: routes.settings,
              }}
            />
          )}
        </div>
      </div>
    );
  };
  return (
    <>
      <PageTitle page="Home" />
      {isExcelBank ? (
        <NewHomePage />
      ) : (
        <>
          {isModuleAllowed(tenant?.modules, 'new_home') ? (
            <NewHome />
          ) : (
            <OldHome />
          )}
        </>
      )}
    </>
  );
};

export default Home;
