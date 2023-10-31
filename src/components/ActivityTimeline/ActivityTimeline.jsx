import ButtonFilterDropdown from '../commons/ButtonFilterDropdown';
import React, { useEffect, useState } from 'react';
import feedService from '../../services/feed.service';
import Skeleton from 'react-loading-skeleton';
import './ActivityTimeline.css';
import ButtonIcon from '../commons/ButtonIcon';
import MaterialIcon from '../commons/MaterialIcon';
import moment from 'moment';
import {
  ACTIVITY_FEED_THEMES,
  ACTIVITY_FEED_TYPES,
} from '../../utils/constants';
import routes from '../../utils/routes.json';
import { capitalize } from '../../utils/Utils';
import NoDataFound from '../commons/NoDataFound';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import Guests from './Guests';
import MentionsInput from '../mentions/MentionsInput';
import Avatar from '../Avatar';
import Owners from './Owners';
import { Link } from 'react-router-dom';
import { useProfileContext } from '../../contexts/profileContext';

const getLink = (data) => {
  return data?.name
    ? `${routes.companies}/${data?.id}/organization/profile`
    : `${routes.contacts}/${data?.id}/profile`;
};

const NameEmail = ({ data, closeSidePanel }) => {
  const url = getLink(data);
  const { profileInfo } = useProfileContext();
  if (data.first_name && data.last_name) {
    return (
      <>
        {closeSidePanel ? (
          <Link
            onClick={closeSidePanel}
            to={profileInfo?.id === data.id ? `/settings/profile` : url}
            className="text-block"
          >
            {capitalize(data.first_name || '')}{' '}
            {capitalize(data.last_name || '')}
          </Link>
        ) : (
          <>
            {capitalize(data.first_name || '')}{' '}
            {capitalize(data.last_name || '')}
          </>
        )}
      </>
    );
  }
  return data.email;
};

const getActivityIcon = (item) => {
  // this could be improved
  if (
    item.type === ACTIVITY_FEED_TYPES.creation ||
    item.type === ACTIVITY_FEED_TYPES.updated
  ) {
    const summary = item.summary.toLowerCase();
    if (summary.includes('contact')) {
      return ACTIVITY_FEED_THEMES[ACTIVITY_FEED_TYPES.contactLinked].icon;
    } else if (
      summary.includes('organization') ||
      summary.includes('address')
    ) {
      return ACTIVITY_FEED_THEMES[ACTIVITY_FEED_TYPES.organizationLinked].icon;
    } else if (summary.includes('deal')) {
      return 'monetization_on';
    }
  }
  return ACTIVITY_FEED_THEMES[item.type]?.icon || 'format_align_justify';
};

const getSummary = (summaryInfo, closeSidePanel) => {
  const { name } = summaryInfo.object_data;
  if (summaryInfo.type === ACTIVITY_FEED_TYPES.file) {
    return <span>File uploaded</span>;
  }
  if (
    summaryInfo?.deal_id &&
    summaryInfo.type === ACTIVITY_FEED_TYPES.updated
  ) {
    return (
      <>
        {closeSidePanel ? (
          <span className="cursor-pointer">
            {' '}
            <Link
              onClick={closeSidePanel}
              to={`${routes.pipeline}/${summaryInfo.deal_id}`}
              className="text-block"
            >
              {` "${name}" `}
            </Link>
            {summaryInfo.summary === 'Deal updated'
              ? 'was updated'
              : summaryInfo.summary}
          </span>
        ) : (
          <span>
            Your deal
            <span className="text-block">{` "${name}" `}</span>
            {summaryInfo.summary === 'Deal updated'
              ? 'was updated'
              : summaryInfo.summary}
          </span>
        )}
      </>
    );
  }
  return (
    <span>
      {summaryInfo?.summary?.includes('Activity')
        ? summaryInfo?.summary?.replace(
            /Activity/g,
            capitalize(summaryInfo.type)
          )
        : summaryInfo.summary}
    </span>
  );
};

const timelineFiltersList = [
  {
    key: 'all',
    name: 'All',
    icon: 'filter_list',
    filter: '',
  },
  {
    key: 'call',
    name: 'Calls',
    icon: 'call',
    filter: ['call'],
  },
  {
    key: 'note',
    name: 'Notes',
    icon: 'sticky_note_2',
    filter: ['note'],
  },
  {
    key: 'task',
    name: 'Tasks',
    icon: 'task',
    filter: ['task'],
  },
  {
    key: 'event',
    name: 'Events',
    icon: 'event',
    filter: ['event'],
  },
  {
    key: 'file',
    name: 'Files',
    icon: 'attachment',
    filter: ['file'],
  },
];

const TimelineHead = ({ timeline }) => {
  return (
    <div className="timeline-head font-weight-medium">
      {moment(timeline.created_at).format('MMM DD, YYYY')}
    </div>
  );
};

