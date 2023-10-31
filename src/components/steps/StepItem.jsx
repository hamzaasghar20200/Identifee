import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import FeedNote from './feedTypes/FeedNote';
import FeedFile from './feedTypes/FeedFile';
import FeedFileDeleted from './feedTypes/FeedFileDeleted';
import FeedDeletion from './feedTypes/FeedDeletion';
import FeedActivity from './feedTypes/FeedActivity';
import FeedCreation from './feedTypes/FeedCreation';
import FeedUpdated from './feedTypes/FeedUpdated';
import FeedLinked from './feedTypes/FeedLinked';
import FeedLink from './feedTypes/FeedLink';
import {
  checkDate,
  DATE_FORMAT,
  DATE_FORMAT_TIME_WO_SEC,
  isPermissionAllowed,
  setDateFormat,
} from '../../utils/Utils';
import routes from '../../utils/routes.json';
import {
  ACTIVITY_FEED_TYPES,
  ACTIVITY_FEED_THEMES,
} from '../../utils/constants';
import Comments from './Comments';
import FeedLesson from './feedTypes/FeedLesson';
import FeedCourse from './feedTypes/FeedCourse';
import MaterialIcon from '../commons/MaterialIcon';
import MoreActions from '../MoreActions';
import MentionsInput from '../mentions/MentionsInput';
import stringConstants from '../../utils/stringConstants.json';
import Guests from '../ActivityTimeline/Guests';
import IdfTooltip from '../idfComponents/idfTooltip';
import activityService from '../../services/activity.service';
import Owners from '../ActivityTimeline/Owners';
import { NoteItem } from './NotesItem';
import { ActivityDetail } from '../ActivitiesTable/activityDetail';

const constants = stringConstants.deals.contacts.profile;

const ResourceLink = ({ data }) => {
  if (data?.contact) {
    return (
      <>
        <span className="mx-1">&bull;</span>
        <span>{`${data?.contact?.first_name} ${data?.contact?.last_name}`}</span>
      </>
    );
  } else if (data?.organization) {
    return (
      <>
        <span className="mx-1">&bull;</span>
        <Link
          to={`/${routes.companies}/${data.organization_id}/organization/profile`}
          className="text-block"
        >
          <span>{data?.organization?.name}</span>
        </Link>
      </>
    );
  }
  return null;
};

