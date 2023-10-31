import React, { useContext, useEffect, useState } from 'react';
import { useProfileContext } from '../../contexts/profileContext';
import notificationService from '../../services/notification.service';
import LookupLoader from '../loaders/LookupPeople';
import Skeleton from 'react-loading-skeleton';
import ButtonIcon from '../commons/ButtonIcon';
import { Card, CardBody, CardFooter, Spinner } from 'reactstrap';
import { overflowing } from '../../utils/Utils';
import { useHistory } from 'react-router';
import routes from '../../utils/routes.json';
import MaterialIcon from '../commons/MaterialIcon';
import moment from 'moment/moment';
import { Link } from 'react-router-dom';
import LoadMoreButton from '../lesson/LoadMoreButton';
import ActivityTimeline from '../ActivityTimeline/ActivityTimeline';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import Collapse from '@mui/material/Collapse';
import { Form } from 'react-bootstrap';
import IdfTooltip from '../idfComponents/idfTooltip';
import { AlertMessageContext } from '../../contexts/AlertMessageContext';
import AnimatedTabs from '../commons/AnimatedTabs';
import { useModuleContext } from '../../contexts/moduleContext';

const NotificationsType = {
  AlertOnly: 'AlertOnly',
  AlertAndEmail: 'AlertAndEmail',
};
const AuditResourceTypes = {
  activity: { name: 'activity', icon: 'phone' },
  contact: { name: 'contact', icon: 'person' },
  contactOwner: { name: 'owner', icon: 'person' },
  comment: { name: 'comment', icon: 'insert_comment' },
  deal: { name: 'deal', icon: 'monetization_on' },
  dealOwner: { name: 'owner', icon: 'person' },
  note: { name: 'note', icon: 'insert_comment' },
  organization: { name: 'organization', icon: 'corporate_fare' },
  organizationOwner: { name: 'owner', icon: 'person' },
  user: { name: 'user', icon: 'person' },
  file: { name: 'file', icon: 'attachment' },
  activityRequest: { name: 'activity', icon: 'phone' },
};

const Links = {
  deal: routes.dealsPipeline, // deal detail route
  user: routes.contacts,
  owner: routes.contacts,
};

const TABS = {
  ActivityLog: 1,
  Notifications: 2,
};