const isJson = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
};

const ContactOrOrganization = ({ data, closeSidePanel }) => {
  const url = getLink(data);
  return (
    <div className="d-flex flex-column text-muted font-size-sm2 w-100 align-items-start">
      <>
        {closeSidePanel ? (
          <Link onClick={closeSidePanel} to={url} className="text-block">
            <div className="text-black d-flex gap-1 font-weight-medium align-items-center">
              <Avatar
                user={data}
                defaultSize="xs"
                type={data?.name ? 'organization' : 'contact'}
              />
              <span>
                {data?.name || `${data?.first_name} ${data?.last_name}`}
              </span>
            </div>
          </Link>
        ) : (
          <span>
            <div className="text-black d-flex gap-1 font-weight-medium align-items-center">
              <Avatar
                user={data}
                defaultSize="xs"
                sizeIcon="bg-gray-200 text-black"
                type={data?.name ? 'organization' : 'contact'}
              />
              <span>
                {data?.name || `${data?.first_name} ${data?.last_name}`}
              </span>
            </div>
          </span>
        )}
      </>
    </div>
  );
};

const LessonOrCourse = ({ title, description }) => {
  return (
    <div className="d-flex align-items-center gap-2 font-size-sm2">
      <p className="text-muted font-weight-medium mb-0 font-size-sm2">
        {title}
      </p>
      <p className="text-muted mb-0">{description}</p>
    </div>
  );
};

