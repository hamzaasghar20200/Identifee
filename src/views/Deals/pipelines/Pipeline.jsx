import { useParams, Redirect } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { findIndex } from 'lodash';
import Heading from '../../../components/heading';
import AddContent from '../../../components/peopleProfile/AddContent';
import dealService from '../../../services/deal.service';
import PipelineOverview from './PipelineOverview';
import PipelineOrganizationInfo from './PipelineOrganizationInfo';
import { NO_DEAL } from '../../../utils/constants';
import stringConstants from '../../../utils/stringConstants.json';

import PipelineHeader from './PipelineHeader';
import AlertWrapper from '../../../components/Alert/AlertWrapper';
import Alert from '../../../components/Alert/Alert';
import { getProductsTotalAmount } from '../../../utils/Utils';
import userService from '../../../services/user.service';
import fieldService from '../../../services/field.service';
import Contacts from '../../../components/organizationProfile/contacts/Contacts';
import organizationService from '../../../services/organization.service';
import { useModuleContext } from '../../../contexts/moduleContext';
const constants = stringConstants.deals.contacts.profile;

const Pipeline = () => {
  const params = useParams();
  const { id, activityId } = params || {};
  const [deal, setDeal] = useState({});
  const [, setIsLoading] = useState(false);
  const [profileInfo, setProfileInfo] = useState({});

  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setProductsTotalAmount] = useState(0);
  const [refreshOwners, setRefresOwners] = useState(false);
  const [, setActivityIdOpen] = useState(activityId);
  const [me, setMe] = useState(null);
  const [refreshPipelineStage, setRefreshPipelineStage] = useState(1);
  const { moduleMap } = useModuleContext();
  const isPrincipalOwner =
    me && deal
      ? me?.role?.admin_access ||
        me?.role?.owner_access ||
        deal?.assigned_user_id === me?.id
      : false;

  useEffect(() => {
    if (refreshOwners) {
      setRefresOwners(false);
    }
  }, [refreshOwners]);

  useEffect(() => {
    getDeal();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (refreshRecentFiles) {
      getDeal();
      setRefreshRecentFiles(false);
    }
  }, [refreshRecentFiles]);

  const getCurrentUser = async () => {
    const me = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    setMe(me);
  };

  const getDeal = async (message) => {
    const { data } = await fieldService.getFields('deal', {
      usedField: true,
    });
    const {
      data: { data: customFields },
    } = await dealService.getCustomField(id, {
      page: 1,
      limit: 50,
    });
    let customValues = {};
    if (message) {
      setSuccessMessage(message);
      setActivityIdOpen('');
    }
    setIsLoading(true);

    const deal = await dealService
      .getDealById(id)
      .catch((err) => console.log(err));
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
            const dateValue = new Date(item.value);
            if (!isNaN(dateValue)) {
              customValues = {
                ...customValues,
                [field.key?.toLowerCase().replace(/\s+/g, '')]: dateValue,
              };
            } else {
              // Handle invalid date format here (e.g., set a default value)
              customValues = {
                ...customValues,
                [field.key?.toLowerCase().replace(/\s+/g, '')]: null, // or provide a default date value
              };
            }
          }
        });
      }
    });

    setDeal({ ...deal, ...customValues });

    setIsLoading(false);

    setRefreshPipelineStage((prevState) => prevState + 1);
  };

  if (!deal) {
    return <div>{NO_DEAL}</div>;
  }

  const classnames = (index, stages, currentDeal) => {
    const stageIndex = findIndex(stages, {
      id: currentDeal.tenant_deal_stage_id || 'cold',
    });

    if (index === stageIndex) {
      if (deal.status === 'lost') return 'danger';

      return 'bg-success';
    }

    return 'bg-soft-primary';
  };
  useEffect(() => {
    if (params?.id) {
      getDeal();
    }
  }, [params?.id]);
  useEffect(() => {
    deal?.deal_products?.length &&
      setProductsTotalAmount(getProductsTotalAmount(deal.deal_products));
  }, [deal?.deal_products]);

  if (deal?.deleted) {
    return <Redirect to="/" />;
  }
  const goToHome = () => {
    history.push('/');
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
    } = await organizationService.getCustomField(deal?.organization?.id, {
      page: 1,
      limit: 50,
    });
    let customValues = {};
    Promise.all([
      organizationService.getOrganizationById(deal?.organization?.id),
      organizationService.getFieldByOrganization(deal?.organization?.id, {}),
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

  useEffect(() => {
    if (deal?.organization?.id) {
      getProfileInfo();
    }
  }, [deal?.organization?.id]);
  return (
    <>
      <AlertWrapper>
        <Alert
          color="danger"
          message={errorMessage}
          setMessage={setErrorMessage}
        />
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <Heading useBc title={deal.name} showGreeting={false} />
      {moduleMap.deal && (
        <PipelineHeader
          moduleMap={moduleMap}
          classnames={classnames}
          deal={deal}
          getDeal={getDeal}
          refreshOwners={refreshOwners}
          setRefresOwners={setRefresOwners}
          isPrincipalOwner={isPrincipalOwner}
          refreshPipelineStage={refreshPipelineStage}
          withFollowers={deal.id}
          mainOwner={deal?.assigned_user}
          service={dealService}
        />
      )}
      <div className="row">
        <div className="col-lg-4-2">
          {moduleMap.deal && (
            <PipelineOverview
              moduleMap={moduleMap.deal.singular}
              moduleData={moduleMap}
              deal={deal}
              getDeal={getDeal}
              isPrincipalOwner={isPrincipalOwner}
            />
          )}
          {moduleMap.organization && (
            <PipelineOrganizationInfo
              moduleMap={moduleMap.organization.singular}
              deal={deal}
              getDeal={getDeal}
            />
          )}

          {moduleMap.contact && (
            <Contacts
              moduleMap={moduleMap.contact.singular}
              organizationId={deal?.organization?.id}
              profileInfo={profileInfo}
              getProfileInfo={getProfileInfo}
              isPrincipalOwner={isPrincipalOwner}
              mainOwner={profileInfo?.assigned_user}
            />
          )}
          {/* <PipelineContactInfo deal={deal} getDeal={getDeal} /> */}
        </div>

        <div className="col-lg-8-2 pl-0">
          <div>
            {moduleMap.task && (
              <AddContent
                moduleMap={moduleMap}
                dataType="deal"
                dealId={deal.id}
                deal={deal}
                organization={deal?.organization}
                getDeal={getDeal}
                setDeal={setDeal}
                me={me}
                contactInfo={deal?.contact}
                organizationId={deal?.organization?.id}
                contactIs={'organization'}
                getProfileInfo={getDeal}
                isDeal={true}
                refreshRecentFiles={refreshRecentFiles}
                setRefreshRecentFiles={setRefreshRecentFiles}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Pipeline;
