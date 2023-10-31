import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import Header from '../../../components/peopleProfile/Header';
import contactService from '../../../services/contact.service';
import Deals from '../../../components/peopleProfile/deals/Deals';
import Overview from '../../../components/peopleProfile/overview/Overview';
import RightBar from '../../../components/organizationProfile/overview/RightBar';
import Organization from '../../../components/peopleProfile/organization/Organization';
import AddContent from '../../../components/peopleProfile/AddContent';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import userService from '../../../services/user.service';
import fieldService from '../../../services/field.service';
import { useModuleContext } from '../../../contexts/moduleContext';

const Profile = () => {
  const history = useHistory();
  const { contactId, activityId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshOwners, setRefresOwners] = useState(false);
  const [, setActivityIdOpen] = useState(activityId);
  const [me, setMe] = useState(null);

  const { moduleMap } = useModuleContext();
  const isPrincipalOwner =
    me && profileInfo
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        profileInfo?.assigned_user?.id === me?.id
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
  }, []);

  useEffect(() => {
    if (refreshRecentFiles) {
      getProfileInfo();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  useEffect(() => {
    getProfileInfo();
  }, [contactId]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const goToHome = () => {
    history.push('/');
  };

  const getProfileInfo = async (message) => {
    setIsLoading(true);
    if (message) {
      setActivityIdOpen('');
      setSuccessMessage(message);
    }
    const { data } = await fieldService.getFields('contact', {
      usedField: true,
    });
    const {
      data: { data: customFields },
    } = await contactService.getCustomField(contactId, {
      page: 1,
      limit: 50,
    });
    let customValues = {};
    Promise.all([
      contactService.getContactById(contactId),
      contactService.getFieldByContact(contactId, {}),
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
  return (
    <>
      <div className="splitted-content-fluid container-fluid content-with-insights">
        <AlertWrapper>
          <Alert message={successMessage} setMessage={setSuccessMessage} />
        </AlertWrapper>

        {moduleMap.contact && (
          <Header
            moduleMap={moduleMap.contact.singular}
            contactId={contactId}
            data={profileInfo}
            refreshOwners={refreshOwners}
            setRefresOwners={setRefresOwners}
            isPrincipalOwner={isPrincipalOwner}
          />
        )}
        <hr className="mt-0" />
        <div className="row">
          <div className="col-lg-4-2">
            {moduleMap.contact && (
              <Overview
                moduleMap={moduleMap}
                labelType="contact"
                data={profileInfo}
                getProfileInfo={getProfileInfo}
                isPrincipalOwner={isPrincipalOwner}
              />
            )}
            {moduleMap.contact && (
              <Organization
                data={profileInfo.organization}
                moduleMap={moduleMap.organization.singular}
                contactId={contactId}
                getProfileInfo={getProfileInfo}
                isPrincipalOwner={isPrincipalOwner}
              />
            )}

            {moduleMap.deal && (
              <Deals
                moduleMap={moduleMap.deal}
                contactProfile={profileInfo}
                contactId={contactId}
              />
            )}
          </div>

          <div className="col-lg-8-2 pl-0">
            <div>
              {moduleMap.task && (
                <AddContent
                  moduleMap={moduleMap}
                  dataType="contact"
                  contactId={contactId}
                  contactInfo={profileInfo}
                  getProfileInfo={getProfileInfo}
                  organizationId={profileInfo?.organization?.id}
                  contactIs={'profile'}
                  isContact
                  me={me}
                  refreshRecentFiles={refreshRecentFiles}
                  setRefreshRecentFiles={setRefreshRecentFiles}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <RightBar
        profileInfo={profileInfo?.organization}
        isPeople={true}
        isLoading={isLoading}
        moduleName="contacts_sidebar_generate_pre-call_plan"
      />
    </>
  );
};

export default Profile;