const TimelineItem = ({ timeline, fromNavbar, closeSidePanel }) => {
  const { item } = timeline;
  const data = item?.object_data;
  const notesData = isJson(data?.notes);
  const getDescription = () => {
    // i am gonna improve it
    switch (item.type) {
      case ACTIVITY_FEED_TYPES.courseCompleted:
      case ACTIVITY_FEED_TYPES.courseStarted:
        return (
          <LessonOrCourse
            title={data?.name}
            description={
              data?.required_modules && `${data.required_modules} Lessons`
            }
          />
        );
      case ACTIVITY_FEED_TYPES.lessonCompleted:
      case ACTIVITY_FEED_TYPES.lessonStarted:
        return (
          <LessonOrCourse
            title={data?.title}
            description={data?.duration && `${data.duration} min`}
          />
        );
      case ACTIVITY_FEED_TYPES.file:
        return data?.filename_download;
      case ACTIVITY_FEED_TYPES.note:
        return data?.note?.blocks?.length && data?.note?.blocks[0].text;
      case ACTIVITY_FEED_TYPES.contactLinked:
      case ACTIVITY_FEED_TYPES.contactUnlinked:
        return (
          <ContactOrOrganization data={data} closeSidePanel={closeSidePanel} />
        );
      case ACTIVITY_FEED_TYPES.organizationLinked:
      case ACTIVITY_FEED_TYPES.organizationUnlinked:
        return (
          <ContactOrOrganization
            data={data}
            url={`${routes.companies}/${data.id}/organization/profile`}
            closeSidePanel={closeSidePanel}
          />
        );
      case ACTIVITY_FEED_TYPES.call:
      case ACTIVITY_FEED_TYPES.event:
      case ACTIVITY_FEED_TYPES.task:
        return (
          <>
            <p className="font-weight-semi-bold text-black mb-0">
              {data?.name}
            </p>
            <p className="mb-0">
              {notesData && !data?.rich_note ? (
                <p className="mb-0">
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
            </p>
          </>
        );
      default:
        return data?.notes || data?.name;
    }
  };
  return (
    <div className="timeline-section">
      <div className="timeline-item">
        <span className="timeline-item-time text-muted">
          {moment(item.created_at).format('h:mm A')}
        </span>
        <div className="timeline-item-detail">
          <div className="d-flex align-items-center position-relative">
            <MaterialIcon
              icon={getActivityIcon(item)}
              clazz="mr-1 fs-4 text-gray-900"
            />
            <div className="timeline-item-description font-size-sm">
              <div className="text-wrap">
                {getSummary(item, closeSidePanel)} by{' '}
                <span className="font-weight-semi-bold">
                  {item?.created_by && (
                    <NameEmail
                      data={item?.created_by_info}
                      closeSidePanel={closeSidePanel}
                    />
                  )}
                </span>
              </div>
              <div className="text-muted text-break">
                {getDescription()}
                <Owners timeline={timeline} fromNavbar={fromNavbar} />
                <Guests timeline={timeline} fromNavbar={fromNavbar} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline = ({
  items,
  pagination,
  setPagination,
  loader,
  setLoader,
  fromNavbar,
  selectedFilter,
  closeSidePanel,
}) => {
  const itemsCount = Object.keys(items).length;
  return (
    <>
      {itemsCount > 0 ? (
        <div className="timeline-wrapper">
          <ul className="timeline-list">
            {Object.keys(items)
              ?.sort((a, b) => new Date(b) - new Date(a))
              ?.map((key, index) => (
                <div className="timeline-section" key={index}>
                  <TransitionGroup appear={true}>
                    <TimelineHead timeline={items[key][0]?.item} />
                    {items[key]?.map((item) => (
                      <Collapse key={item?.id}>
                        <TimelineItem
                          key={item.id}
                          timeline={item}
                          fromNavbar={fromNavbar}
                          closeSidePanel={closeSidePanel}
                        />
                      </Collapse>
                    ))}
                  </TransitionGroup>
                </div>
              ))}
          </ul>
          {pagination.page < pagination?.totalPages && (
            <ButtonIcon
              classnames="view-more-btn button-pill btn-pill btn-sm"
              color="primary"
              label="View more"
              loading={loader}
              onclick={() => {
                setLoader(true);
                setPagination((prevState) => ({
                  ...prevState,
                  page: prevState.page + 1,
                }));
              }}
            />
          )}
        </div>
      ) : (
        <NoDataFound
          icon={selectedFilter.name === 'All' ? 'history' : selectedFilter.icon}
          title={
            <div className="font-normal font-size-sm2 text-gray-search">
              {selectedFilter.name === 'All' ? (
                "This record doesn't have any history."
              ) : (
                <>
                  This record doesn&apos;t have any{' '}
                  {selectedFilter.name.toLowerCase()}.
                </>
              )}
            </div>
          }
          containerStyle="text-gray-search my-6 py-6"
        />
      )}
    </>
  );
};

const ActivityTimeline = ({
  type = 'organization',
  id,
  containerClasses = {
    header: 'card-header rounded-0 justify-content-between p-3 pt-0',
    body: 'card-body',
  },
  showFilter = true,
  closeSidePanel = () => {},
  staticDisplay,
  extraFilters = {},
}) => {
  const [timelineFilter, setTimelineFilter] = useState(timelineFiltersList[0]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedPagination, setFeedPagination] = useState({ page: 1, limit: 15 });
  const [paginationLoader, setPaginationLoader] = useState(false);

  const mergeFeeds = (setOne, setTwo) => {
    const combinedSet = { ...setOne, ...setTwo };
    for (const key in combinedSet) {
      if (setOne[key] && setTwo[key]) {
        combinedSet[key] = [...setOne[key], ...setTwo[key]];
      }
    }
    return combinedSet;
  };

  const getActivityFeed = async () => {
    if (!id) {
      return;
    }

    if (!paginationLoader) {
      setLoading(true);
    }
    const params = {
      [`${type}Id`]: id,
      orderBy: 'created_at',
      typeOrder: 'DESC',
      type: timelineFilter.filter,
      ...extraFilters,
    };
    try {
      if (staticDisplay) {
        const groups = staticDisplay.feed.reduce((groups, item) => {
          const date = item.created_at.split('T')[0];
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push({
            fullDate: item.created_at,
            item,
          });
          return groups;
        }, {});

        const feedItems = paginationLoader
          ? mergeFeeds(activityFeed, groups)
          : groups;
        setActivityFeed(feedItems);
        setFeedPagination(staticDisplay.pagination);
      } else {
        const { feed, pagination } = await feedService.getActivityFeed(
          params,
          feedPagination
        );
        // grouping feed data on created_at
        const groups = feed.reduce((groups, item) => {
          const date = item.created_at.split('T')[0];
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push({
            fullDate: item.created_at,
            item,
          });
          return groups;
        }, {});

        const feedItems = paginationLoader
          ? mergeFeeds(activityFeed, groups)
          : groups;
        setActivityFeed(feedItems);
        setFeedPagination(pagination);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setPaginationLoader(false);
    }
  };

  useEffect(() => {
    getActivityFeed();
  }, [timelineFilter, feedPagination?.page, id]);

  return (
    <div className="border-0 shadow-none rounded-0">
      {showFilter && (
        <div className={containerClasses.header}>
          <h5 className="mb-0">History</h5>
          <ButtonFilterDropdown
            buttonText="Timeline"
            options={timelineFiltersList}
            icon="filter_list"
            filterOptionSelected={timelineFilter}
            handleFilterSelect={(e, item) => {
              setTimelineFilter(item);
              setFeedPagination((prevState) => ({
                ...prevState,
                page: 1,
              }));
            }}
          />
        </div>
      )}
      <div className={containerClasses.body}>
        {loading ? (
          <div className="pt-2">
            <Skeleton count={3} height={10} className={'mb-2'} />
          </div>
        ) : (
          <Timeline
            items={activityFeed}
            loader={paginationLoader}
            pagination={feedPagination}
            setLoader={setPaginationLoader}
            setPagination={setFeedPagination}
            fromNavbar={!showFilter}
            selectedFilter={timelineFilter}
            closeSidePanel={closeSidePanel}
          />
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
