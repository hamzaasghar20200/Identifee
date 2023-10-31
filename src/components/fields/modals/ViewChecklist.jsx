import RightSlidingDrawer from '../../modal/RightSlidingDrawer';
import React, { useEffect, useState } from 'react';
import {
  ChecklistStatuses,
  checklistTimelineStaticData,
  getChecklist,
  getChecklistStatus,
  saveChecklist,
} from '../../../utils/checklist.constants';
import ButtonIcon from '../../commons/ButtonIcon';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Label,
  Row,
} from 'reactstrap';
import MaterialIcon from '../../commons/MaterialIcon';
import AnimatedTabs from '../../commons/AnimatedTabs';
import { overflowing, removeBodyScroll } from '../../../utils/Utils';
import ChecklistStatus from '../../checklist/ChecklistStatus';
import IdfUploadFiles from '../../idfComponents/idfUploadFiles/IdfUploadFiles';
import ActivityTimeline from '../../ActivityTimeline/ActivityTimeline';
import ChecklistItems from '../../checklist/ChecklistItems';
import Alert from '../../Alert/Alert';
import AlertWrapper from '../../Alert/AlertWrapper';
import NoDataFoundTitle from '../NoDataFoundTitle';
import NoDataFound from '../../commons/NoDataFound';
import { ShortDescription } from '../../ShortDescription';
import AddNote from '../../peopleProfile/contentFeed/AddNote';
import { NoteItem } from '../../steps/NotesItem';
import { ProgressBar } from 'react-bootstrap';

const Overview = ({ organization, checklist }) => {
  const [openNote, setOpenNote] = useState(false);
  const [, setRefreshRecentFiles] = useState(false);
  const [allNotes] = useState([]);
  const [completedItemsPercentage, setCompletedItemsPercentage] = useState(0);
  const [localChecklist, setLocalChecklist] = useState(checklist);

  useEffect(() => {
    if (localChecklist?.items?.length) {
      const total = localChecklist.items.length;
      const completed = localChecklist.items.filter(
        (it) => it.status.value === ChecklistStatuses.Completed.value
      ).length;
      const percentage = Math.round((completed / total) * 100);
      if (percentage >= 100) {
        setLocalChecklist({
          ...localChecklist,
          status: ChecklistStatuses.Completed,
        });
      }
      setCompletedItemsPercentage(percentage);
    }
  }, [localChecklist?.items]);

  useEffect(() => {
    setLocalChecklist(checklist);
  }, [checklist]);

  return (
    <>
      <Card className="mb-3">
        <CardBody>
          <Row className="align-items-center pb-2">
            <Col md={5}>
              <h5 className="mb-0">Status</h5>
            </Col>
            <Col md={7}>
              <div className="d-flex w-100 align-items-center gap-2">
                <div
                  className="flex-fill"
                  style={{
                    borderRadius: 'var(--borderRadius)',
                    background: 'var(--lightGreyColor)',
                  }}
                >
                  <ProgressBar
                    style={{ height: 8 }}
                    isChild={true}
                    now={completedItemsPercentage || 0}
                    max={100}
                    className={'progress-bar-green'}
                    key={1}
                  />
                </div>
                <ChecklistStatus
                  item={{
                    ...localChecklist,
                    status: getChecklistStatus(localChecklist),
                  }}
                />
              </div>
            </Col>
          </Row>
          <Row className="align-items-center py-2">
            <Col md={5}>
              <h5 className="mb-0">Due Date</h5>
            </Col>
            <Col md={7}>09/01/2023</Col>
          </Row>
          <Row className="align-items-center py-2">
            <Col md={5}>
              <h5 className="mb-0">Recurring</h5>
            </Col>
            <Col md={7}>{checklist?.recurring?.name}</Col>
          </Row>
          <Row className="align-items-center py-2">
            <Col md={5}>
              <h5 className="mb-0">Related to</h5>
            </Col>
            <Col md={7}>{organization?.name}</Col>
          </Row>
          <Row className="align-items-center py-2">
            <Col md={5}>
              <h5 className="mb-0">Message</h5>
            </Col>
            <Col md={7}>
              {checklist?.clientMessage ? (
                <>
                  <ShortDescription
                    content={checklist?.clientMessage}
                    limit={30}
                    align="right-0"
                  />
                </>
              ) : (
                <NoDataFound
                  icon="message"
                  iconStyle="font-size-3em"
                  containerStyle="text-gray-search my-1 py-1"
                  title={<NoDataFoundTitle clazz="fs-7" str={`No message.`} />}
                />
              )}
            </Col>
          </Row>
          <ChecklistItems
            checklist={checklist}
            setChecklist={(chk) => setLocalChecklist(chk)}
          />

          <FormGroup row className="align-items-center border-top mt-3">
            <Label
              md={12}
              className="text-left font-size-sm font-weight-bold pb-0"
            >
              Notes
            </Label>
            <Col md={12}>
              <AddNote
                getNotes={() => {}}
                from={openNote}
                activityId={{}}
                setOverlay={setOpenNote}
                placeholder={() => (
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
                )}
              />
            </Col>
          </FormGroup>
          {allNotes?.length ? (
            <>
              {allNotes?.map((item) => (
                <NoteItem
                  activityPerantId={{}}
                  data={item}
                  refreshFeed={setRefreshRecentFiles}
                  getNotes={() => {}}
                  key={item?.id}
                  feedId={item?.id}
                  me={{}}
                />
              ))}
            </>
          ) : (
            <NoDataFound
              icon="subject"
              title={
                <div className="font-normal font-size-sm2 text-gray-search">
                  This record doesn&apos;t have any Notes.
                </div>
              }
              containerStyle="text-gray-search py-6"
            />
          )}
        </CardBody>
      </Card>
    </>
  );
};

