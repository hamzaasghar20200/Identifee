import React, { useEffect, useState } from 'react';

import StepItem from './StepItem';
// import feedService from '../../services/feed.service';
import AlertWrapper from '../Alert/AlertWrapper';
import Alert from '../Alert/Alert';
import AddActivity from '../peopleProfile/contentFeed/AddActivity';
import fieldService from '../../services/field.service';
import Skeleton from 'react-loading-skeleton';
import LoadMoreButton from '../lesson/LoadMoreButton';
import RightPanelModal from '../modal/RightPanelModal';
import { RIGHT_PANEL_WIDTH, capitalize, overflowing } from '../../utils/Utils';
import NoDataFound from '../commons/NoDataFound';
import MaterialIcon from '../commons/MaterialIcon';
import Collapse from '@mui/material/Collapse';
import { TransitionGroup } from 'react-transition-group';
import { groupBy } from 'lodash';
import activityService from '../../services/activity.service';
import feedService from '../../services/feed.service';

const Steps = ({
  fetchAll,
  contactId,
  organizationId,
  dealId,
  userId,
  isDeal,
  isContact,
  dataType,
  getProfileInfo,
  setRefreshRecentFiles,
  openActivityId,
  limit = 25,
  me,
  filteredBy,
  layout = 'old',
  layoutType,
  refresh,
  setRefresh,
  fromClientPortal,
  sharedById,
  showChatBox,
  chatBox,
}) => {
  const [activity, setActivity] = useState([]);
  const [activityData, setActivityData] = useState({});
  const [deal, setDeal] = useState({});
  const [organization, setOrganization] = useState({});
  const [contact, setContact] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [showModalActivity, setShowModalActivity] = useState(false);
  const [isFieldsData, setIsFieldsData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const getActivity = async (
    page = pagination.page,
    total = pagination.limit,
    done = true,
    fromLoadMore
  ) => {
    if (!fromLoadMore) {
      setLoading(true);
    }
    const params = {
      ...filteredBy,
      userId,
    };

    if (isDeal) {
      params.dealId = dealId;
    } else if (isContact) {
      params.contactId = contactId;
    } else {
      params.organizationId = organizationId;
    }
    params.orderBy = 'created_at';
    params.typeOrder = 'DESC';
    try {
      let result;
      if (layoutType === 'activity') {
        result = await activityService.getActivity(params, {
          page: page || 1,
          limit: total || 10,
        });
        setActivity(result?.data);
      } else {
        result = await feedService.getNote(params, {
          page: page || 1,
          limit: total || 10,
        });
        setActivity(result?.data);
      }
      setPagination(result);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const groupBySection = (fieldsList) => {
    setIsFieldsData(groupBy(fieldsList, 'section'));
  };
  const EditFields = async (item) => {
    const fieldsData = await fieldService.getFields(item, {
      usedField: true,
    });
    groupBySection(fieldsData?.data);
  };
  const getActivityById = async (activityId) => {
    try {
      const result = await activityService.getSingleActivity(activityId);
      EditFields(result?.data?.type);
      setDeal(result?.data?.deal);
      setOrganization(result?.data?.organization);
      setContact(result?.data?.contact);
      const { data } = await fieldService.getFields(result?.data?.type, {
        usedField: true,
      });
      const {
        data: { data: customFields },
      } = await activityService.getCustomField(result?.data?.id, {
        page: 1,
        limit: 50,
      });
      let customValues = {};
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
      customValues = { ...result?.data, ...customValues };
      setActivityData(customValues);
      setShowModalActivity(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (filteredBy) {
      getActivity();
    }
  }, [filteredBy]);

  useEffect(() => {
    if (openActivityId) {
      getActivityById(openActivityId);
    }
  }, [openActivityId]);

  useEffect(() => {
    if (refresh > 0) {
      getActivity();
    }
  }, [refresh]);

  const handleShowChat = (val) => {
    setActivityIndex(val);
    setShowChat(true);
    showChatBox({ type: 'Selected' });
  };

  const handleAddNewChat = () => {
    setActivityIndex('');
    setShowChat(false);
    showChatBox({ type: 'NEW' });
  };

  const renderStepItemContent = (typeFeed, activities, paginationData) => {
    const messageInput = fromClientPortal ? !chatBox.type : '';
    return (
      <div className="w-100">
        {loading && messageInput ? (
          <div className="pt-2" style={{ marginTop: 60 }}>
            <Skeleton count={5} height={10} className={'mb-2'} />
          </div>
        ) : (
          <>
            <>
              {fromClientPortal ? (
                <>
                  <div className="row justify-content-center">
                    <div className="col-xxl-3 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12 position-relative">
                      <span
                        className="add-new-chat font-weight-medium fs-7 d-flex gap-1 align-items-center"
                        onClick={handleAddNewChat}
                      >
                        <MaterialIcon icon="add_circle" /> Add New
                      </span>
                      <div className="chat-listing conversation-notes">
                        {activities.map((item, index) => (
                          <div
                            className={
                              `card chat-msg rounded chat-titles mb-2 p-3 cursor-pointer d-flex flex-row gap-2 align-items-center` +
                              (showChat && index === activityIndex
                                ? ' active'
                                : '')
                            }
                            key={index}
                            onClick={() => handleShowChat(index)}
                          >
                            <MaterialIcon icon="chat" />
                            <div className="text">
                              <div
                                className="fs-7 font-weight-medium mb-0 text-truncate"
                                style={{ width: 200 }}
                              >
                                {item?.note?.blocks[0]?.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-xxl-9 col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      {showChat ? (
                        <div
                          className={
                            `comment-listing conversation-notes` +
                            (showChat ? ' active' : '')
                          }
                        >
                          <StepItem
                            key={activities[activityIndex].id}
                            feedId={activities[activityIndex].id}
                            getProfileInfo={getProfileInfo}
                            data={activities[activityIndex]}
                            setSuccessMessage={setSuccessMessage}
                            setErrorMessage={setErrorMessage}
                            isDeal={isDeal}
                            isContact={isContact}
                            dataType={dataType}
                            setRefreshRecentFiles={setRefreshRecentFiles}
                            ids={{ contactId, organizationId, dealId }}
                            deal={activities[activityIndex].deal}
                            organization={
                              activities[activityIndex].organization
                            }
                            organizationId={organizationId}
                            me={me}
                            layout={layout}
                            layoutType={layoutType}
                            handleEditActivity={(activityId) => {
                              getActivityById(activityId);
                            }}
                            refreshFeed={() => {
                              setRefresh((prevState) => prevState + 1);
                            }}
                            fromClientPortal={fromClientPortal}
                            sharedById={sharedById}
                          />
                        </div>
                      ) : (
                        <NoDataFound
                          icon="comment"
                          containerStyle="text-muted my-3 py-6"
                          title={
                            'Please select a chat from left or you can create by clicking the "Add New" button.'
                          }
                        />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <ul className="step step-icon-sm mt-0">
                  <TransitionGroup appear={true}>
                    {activities.map((item) => (
                      <Collapse key={item?.id} className="w-100">
                        <StepItem
                          key={item.id}
                          feedId={item.id}
                          getProfileInfo={getProfileInfo}
                          data={item}
                          setSuccessMessage={setSuccessMessage}
                          setErrorMessage={setErrorMessage}
                          isDeal={isDeal}
                          isContact={isContact}
                          dataType={dataType}
                          setRefreshRecentFiles={setRefreshRecentFiles}
                          ids={{ contactId, organizationId, dealId }}
                          deal={item.deal}
                          organization={item.organization}
                          organizationId={organizationId}
                          me={me}
                          layout={layout}
                          layoutType={layoutType}
                          handleEditActivity={(activityId) => {
                            getActivityById(activityId);
                          }}
                          refreshFeed={() => {
                            setRefresh((prevState) => prevState + 1);
                          }}
                          sharedById={sharedById}
                        />
                      </Collapse>
                    ))}
                  </TransitionGroup>
                </ul>
              )}
            </>
            <LoadMoreButton
              loading={paginationLoading}
              pagination={paginationData}
              btnContainerStyle="mt-2 mb-0"
              list={activities}
              onClick={() => onHandleChangePage(typeFeed, paginationData)}
            />
          </>
        )}
      </div>
    );
  };

  const onHandleChangePage = async (done, paginationData) => {
    const limitPage = done ? limit : 5;
    setPaginationLoading(true);
    try {
      await getActivity(
        '',
        paginationData.page,
        paginationData.limit + limitPage,
        done,
        true
      );
    } catch (e) {
      console.log(e);
    } finally {
      setPaginationLoading(false);
    }
  };

  const MESSAGES = {
    note: { msg: "This record doesn't have any notes.", icon: 'sticky_note_2' },
    activity: {
      msg: "This record doesn't have any activities.",
      icon: 'event',
    },
  };
  return (
    <div>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          color="danger"
          setMessage={setErrorMessage}
        />
        <Alert
          message={successMessage}
          color="success"
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>

      {showModalActivity && (
        <RightPanelModal
          showModal={showModalActivity}
          setShowModal={() => {
            overflowing();
            setShowModalActivity(false);
          }}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center">
              <h3 className="mb-0">Edit {capitalize(activityData?.type)}</h3>
            </div>
          }
        >
          <AddActivity
            feedId={activityData?.id}
            componentId="edit-activity"
            dataType={dataType}
            contactId={contactId}
            btnType={activityData?.type}
            organizationId={organizationId}
            contactInfo={contact}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            dealId={dealId}
            allFields={isFieldsData}
            contactIs={organizationId ? 'organization' : 'profile'}
            getProfileInfo={getProfileInfo}
            profileRefresh={() => {
              getProfileInfo();
              setRefresh((prevState) => prevState + 1);
            }}
            isModal={true}
            closeModal={() => {
              overflowing();
              setShowModalActivity(false);
            }}
            activityData={activityData}
            feedInfo={activityData}
            organization={organization}
            deal={deal}
          />
        </RightPanelModal>
      )}
      <div>
        {renderStepItemContent(true, activity, pagination)}
        {!activity?.length && !loading && (
          <NoDataFound
            icon={MESSAGES[layoutType].icon}
            title={
              <div className="font-normal font-size-sm2 text-gray-search">
                {MESSAGES[layoutType].msg}
              </div>
            }
            containerStyle="text-gray-search my-6 py-6"
          />
        )}
      </div>
    </div>
  );
};

export default Steps;
