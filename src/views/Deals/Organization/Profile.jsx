import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Deals from '../../../components/peopleProfile/deals/Deals';
import Header from '../../../components/organizationProfile/Header';
import AddContent from '../../../components/peopleProfile/AddContent';
import organizationService from '../../../services/organization.service';
import Contacts from '../../../components/organizationProfile/contacts/Contacts';
import RelatedOrg from '../../../components/organizationProfile/relatedOrgs/RelatedOrg';
import Overview from '../../../components/organizationProfile/overview/Organization';
import RightBar from '../../../components/organizationProfile/overview/RightBar';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import stringConstants from '../../../utils/stringConstants.json';
import userService from '../../../services/user.service';
import fieldService from '../../../services/field.service';
import { useModuleContext } from '../../../contexts/moduleContext';

const Profile = ({ children }) => {
  const constants = stringConstants.deals.contacts.profile;
  const history = useHistory();
  const { organizationId, activityId } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshOwners, setRefresOwners] = useState(false);
  const [activityIdOpen, setActivityIdOpen] = useState(activityId);
  const [organization, setOrganization] = useState({});
  const [getUser, setGetUser] = useState({});
  const [me, setMe] = useState(null);
  const { moduleMap } = useModuleContext();
  const isPrincipalOwner =
    me && profileInfo
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        profileInfo?.assigned_user_id === me?.id
      : false;

  useEffect(() => {
    getCurrentUser();
  }, [profileInfo]);

  useEffect(() => {
    if (refreshOwners) {
      setRefresOwners(false);
    }
  }, [refreshOwners]);

  useEffect(() => {
    getProfileInfo();
  }, [organizationId]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const goToHome = () => {
    history.push('/');
  };
  const permissionCheck = {
    collection: 'contacts',
    action: 'edit',
  };
  const getOrganizationById = async () => {
    const organizationObj = await organizationService.getOrganizationById(
      organizationId
    );
    setOrganization(organizationObj);
  };
  const getProfileInfo = async (message) => {
    if (message) {
      setActivityIdOpen(''); // After activity update to not open activity modal
      switch (message) {
        case constants.contactUpdated:
          setSuccessMessage(constants.contactUpdated);

          break;
        case constants.errorContactUpdated:
          setErrorMessage(constants.errorContactUpdated);
          break;
        default:
          setSuccessMessage(message);
      }
    }
    setIsLoading(true);
    const { data } = await fieldService.getFields('organization', {
      usedField: true,
    });
    const {
      data: { data: customFields },
    } = await organizationService.getCustomField(organizationId, {
      page: 1,
      limit: 50,
    });
    let customValues = {};
    Promise.all([
      organizationService.getOrganizationById(organizationId),
      organizationService.getFieldByOrganization(organizationId, {}),
    ])
      .then(([result, response]) => {
        if (!result) {
          goToHome();
        }
        const fields = response?.data?.sort((a, b) => {
          return a.field.order - b.field.order;
        });
        data.forEach((field) => {
          if (field.isCustom) {
            customFields.forEach((item) => {
              if (field.key === item.field.key && field.field_type !== 'DATE') {
                customValues = {
                  ...customValues,
                  [field.key?.toLowerCase().replace(/\s+/g, '')]:
                    field.field_type === 'CURRENCY'
                      ? item.value.substring(1)
                      : item.value,
                };
              } else if (
                field.key === item.field.key &&
                field.field_type === 'DATE'
              ) {
                customValues = {
                  ...customValues,
                  [field.key?.toLowerCase().replace(/\s+/g, '')]: new Date(
                    item.value
                  ),
                };
              }
            });
          }
        });
        setProfileInfo({ ...result, ...customValues, fields });
        setIsLoading(false);
      })
      .catch(() => {
        goToHome();
      });
  };
  const getUserById = async () => {
    const data = await userService.getUserById(profileInfo?.assigned_user_id);
    setGetUser(data);
  };

  useEffect(() => {
    getProfileInfo();
    getCurrentUser();
    getOrganizationById();
  }, []);
  useEffect(() => {
    getUserById();
  }, [profileInfo]);
  useEffect(() => {
    if (refreshRecentFiles) {
      getProfileInfo();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  const updateLabel = (label) => {
    if (label.id === profileInfo?.label?.id) {
      setProfileInfo({ ...profileInfo, label });
    }
  };
  return (
    <>
      {children}
      <div className="splitted-content-fluid position-relative container-fluid content-with-insights overflow-hidden">
        <AlertWrapper>
          <Alert
            color="success"
            message={successMessage}
            setMessage={setSuccessMessage}
          />
          <Alert
            message={errorMessage}
            setMessage={setErrorMessage}
            color="danger"
          />
        </AlertWrapper>
        {moduleMap.contact && (
          <Header
            me={me}
            service={organizationService}
            withFollowers={organizationId}
            mainOwner={getUser}
            data={profileInfo}
            contact={moduleMap.contact.singular}
            moduleMap={moduleMap.organization.singular}
            refreshOwners={refreshOwners}
            setRefresOwners={setRefresOwners}
            isPrincipalOwner={isPrincipalOwner}
            getProfileInfo={getProfileInfo}
            organizationId={organizationId}
          />
        )}
        <hr className="mt-0" />
        <div className="row">
          <div className="col-lg-4-2">
            <Overview
              data={profileInfo}
              me={me}
              labelType="organization"
              setProfileInfo={setProfileInfo}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
              updateLabel={updateLabel}
              permissionCheck={permissionCheck}
            />
            {moduleMap.contact && (
              <Contacts
                companyName={moduleMap.organization.singular}
                moduleMap={moduleMap.contact.singular}
                organizationId={organizationId}
                profileInfo={profileInfo}
                getProfileInfo={getProfileInfo}
                isPrincipalOwner={isPrincipalOwner}
                mainOwner={profileInfo?.assigned_user}
              />
            )}
            {moduleMap.deal && (
              <Deals
                moduleMap={moduleMap.deal}
                organizationId={organizationId}
                profileInfo={profileInfo}
              />
            )}

            {moduleMap.organization && (
              <RelatedOrg
                moduleMap={moduleMap.organization.singular}
                organizationId={organizationId}
                getProfileInfo={getProfileInfo}
                isPrincipalOwner={isPrincipalOwner}
                mainOwner={profileInfo?.assigned_user}
              />
            )}
          </div>

          <div className="col-lg-8-2 pl-0">
            <div>
              {moduleMap.task && (
                <AddContent
                  moduleMap={moduleMap}
                  dataType="organization"
                  organizationId={organizationId}
                  getProfileInfo={getProfileInfo}
                  setProfileInfo={profileInfo}
                  dataSection
                  organization={organization}
                  contactIs={'organization'}
                  fromOrganization={true}
                  refreshRecentFiles={refreshRecentFiles}
                  setRefreshRecentFiles={setRefreshRecentFiles}
                  isPrincipalOwner={isPrincipalOwner}
                  me={me}
                  openActivityId={activityIdOpen}
                />
              )}
            </div>
          </div>
        </div>
        <RightBar
          profileInfo={profileInfo}
          isLoading={isLoading}
          isPeople={false}
          moduleName="companies_sidebar_generate_pre-call_plan"
        />
      </div>
    </>
  );
};

export default Profile;