const ChecklistTimeline = ({ organization }) => {
  return (
    <Card>
      <CardBody className="p-0">
        <ActivityTimeline
          id={organization?.id || 'abc123'}
          type="organization"
          showFilter={false}
          staticDisplay={checklistTimelineStaticData}
        />
      </CardBody>
    </Card>
  );
};

const ChecklistFiles = ({ organization }) => {
  const [openFilesModal, setOpenFilesModal] = useState(false);
  const [fileInput, setFileInput] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Card>
      <CardBody>
        <IdfUploadFiles
          fileInput={fileInput}
          setFileInput={setFileInput}
          setIsLoading={setIsLoading}
          loading={isLoading}
          organizationId={organization?.id}
          openFilesModal={openFilesModal}
          setOpenFilesModal={setOpenFilesModal}
          publicPage={true}
        />
      </CardBody>
    </Card>
  );
};

const ChecklistTabs = {
  Overview: 1,
  Timeline: 2,
  Files: 3,
};

const setItemsStatus = (checklist, mockChecklist, readonly) => {
  let newItems =
    mockChecklist && mockChecklist?.items ? [...mockChecklist.items] : [];
  if (checklist?.status?.value === ChecklistStatuses.Completed.value) {
    newItems = newItems.map((s) => ({
      ...s,
      status: ChecklistStatuses.Completed,
    }));
  } else {
    if (readonly) {
      newItems = newItems.map((s) => ({
        ...s,
        status: checklist.status,
      }));
    }
  }

  return { ...checklist, ...mockChecklist, items: newItems };
};

const ViewChecklist = ({
  organization,
  openModal,
  setOpenModal,
  checklist,
  readonly,
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const mockChecklist = getChecklist();
  const checklistFromStorage =
    { ...setItemsStatus(checklist, mockChecklist, readonly), ...checklist } ||
    mockChecklist;
  const [activeTab, setActiveTab] = useState(ChecklistTabs.Overview);
  const toggle = (tab) => {
    if (activeTab !== tab.tabId) {
      setActiveTab(tab.tabId);
    }
  };
  const tabsData = [
    {
      title: 'Overview',
      key: ChecklistTabs.Overview,
      component: (
        <Overview
          organization={organization}
          checklist={checklistFromStorage}
        />
      ),
      tabId: ChecklistTabs.Overview,
    },
    {
      title: 'Timeline',
      key: ChecklistTabs.Timeline,
      component: (
        <ChecklistTimeline
          checklist={checklistFromStorage}
          organization={organization}
          activeTab={activeTab}
        />
      ),
      tabId: ChecklistTabs.Timeline,
    },
    {
      title: 'Files',
      key: ChecklistTabs.Files,
      component: (
        <ChecklistFiles
          checklist={checklistFromStorage}
          organization={organization}
        />
      ),
      tabId: ChecklistTabs.Files,
    },
  ];

  const markAsCompleted = () => {
    const items = mockChecklist.items;
    const newItems = items.map((it) => ({
      ...it,
      status: ChecklistStatuses.Completed,
    }));
    const checklistObject = getChecklist();
    const updatedChecklist = {
      ...checklistObject,
      items: newItems,
      status: ChecklistStatuses.Completed,
    };
    saveChecklist(updatedChecklist);
    setSuccessMessage('Checklist completed.');
    setOpenModal(false);
  };

  useEffect(() => {
    if (openModal) {
      removeBodyScroll();
    } else {
      overflowing();
    }
  }, [openModal]);
  return (
    <>
      <AlertWrapper className="alert-position">
        <Alert
          color="success"
          message={successMessage}
          setMessage={setSuccessMessage}
        />
      </AlertWrapper>
      <RightSlidingDrawer
        open={openModal}
        toggleDrawer={() => {
          setOpenModal(false);
        }}
      >
        <Card className="p-0 h-100 shadow-none border-0" style={{ width: 600 }}>
          <CardHeader className="justify-content-between gap-2 align-items-center">
            <h3 className="mb-0">{checklistFromStorage?.title}</h3>
            <div className="d-flex align-items-center justify-content-between gap-2">
              {checklistFromStorage?.status?.value ===
                ChecklistStatuses.Completed.value ||
              getChecklistStatus(mockChecklist)?.value ===
                ChecklistStatuses.Completed.value ? (
                <p className="mb-0">&nbsp;</p>
              ) : (
                <ButtonIcon
                  color="success"
                  icon=""
                  label="Complete Checklist"
                  classnames="py-1 font-weight-semi-bold px-4 rounded-pill"
                  onclick={markAsCompleted}
                />
              )}
              <a
                className="icon-hover-bg cursor-pointer"
                onClick={() => {
                  setOpenModal(false);
                }}
              >
                <MaterialIcon icon="close" clazz="font-size-xl" />{' '}
              </a>
            </div>
          </CardHeader>
          <CardBody className="h-100 bg-gray-5 overflow-y-auto">
            <AnimatedTabs
              tabsData={tabsData}
              activeTab={activeTab}
              toggle={toggle}
              tabActiveClass={'active mb-0'}
            />
            {tabsData.find((item) => item.tabId === activeTab)?.component}
          </CardBody>
        </Card>
      </RightSlidingDrawer>
    </>
  );
};

export default ViewChecklist;