const tabsData = [
  {
    tabId: TABS.ActivityLog,
    title: 'Timeline',
  },
  {
    tabId: TABS.Notifications,
    title: 'Notifications',
  },
];
const AssociationsLink = ({ associations, closeSidePanel }) => {
  const path = Links.user;
  return (
    <>
      {associations?.length > 1 ? (
        <>
          for
          <ul className="list-labels mb-0 overflow-hidden">
            {associations.map((associate) => (
              <li className="fs-8" key={associate.id}>
                <Link
                  to={`${path}/${associate.id}/profile`}
                  onClick={closeSidePanel}
                >
                  <a>{associate.displayValue}</a>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {associations.map((associate) => (
            <Link
              key={associate.id}
              to={`${path}/${associate.id}/profile`}
              onClick={close}
            >
              <a>{associate.displayValue}</a>
            </Link>
          ))}
        </>
      )}
    </>
  );
};

const MentionNotifications = (association, { closeSidePanel }) => {
  const { moduleMap } = useModuleContext();
  const path = Links.user;

  return (
    <>
      <>
        <ul className="list-labels mb-0 overflow-hidden">
          <li className="fs-8" key={association.associations.resourceId}>
            {association.associations.resourceType === 'activity' ? (
              <>
                Activity
                <Link to={`/activities`} onClick={closeSidePanel}>
                  <a>{` ${association.associations.resourceDisplayValue}`}</a>
                </Link>
              </>
            ) : association.associations.resourceType === 'organization' ? (
              <>
                {moduleMap.organization.singular}
                <Link
                  to={`/companies/${association.associations.resourceId}/organization/profile`}
                  onClick={closeSidePanel}
                >
                  <a>{`  ${association.associations.resourceDisplayValue}`}</a>
                </Link>
              </>
            ) : (
              <>
                {moduleMap.contact.singular}
                <Link
                  to={`${path}/${association.associations.resourceId}/profile`}
                  onClick={closeSidePanel}
                >
                  <a>{`  ${association.associations.resourceDisplayValue}`}</a>
                </Link>
              </>
            )}
          </li>
        </ul>
      </>
    </>
  );
};

const ResourceLink = ({ audit, closeSidePanel }) => {
  const path = Links[audit.resourceType];
  const trailingPath = path !== Links.deal ? '/profile' : '';
  return (
    <>
      {path ? (
        <Link
          to={`${path}/${audit.resourceId}${trailingPath}`}
          onClick={closeSidePanel}
        >
          <a>{audit.resourceDisplayValue}</a>
        </Link>
      ) : (
        <p className="mb-0 d-inline-block font-weight-medium">
          {audit.resourceDisplayValue}
        </p>
      )}
    </>
  );
};

const ActorLink = ({ audit, closeSidePanel }) => {
  const path = Links.user;
  return (
    <Link to={`${path}/${audit.actorId}/profile`} onClick={closeSidePanel}>
      <a>{audit.actorDisplayValue}</a>
    </Link>
  );
};

const ChangeLog = ({ audit, closeSidePanel }) => {
  const { changeLog } = audit;
  return (
    <>
      {changeLog?.association?.type ? (
        <>
          <ActorLink audit={audit} closeSidePanel={closeSidePanel} />{' '}
          {changeLog.association.type === 'mentioned' ||
          (changeLog.association.type === 'mention' &&
            audit.resourceDisplayValue === 'note direct mention')
            ? // changeLog.association.type === 'comment'
              changeLog.association.type +
              ' you in a ' +
              audit.resourceType +
              ' on '
            : audit.action +
              'd a ' +
              AuditResourceTypes[audit.resourceType]?.name +
              ' on  '}
          {changeLog.association.type === 'mentioned' ||
          changeLog.association.type === 'mention' ||
          changeLog.association.type === 'comment' ? (
            <MentionNotifications
              associations={changeLog?.association.parent}
              closeSidePanel={closeSidePanel}
            />
          ) : (
            <AssociationsLink
              associations={changeLog?.association?.associations}
              closeSidePanel={closeSidePanel}
            />
          )}
        </>
      ) : (
        // .update flow
        <>
          <ActorLink audit={audit} closeSidePanel={closeSidePanel} /> updated a{' '}
          {audit.resourceType}{' '}
          <ResourceLink audit={audit} closeSidePanel={closeSidePanel} />
        </>
      )}
    </>
  );
};

const NotificationCard = ({ notification, closeSidePanel }) => {
  const { audit } = notification;
  return (
    <div className="d-flex mb-1 border-bottom px-3 py-2">
      <div className="mr-2">
        <MaterialIcon
          icon={AuditResourceTypes[audit.resourceType]?.icon}
          clazz="font-size-2xl text-muted"
        />
      </div>
      <div className="flex-grow-1">
        <p className="mb-0 font-weight-medium">
          {audit.changeLog ? (
            <ChangeLog audit={audit} closeSidePanel={closeSidePanel} />
          ) : (
            <>
              <ActorLink audit={audit} closeSidePanel={closeSidePanel} />{' '}
              {audit.action}d a {audit.resourceType}{' '}
              <ResourceLink audit={audit} closeSidePanel={closeSidePanel} />
            </>
          )}
        </p>
        <div className="text-muted fs-8">
          {moment(audit.updatedAt).format('MMMM DD, YYYY hh:mm A')}
        </div>
      </div>
    </div>
  );
};

export const NotificationsList = ({
  showSelectComponentModal,
  setShowSelectComponentModal = () => {},
  detail = false,
  notificationsLimit = 7,
}) => {
  const { profileInfo } = useProfileContext();
  const limit = notificationsLimit;
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit });
  const [loader, setLoader] = useState(false);
  const [loadMore, setLoadMore] = useState(false);
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(tabsData[0].tabId);
  const [loading, setLoading] = useState(false);
  const { setSuccessMessage, setErrorMessage } =
    useContext(AlertMessageContext);
  const [settings, setSettings] = useState({
    associations: false,
    dealsUpdates: false,
    separateActivities: false,
    mentionsAndComments: false,
  });

  const [notificationType, setNotificationType] = useState(
    NotificationsType.AlertAndEmail
  );

  const updateObjectValues = (obj, onOff) => {
    const keys = Object.keys(obj);
    for (const key of keys) {
      obj[key] = onOff;
    }
    return obj;
  };

  const handleNotificationType = async (e) => {
    const { value } = e.target;
    // set settings object values to true/false
    const newSettings = updateObjectValues(
      settings,
      value === NotificationsType.AlertAndEmail
    );
    setNotificationType(value);
    setSettings(newSettings);
    try {
      setLoading(true);
      await notificationService.addSettings(newSettings);
      setSuccessMessage('Notifications setting saved.');
    } catch (error) {
      setErrorMessage(
        'Error saving notifications settings. Please check console for details.'
      );
    } finally {
      setLoading(false);
    }
  };
  const getNotifications = async (isLoadMore) => {
    !isLoadMore && setLoader(true);
    try {
      // for side panel showing max 7, in details page will make it paginated/load more like.
      const response = await notificationService.getNotifications(
        pagination.page,
        pagination.limit
      );
      const newNotifications = isLoadMore
        ? [...notifications, ...response?.data]
        : response?.data;
      setNotifications(newNotifications);
      setPagination(response?.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoader(false);
      setLoadMore(false);
    }
  };

  const NoNotificationPlaceholder = () => {
    return (
      <div className="p-4 mt-4 text-center d-flex flex-column align-items-center justify-content-center flex-wrap">
        <h2>
          Good day, {profileInfo?.first_name} {profileInfo?.last_name}!
        </h2>
        <div className="my-2">
          <img
            src="/img/notifications.png"
            className="w-100 rounded mb-2"
            alt=""
          />
        </div>
        <h4>No notifications at this point</h4>
      </div>
    );
  };

  const closeSidePanel = () => {
    overflowing();
    setShowSelectComponentModal();
  };

  const redirectToNotifications = () => {
    closeSidePanel();
    history.push(routes.notificationsAll);
  };

  const onPaginationChange = () => {
    setLoadMore(true);
    setPagination((prevState) => ({ ...prevState, page: prevState.page + 1 }));
  };

  useEffect(() => {
    if (showSelectComponentModal && activeTab === 2) {
      // call to get user notifications
      getNotifications();
    }
  }, [showSelectComponentModal, activeTab]);

  useEffect(() => {
    if (detail) {
      setLoadMore(true);
      getNotifications(true);
    }
  }, [pagination?.page]);

  return (
    <Card
      className={`border-0 ${
        activeTab === TABS.Notifications ? 'h-100' : ''
      } p-0`}
    >
      <CardBody
        className={`${
          activeTab === TABS.Notifications ? 'overflow-y-auto' : ''
        } p-0 pt-2`}
      >
        <div className="border-bottom pt-2">
          <AnimatedTabs
            activeTab={activeTab}
            toggle={(tab) => setActiveTab(tab.tabId)}
            tabsData={tabsData}
          />
        </div>
        {activeTab === TABS.Notifications ? (
          <>
            {loader ? (
              <LookupLoader
                count={7}
                circle={<Skeleton height={40} width={40} circle />}
                lineCount={2}
                containerStyle="mb-1 border-bottom px-3 py-2"
              />
            ) : (
              <div className="pt-2">
                <div className="d-flex align-items-center py-2 px-3 justify-content-between">
                  <div className="mb-0">
                    <div className="d-inline-flex align-items-center">
                      <label
                        className={`mr-1 font-size-sm font-weight-medium mb-0`}
                      >
                        Notification type
                      </label>
                      <IdfTooltip
                        placement="bottom"
                        text="Choose how you want to receive notifications."
                      >
                        <MaterialIcon icon="info" />
                      </IdfTooltip>
                      {loading && <Spinner className="ml-1 spinner-grow-xs" />}
                    </div>
                  </div>
                  <div>
                    <Form.Control
                      as="select"
                      className="comfort"
                      value={notificationType}
                      onChange={handleNotificationType}
                    >
                      <option key={1} value={NotificationsType.AlertOnly}>
                        Show Alert
                      </option>
                      <option key={2} value={NotificationsType.AlertAndEmail}>
                        Alert and Email notification
                      </option>
                    </Form.Control>
                  </div>
                </div>
                <hr className="my-1" />
                {notifications.length > 0 ? (
                  <TransitionGroup appear={true}>
                    {notifications.map((notification) => (
                      <Collapse key={notification.id}>
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          closeSidePanel={closeSidePanel}
                        />
                      </Collapse>
                    ))}
                  </TransitionGroup>
                ) : (
                  <NoNotificationPlaceholder />
                )}
              </div>
            )}
          </>
        ) : (
          <ActivityTimeline
            type={'user'}
            id={profileInfo?.id}
            showFilter={false}
            closeSidePanel={closeSidePanel}
            containerClasses={{ header: '', body: 'overflow-hidden p-3' }}
          />
        )}
      </CardBody>
      {!loader && activeTab === TABS.Notifications && (
        <>
          {pagination?.count > limit && !detail ? (
            <CardFooter>
              <ButtonIcon
                label="View All"
                color="primary"
                classnames="btn-sm btn-block w-100"
                onclick={redirectToNotifications}
              />
            </CardFooter>
          ) : (
            <LoadMoreButton
              loading={loadMore}
              pagination={pagination}
              list={notifications}
              onClick={onPaginationChange}
              btnStyle="w-100"
              btnContainerStyle="p-3"
            />
          )}
        </>
      )}
    </Card>
  );
};