const ActivityItem = ({
  data,
  id,
  deal,
  activity_id,
  feedInfo,
  me,
  handleEditActivity,
  refreshFeed,
  isOwner,
  setSuccessMessage,
  setErrorMessage,
}) => {
  const [activityObj, setActivityObj] = useState();

  const [ownerData, setOwnerData] = useState({});
  const [isShow, setIsShow] = useState(false);
  const tableActions = [
    {
      id: 1,
      title: 'Edit',
      icon: 'edit',
      permission: {
        collection: 'activities',
        action: 'edit',
      },
      onClick: (e) => {
        setIsShow(false);
        handleEditActivity(e?.id);
      },
    },
  ];

  const isJson = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };
  const notesData = isJson(data?.notes);
  const dueDate = checkDate(data);
  const activityDetail = async (content) => {
    const { data } = await activityService.getSingleActivity(
      content.id ? content.id : content
    );
    setActivityObj(data);
    setIsShow(true);
  };
  const markAsDone = async () => {
    try {
      await activityService.markAsCompleted(id);
      setSuccessMessage(constants.updatedActivity);
      refreshFeed();
    } catch (error) {
      setErrorMessage(constants.errorUpdatedActivity);
    }
  };
  useEffect(() => {
    const ownerObj = data?.owners?.find((item) => {
      return item?.id === data?.assigned_user_id;
    });
    setOwnerData(ownerObj);
  }, [data]);
  return (
    <div className="border-bottom p-3 hover-actions bg-hover-gray">
      <div className="d-flex align-items-start">
        <div className="d-flex flex-grow-1 gap-2 position-relative">
          {data.done && (
            <div className="action-items position-absolute top-0 badge px-2 badge-success badge-pill right-0">
              <div className="d-flex align-items-center gap-1">
                <MaterialIcon icon="task_alt" clazz="mr-1" />
                <span>Completed</span>
              </div>
            </div>
          )}
          <MaterialIcon icon={data.type} clazz="fs-4 text-gray-900" />
          <div className="flex-grow-1">
            <h5
              className={`mb-1 d-flex align-items-center gap-2 font-weight-semi-bold cr-p`}
            >
              <span
                className={data.done ? 'text-strikethrough' : ''}
                onClick={() => activityDetail(data)}
              >
                {data.name}
              </span>
              <p className="step-text font-size-xs mb-0 font-weight-normal text-muted">
                <span>
                  {setDateFormat(feedInfo.updated_at, DATE_FORMAT_TIME_WO_SEC)}
                </span>
                {ownerData?.first_name && (
                  <span className="cursor-default text-black">
                    <ResourceLink
                      data={{ contact: ownerData, contact_id: ownerData.id }}
                    />
                  </span>
                )}
                <ResourceLink data={data} />
              </p>
            </h5>
            <div className="w-100">
              {notesData && !data?.rich_note ? (
                <p className="mb-1">
                  {notesData?.blocks?.length > 0
                    ? notesData?.blocks[0]?.text
                    : notesData}
                </p>
              ) : (
                <div className="pl-0 pt-0 pb-0">
                  {notesData && (
                    <MentionsInput
                      className="pt-1 pb-0 px-4"
                      defaultState={notesData}
                      readOnly
                    />
                  )}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              {deal && (
                <p
                  className="cursor-pointer mb-1 d-flex text-black align-items-center gap-1 font-size-sm2"
                  onClick={() =>
                    history.push(`${routes.dealsPipeline}/${deal.id}`)
                  }
                >
                  <MaterialIcon icon="monetization_on" clazz="mr-1" />
                  <span className="text-capitalize">{deal.name}</span>
                </p>
              )}
              {data.contact_info && (
                <a
                  href=""
                  className="cursor-pointer mb-1 d-flex text-black align-items-center gap-1 font-size-sm2"
                  onClick={() =>
                    history.push(`/contacts/${data.contact_info.id}/profile`)
                  }
                >
                  <MaterialIcon icon="person" clazz="mr-1" />
                  <span>
                    {data.contact_info.first_name} {data.contact_info.last_name}
                  </span>
                </a>
              )}
            </div>
            {data?.start_date && (
              <p className={`mb-0 font-size-sm2 ${dueDate}`}>
                {dueDate === 'text-success' ? (
                  ` Today ${setDateFormat(data.start_date, 'h:mm A')}`
                ) : dueDate === 'text-primary' ? (
                  ` Tomorrow ${setDateFormat(data.start_date, 'h:mm A')}`
                ) : (
                  <div className="d-flex align-items-center gap-1">
                    {setDateFormat(data.start_date, DATE_FORMAT)}
                    {dueDate === 'text-danger' &&
                      (!data.done ? (
                        <IdfTooltip text="Not completed">
                          <MaterialIcon
                            filled
                            clazz="text-size-md"
                            icon="flag"
                          />
                        </IdfTooltip>
                      ) : (
                        <IdfTooltip text="Not completed">
                          <MaterialIcon
                            filled
                            clazz="text-size-md"
                            icon="task_alt"
                          />
                        </IdfTooltip>
                      ))}
                  </div>
                )}
              </p>
            )}
            <Owners timeline={{ item: feedInfo }} fromNavbar={false} />
            <Guests timeline={{ item: feedInfo }} fromNavbar={false} />
          </div>
        </div>
        {isOwner && (
          <MoreActions
            items={[
              {
                permission: {
                  collection: 'activities',
                  action: 'edit',
                },
                id: 'remove',
                icon: 'task_alt',
                name: 'Mark as completed',
                className: data.done || data.type === 'event' ? 'd-none' : '',
              },
              {
                permission: {
                  collection: 'activities',
                  action: 'edit',
                },
                id: 'edit',
                icon: 'edit',
                name: 'Edit',
              },
            ]}
            onHandleEdit={() => handleEditActivity(activity_id)}
            onHandleRemove={markAsDone}
            menuWidth={180}
          />
        )}
        {isShow && (
          <ActivityDetail
            activityDetail={activityDetail}
            isShow={isShow}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            markAsDone={markAsDone}
            refreshFeed={refreshFeed}
            setIsShow={setIsShow}
            data={activityObj}
            tableActions={tableActions}
          />
        )}
      </div>
    </div>
  );
};

const StepItem = ({
  data,
  isDeal,
  feedId,
  isContact,
  setRefreshRecentFiles,
  getProfileInfo,
  ids,
  contactInfo,
  deal,
  successMessage,
  setSuccessMessage,
  errorMessage,
  setErrorMessage,
  organization,
  organizationId,
  dataType,
  me,
  layout = 'old',
  layoutType,
  handleEditActivity,
  refreshFeed,
  fromClientPortal,
  sharedById,
}) => {
  // if current user has admin_access or the item is created by the user then allow editing only
  const isOwner = me?.role?.admin_access || data?.created_by === me?.id;
  const renderContent = (type, objectData, id, activity_id) => {
    if (layout === 'new') {
      switch (layoutType) {
        case 'note':
          return (
            <NoteItem
              feedInfo={data}
              data={data}
              feedId={feedId}
              isDeal={deal}
              isContact={contactInfo}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              dataType={dataType}
              organizationId={organizationId}
              getProfileInfo={getProfileInfo}
              isOwner={isOwner}
              me={me}
              refreshFeed={refreshFeed}
              fromClientPortal={fromClientPortal}
              sharedById={sharedById}
            />
          );
        case 'activity':
          return (
            <ActivityItem
              data={objectData}
              id={id}
              isContact={isContact}
              isDeal={isDeal}
              getProfileInfo={getProfileInfo}
              ids={ids}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              deal={deal}
              dataType={dataType}
              organization={organization}
              activity_id={id}
              isOwner={isOwner}
              feedInfo={data}
              me={me}
              handleEditActivity={handleEditActivity}
              refreshFeed={refreshFeed}
            />
          );
      }
    } else {
      switch (type) {
        case ACTIVITY_FEED_TYPES.note:
          return (
            <FeedNote
              data={objectData}
              feedId={feedId}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              getProfileInfo={getProfileInfo}
              isOwner={isOwner}
            />
          );

        case ACTIVITY_FEED_TYPES.file:
          return (
            <FeedFile
              data={objectData}
              setRefreshRecentFiles={setRefreshRecentFiles}
              organizationId={organizationId}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              isOwner={isOwner}
            />
          );

        case ACTIVITY_FEED_TYPES.fileDeleted:
          return <FeedFileDeleted data={objectData} />;

        case ACTIVITY_FEED_TYPES.deletion:
          return <FeedDeletion data={objectData} />;

        case ACTIVITY_FEED_TYPES.call:
        case ACTIVITY_FEED_TYPES.event:
        case ACTIVITY_FEED_TYPES.task:
          return (
            <FeedActivity
              data={objectData}
              id={id}
              isContact={isContact}
              getProfileInfo={getProfileInfo}
              ids={ids}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              deal={deal}
              dataType={dataType}
              organization={organization}
              activity_id={activity_id}
              isOwner={isOwner}
              feedInfo={data}
            />
          );

        case ACTIVITY_FEED_TYPES.creation:
          return <FeedCreation {...objectData} isDeal={isDeal} />;

        case ACTIVITY_FEED_TYPES.updated:
          return <FeedUpdated {...objectData} />;

        case ACTIVITY_FEED_TYPES.contactLinked:
        case ACTIVITY_FEED_TYPES.contactUnlinked:
          return (
            <FeedLinked
              data={objectData}
              profileUrl={`${routes.contacts}/${objectData.id}/profile`}
            />
          );

        case ACTIVITY_FEED_TYPES.organizationLinked:
        case ACTIVITY_FEED_TYPES.organizationUnlinked:
          return (
            <FeedLinked
              data={objectData}
              profileUrl={`/${routes.companies}/${objectData.id}/organization/profile`}
            />
          );

        case ACTIVITY_FEED_TYPES.lessonCompleted:
        case ACTIVITY_FEED_TYPES.lessonStarted:
          return <FeedLesson data={objectData} />;

        case ACTIVITY_FEED_TYPES.courseCompleted:
        case ACTIVITY_FEED_TYPES.courseStarted:
          return <FeedCourse data={objectData} />;

        case ACTIVITY_FEED_TYPES.link:
          return <FeedLink data={objectData} isOwner={isOwner} />;

        default:
          return null;
      }
    }
  };

  const getSummary = (summaryInfo) => {
    const { name } = summaryInfo.object_data;
    if (
      !isDeal &&
      summaryInfo?.deal_id &&
      summaryInfo.type === ACTIVITY_FEED_TYPES.updated
    ) {
      return (
        <span>
          Your deal
          <Link
            to={`${routes.pipeline}/${summaryInfo.deal_id}`}
            className="text-block"
          >
            {` "${name}" `}
          </Link>
          {summaryInfo.summary === 'Deal updated'
            ? 'was updated'
            : summaryInfo.summary}
        </span>
      );
    }
    return <span>{summaryInfo.summary}</span>;
  };

  let stepItemDate;
  const getHoursDifference = () => {
    const dif = now.getHours() - stepItemDate.getHours();
    return dif === 0
      ? 'Just Now'
      : dif === 1
      ? 'An hour ago'
      : `${dif} hours ago`;
  };
  const getNearTimeDifference = () => {
    return (
      now.getFullYear === stepItemDate.getFullYear &&
      now.getMonth() === stepItemDate.getMonth() &&
      (now.getDate() === stepItemDate.getDate()
        ? getHoursDifference()
        : now.getDate() - 1 === stepItemDate.getDate() &&
          now.getHours() - stepItemDate.getHours() < 2 &&
          'One day ago')
    );
  };

  const updateStepItemDate = (date) => {
    stepItemDate = new Date(date);
  };
  const now = new Date();

  return (
    <>
      {layout === 'new' &&
      (layoutType === 'activity' || layoutType === 'note') ? (
        <li className="step-item p-0 m-0">
          {renderContent(
            data.type,
            layoutType !== 'activity' ? data?.object_data : data,
            data.id
          )}
        </li>
      ) : (
        <li className="step-item">
          <div className="step-content-wrapper">
            <span
              className={`step-icon ${ACTIVITY_FEED_THEMES[data?.type]?.color}`}
            >
              <i className="material-icons-outlined">
                {ACTIVITY_FEED_THEMES[data?.type]?.icon}
              </i>
            </span>

            <div className="step-content">
              <h5>{getSummary(data)}</h5>
              <p className="step-text font-size-xs text-muted">
                {updateStepItemDate(data.updated_at)}
                <span>
                  {getNearTimeDifference() ||
                    setDateFormat(data.updated_at, 'MMM DD YYYY h:mm A')}
                </span>
                <span className="mx-1">&bull;</span>
                {data?.created_by && (
                  <Link
                    to={`${routes.contacts}/${data?.created_by}/profile`}
                    className="text-block"
                  >
                    <span>{`${data?.created_by_info?.first_name || ''} `}</span>
                    <span>{data?.created_by_info?.last_name || ''}</span>
                  </Link>
                )}
                {data?.updated_by_info && (
                  <>
                    <span className="mx-1">&bull; Last updated by</span>
                    <Link
                      to={`${routes.contacts}/${data?.created_by}/profile`}
                      className="text-block"
                    >
                      <span>{`${
                        data?.updated_by_info?.first_name || ''
                      } `}</span>
                      <span>{data?.updated_by_info?.last_name || ''}</span>
                    </Link>
                  </>
                )}
                <ResourceLink data={data} />
              </p>
              {renderContent(data.type, data, data.id, data.activity_id)}
              {isPermissionAllowed('activities', 'create') && (
                <Comments data={data} me={me} />
              )}
            </div>
          </div>
        </li>
      )}
    </>
  );
};

StepItem.defaultProps = {
  showOrganizationInfo: false,
  isDeal: false,
  isContact: false,
  isOrganization: false,
};

export default StepItem;
