import React, { useEffect, useState } from 'react';
import {
  CardBody,
  Col,
  FormGroup,
  Label,
  TabContent,
  TabPane,
} from 'reactstrap';
import RightPanelModal from '../modal/RightPanelModal';
import AddNote from '../peopleProfile/contentFeed/AddNote';
import {
  RIGHT_PANEL_WIDTH,
  DATE_FORMAT,
  dateWithoutTZ,
  overflowing,
  // overflowing,
} from '../../utils/Utils';
import MaterialIcon from '../commons/MaterialIcon';
import routes from '../../utils/routes.json';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { NoteItem } from '../steps/NotesItem';
import feedService from '../../services/feed.service';
import NoDataFound from '../commons/NoDataFound';
import AddFile from '../peopleProfile/contentFeed/AddFile';
import { useProfileContext } from '../../contexts/profileContext';
import Avatar from '../Avatar';
import AnimatedTabs from '../../components/commons/AnimatedTabs';
import userService from '../../services/user.service';
import ButtonIcon from '../commons/ButtonIcon';
import fieldService from '../../services/field.service';
import activityService from '../../services/activity.service';
import IdfTooltip from '../idfComponents/idfTooltip';
import AddActivity from '../peopleProfile/contentFeed/AddActivity';
import Loading from '../Loading';
// import AddActivity from '../peopleProfile/contentFeed/AddActivity';
// import Loading from '../Loading';
export const ActivityDetail = ({
  isShow,
  setIsShow,
  data,
  activityDetail,
  markAsDone,
  refreshFeed,
  errorMessage,
  setErrorMessage,
  showActivity,
  isFieldsData,
  successMessage,
  setGetActivityId,
  setIsBtnType,
  setActivityData,
  setSuccessMessage,
  tableActions,
  loading,
  activityData,
  btnType,
  getActivityId,
  setShowActivity,
}) => {
  const { profileInfo } = useProfileContext();
  const [openNote, setOpenNote] = useState(false);
  const [refreshRecentFiles, setRefreshRecentFiles] = useState(false);
  const [allNotes, setAllNotes] = useState([]);
  const [done, setDone] = useState(data?.done);
  const [activeTab, setActiveTab] = useState(1);
  const [modifiedUser, setModifiedUser] = useState('');
  const [customFieldsData, setCustomFieldsData] = useState({});

  const [customInformationSection, setCustomInformationSection] = useState({});
  const notePlaceholder = (
    <div
      className="text-muted"
      style={{
        backgroundColor: 'white',
        position: 'absolute',
        marginLeft: '1px',
      }}
    >
      {openNote ? '' : "What's this note about?"}
    </div>
  );
  const closeModal = () => {
    setShowActivity(false);
    setGetActivityId();
    setIsBtnType('');
    setActivityData({});
    overflowing();
  };
  const getNotes = async () => {
    const notes = await feedService.getNote(
      { activityId: data?.id },
      { page: 1, limit: 15 }
    );
    setAllNotes(notes?.data);
  };

  useEffect(() => {
    if (refreshRecentFiles) {
      getNotes();
    }
  }, [refreshRecentFiles]);
  useEffect(() => {
    try {
      userService.getUserById(data?.modified_user_id).then((userModified) => {
        setModifiedUser(
          `${userModified?.first_name} ${userModified.last_name} on ${moment(
            data?.update_at
          ).format(DATE_FORMAT)}`
        );
      });
    } catch (err) {
      console.error(err);
    }
  }, []);
  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      getNotes();
    }
  }, [data]);
  const MESSAGES = {
    note: "This record doesn't have any notes.",
    activity: "This record doesn't have any activities.",
    files: "This record doesn't have any files.",
  };
  const ownerTitle = (profile) => {
    if (profile.external) {
      return profile.email;
    }
    return `${profile.first_name} ${profile.last_name}`;
  };
  const getCustomFieldValue = (field_type, value) => {
    let val = '';
    switch (field_type) {
      case 'CURRENCY':
        return value.substring(1);
      case 'PICKLIST':
        return value[0]?.value;
      case 'PICKLIST_MULTI':
        value.map((item) => (val = val + ', ' + item.value));
        return val.substring(1);
      default:
        return value;
    }
  };
  const getCustomFieldsData = async () => {
    const response = await fieldService.getFields(data?.type, {
      usedField: true,
    });

    const {
      data: { data: customFields },
    } = await activityService.getCustomField(data?.id, {
      page: 1,
      limit: 50,
    });

    let customValues = {};
    let informationValues = {};

    response?.data?.forEach((field) => {
      if (field.isCustom && customFields) {
        customFields.forEach((item) => {
          if (
            field.key === item.field?.key &&
            field.field_type !== 'DATE' &&
            item.value
          ) {
            if (field.section === 'Call Information') {
              informationValues = {
                ...informationValues,
                [field.key]: getCustomFieldValue(field.field_type, item.value),
              };
            } else {
              customValues = {
                ...customValues,
                [field.key]: getCustomFieldValue(field.field_type, item.value),
              };
            }
          } else if (
            field.key === item.field?.key &&
            field.field_type === 'DATE' &&
            item.value
          ) {
            if (field.section === 'Call Information') {
              informationValues = {
                ...informationValues,
                [field.key]: dateWithoutTZ(item.value),
              };
            } else {
              customValues = {
                ...customValues,
                [field.key]: dateWithoutTZ(item.value),
              };
            }
          }
        });
      }
    });

    setCustomInformationSection(informationValues);
    setCustomFieldsData(customValues);
  };
  const loader = () => {
    if (loading) return <Loading />;
  };
  useEffect(() => {
    getCustomFieldsData();
  }, []);
  const tabsData = [
    {
      title: 'Information',
      key: 'information',
      component: (
        <div className="px-3">
          {data?.description && (
            <FormGroup row className="align-items-start">
              <Label
                md={3}
                className="text-left font-size-sm py-0 font-weight-bold px-0"
              >
                Description{' '}
              </Label>
              <Col md={9} className="pl-0">
                {data?.description}
              </Col>
            </FormGroup>
          )}
          <FormGroup row className="align-items-center">
            <Label
              md={3}
              className="text-left font-size-sm font-weight-bold px-0"
            >
              Due Date
            </Label>
            <Col md={9} className="pl-0">
              {dateWithoutTZ(data?.start_date)}
            </Col>
          </FormGroup>
          <FormGroup row className="align-items-center">
            <Label
              md={3}
              className="text-left font-size-sm font-weight-bold px-0"
            >
              Priority
            </Label>
            <Col md={9} className="pl-0">
              {data?.priority ? (
                <div className="d-flex align-items-center">
                  <MaterialIcon
                    filled={true}
                    icon="flag"
                    clazz="text-red pr-1 ml-n1"
                  />
                  High
                </div>
              ) : (
                'Normal'
              )}
            </Col>
          </FormGroup>
          <FormGroup row className="align-items-center">
            <Label
              md={3}
              className="text-left font-size-sm font-weight-bold px-0"
            >
              {data.type === 'call' ? 'Customer Name' : 'Related To'}
            </Label>
            <Col md={9} className="pl-0">
              {data?.organization ? (
                <Link
                  to={`${routes.companies}/${data?.organization?.id}/organization/profile`}
                  className="text-black fw-bold"
                >
                  {data?.organization && (
                    <>
                      <MaterialIcon icon="domain" /> {data?.organization?.name}
                    </>
                  )}
                </Link>
              ) : data?.deal ? (
                <Link
                  to={`${routes.dealsPipeline}/${data?.deal?.id}`}
                  className="text-black fw-bold"
                >
                  {data?.deal && (
                    <>
                      <MaterialIcon icon="monetization_on" /> {data?.deal?.name}
                    </>
                  )}
                </Link>
              ) : data?.contact ? (
                <Link
                  to={`${routes.contacts}/${data?.contact?.id}/profile`}
                  className="text-black fw-bold"
                >
                  {data && (
                    <>
                      <MaterialIcon icon="people" />{' '}
                      {`${data?.contact?.first_name} ${data?.contact?.last_name}`}
                    </>
                  )}
                </Link>
              ) : (
                ''
              )}
            </Col>
          </FormGroup>
          {data?.type !== 'event' && (
            <FormGroup row className="align-items-center">
              <Label
                md={3}
                className="text-left font-size-sm font-weight-bold px-0"
              >
                Status
              </Label>
              <Col md={9} className="pl-0">
                {done ? 'Completed' : 'In Progress'}
              </Col>
            </FormGroup>
          )}
          <FormGroup row className="align-items-center">
            <Label
              md={3}
              className="text-left font-size-sm font-weight-bold px-0"
            >
              Last Modified
            </Label>
            <Col md={9} className="pl-0">
              {modifiedUser}
            </Col>
          </FormGroup>

          {Object.entries(customInformationSection)?.map(([key, value]) => (
            <FormGroup row className="align-items-center" key={key}>
              <Label
                md={3}
                className="text-left font-size-sm font-weight-bold text-capitalize px-0"
              >
                {key}
              </Label>
              <Col md={9} className="pl-0">
                {value}
              </Col>
            </FormGroup>
          ))}

          {Object.entries(customFieldsData)?.length > 0 && (
            <FormGroup row className="align-items-center">
              <Label
                md={12}
                className="text-left font-size-lg font-weight-bold px-0"
              >
                Additional Information
              </Label>
            </FormGroup>
          )}

          {Object.entries(customFieldsData)?.map(([key, value]) => (
            <FormGroup row className="align-items-center" key={key}>
              <Label
                md={3}
                className="text-left pl-0 font-size-sm font-weight-bold text-capitalize px-0"
              >
                {key}
              </Label>
              <Col md={9} className="pl-0">
                {value}
              </Col>
            </FormGroup>
          ))}
          <FormGroup row className="align-items-center border-top mt-3">
            <Label
              md={12}
              className="text-left font-size-sm font-weight-bold px-0 pb-0"
            >
              Notes
            </Label>
            <Col md={12} className="px-0">
              <AddNote
                getNotes={getNotes}
                from={openNote}
                activityId={data?.id}
                setOverlay={setOpenNote}
                placeholder={notePlaceholder}
              />
            </Col>
          </FormGroup>
          {allNotes?.length ? (
            <>
              {allNotes?.map((item) => (
                <NoteItem
                  activityPerantId={data?.id}
                  data={item}
                  refreshFeed={setRefreshRecentFiles}
                  getNotes={getNotes}
                  key={item?.id}
                  feedId={item?.id}
                  me={profileInfo}
                />
              ))}
            </>
          ) : (
            <NoDataFound
              icon="sticky_note_2"
              title={
                <div className="font-normal font-size-sm2 text-gray-search">
                  {MESSAGES.note}
                </div>
              }
              containerStyle="text-gray-search py-6"
            />
          )}
        </div>
      ),
      tabId: 1,
    },
    {
      title: 'Files',
      key: 'file',
      component: (
        <>
          <FormGroup>
            <AddFile
              classNames=""
              activityId={data?.id}
              me={profileInfo}
              // publicPage={true}
              getProfileInfo={profileInfo}
              activityDetail={activityDetail}
              refreshRecentFiles={refreshRecentFiles}
              setRefreshRecentFiles={setRefreshRecentFiles}
              fromActivity={true}
              noFilesMessage={
                <NoDataFound
                  icon="note_stack"
                  iconSymbol={true}
                  title={
                    <div className="font-normal font-size-sm2 text-gray-search">
                      {MESSAGES.files}
                    </div>
                  }
                  containerStyle="text-gray-search py-6"
                />
              }
            />
          </FormGroup>
        </>
      ),
      tabId: 2,
    },
  ];
  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
    }
  };
  return (
    <>
      <RightPanelModal
        showModal={isShow}
        setShowModal={setIsShow}
        showOverlay={true}
        containerBgColor={'pb-0'}
        containerWidth={RIGHT_PANEL_WIDTH}
        containerPosition={'position-fixed'}
        headerBgColor="bg-gray-5"
        Title={
          <>
            <div className="d-flex justify-content-between">
              <div>
                <div className="d-flex align-items-center mb-2 mt-2 text-capitalize">
                  <>
                    {data?.name?.length > 20 ? (
                      <IdfTooltip text={data.name} placement="bottom">
                        {data?.name.substring(0, 20)}
                        {data?.name.length >= 20 && '...'}
                      </IdfTooltip>
                    ) : (
                      <>{data?.name}</>
                    )}
                  </>
                </div>
                <div className="d-flex gap-1 align-items-center">
                  {data?.owners?.map((item, i) => (
                    <div
                      className={
                        i > 0
                          ? 'd-flex align-items-center gap-1'
                          : 'd-flex align-items-center gap-1'
                      }
                      key={`${item}`}
                    >
                      <Avatar
                        user={item}
                        defaultSize={'xs'}
                        sizeIcon={'avatar-light xs'}
                      />
                      <Label className="font-size-sm font-weight-normal mb-0">
                        {ownerTitle(item)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {data?.type !== 'event' && (
                  <div name="div2" className="py-2">
                    {done ? (
                      <ButtonIcon
                        color="white"
                        icon="check_circle"
                        label="Completed"
                        classnames="py-1 mr-2 cursor-default text-strikethrough font-weight-semi-bold px-4 rounded-pill text-success shadow"
                      />
                    ) : (
                      <ButtonIcon
                        color="success"
                        icon=""
                        label="Mark as Completed"
                        classnames="py-1 mr-2 font-weight-semi-bold px-4 rounded-pill"
                        onclick={async () => {
                          await markAsDone(data?.id);
                          setDone(true);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 w-100">
              <AnimatedTabs
                tabsData={tabsData}
                activeTab={activeTab}
                toggle={toggle}
                tabActiveClass={'active mb-0'}
              />
            </div>
          </>
        }
        fromActivity={true}
        tableActions={tableActions}
        activityObj={data}
      >
        <CardBody className="right-bar-vh overflow-y-auto">
          <TabContent className="w-100">
            <TabPane className="position-relative p-0">
              {tabsData.find((item) => item.tabId === activeTab)?.component}
            </TabPane>
          </TabContent>
        </CardBody>
      </RightPanelModal>

      {showActivity && (
        <RightPanelModal
          showModal={showActivity}
          setShowModal={() => closeModal()}
          showOverlay={true}
          containerBgColor={'pb-0'}
          containerWidth={RIGHT_PANEL_WIDTH}
          containerPosition={'position-fixed'}
          headerBgColor="bg-gray-5"
          Title={
            <div className="d-flex py-2 align-items-center text-capitalize">
              {Object.keys(data).length === 0 ? (
                <h3 className="mb-0">Add {btnType}</h3>
              ) : (
                <h3 className="mb-0">Edit {btnType}</h3>
              )}
            </div>
          }
        >
          {loading ? (
            loader()
          ) : (
            <AddActivity
              btnType={btnType}
              activityData={activityData}
              feedInfo={activityData}
              getProfileInfo={profileInfo}
              refreshFeed={refreshFeed}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
              getActivityId={getActivityId}
              isModal={isShow}
              setGetActivityId={setGetActivityId}
              feedId={getActivityId?.feed_id}
              dataType={
                data?.deal
                  ? 'deal'
                  : data?.contact
                  ? 'contact'
                  : data?.organization
                  ? 'organization'
                  : ''
              }
              deal={data?.deal}
              contactInfo={data?.contact}
              organization={data?.organization}
              organizationId={data?.organization?.id}
              allFields={isFieldsData}
              closeModal={() => closeModal()}
            />
          )}
        </RightPanelModal>
      )}
    </>
  );
};
