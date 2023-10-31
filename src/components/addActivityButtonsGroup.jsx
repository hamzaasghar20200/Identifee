import React, { useState } from 'react';
import AddActivity from './peopleProfile/contentFeed/AddActivity';
import fieldService from '../services/field.service';
import Loading from './Loading';
import RightPanelModal from './modal/RightPanelModal';
import { Card, CardBody, CardHeader } from 'reactstrap';
import ButtonFilterDropdown from './commons/ButtonFilterDropdown';
import ButtonIcon from './commons/ButtonIcon';
import Steps from './steps/Steps';
import { RIGHT_PANEL_WIDTH, overflowing } from '../utils/Utils';
import { groupBy } from 'lodash';
import AlertWrapper from './Alert/AlertWrapper';
import Alert from './Alert/Alert';
import { useProfileContext } from '../contexts/profileContext';
import ActivityChecklist from './checklist/ActivityChecklist';

const activityFiltersList = [
  { key: 'all', name: 'All Activities' },
  { key: 'open', name: 'Open Activities' },
  { key: 'closed', name: 'Closed Activities' },
];
export const AddActivityButtonsGroup = ({
  moduleMap,
  componentId,
  contactId,
  organizationId,
  dealId,
  profileRefresh,
  contactIs,
  contactInfo,
  setProfileInfo,
  dataType,
  deal,
  organization,
  setRefreshRecentFiles,
  activityIdOpen,
  me,
  step,
  isDeal,
  isContact,
  refresh,
  setRefresh,
}) => {
  const [isShow, setShowModal] = useState(false);
  const [btnType, setIsBtnType] = useState('');
  const { profileInfo } = useProfileContext();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldsBySection, setFieldsBySection] = useState([]);
  const [activityFilter, setActivityFilter] = useState(activityFiltersList[0]);
  const [filterBy, setFilterBy] = useState({ type: ['task', 'event', 'call'] });
  const groupBySection = (fieldsList) => {
    setFieldsBySection(groupBy(fieldsList, 'section'));
  };
  const getFields = async (type) => {
    setLoading(true);
    const { data } = await fieldService.getFields(type, {
      preferred: true,
    });
    if (data?.length > 0) {
      groupBySection(data);
      setLoading(false);
    } else {
      const { data } = await fieldService.createDefaultFields(type);
      groupBySection(data);
      setLoading(false);
    }
  };
  const handleShow = (item) => {
    getFields(item);
    setShowModal(true);
    setIsBtnType(item);
  };
  const closeModal = () => {
    setShowModal(false);
    setIsBtnType('');
  };
  const loader = () => {
    if (loading) return <Loading />;
  };

  return (
    <>
      <AlertWrapper>
        <Alert
          message={errorMessage}
          setMessage={setErrorMessage}
          color="danger"
        />
        <Alert
          message={successMessage}
          setMessage={setSuccessMessage}
          color="success"
        />
      </AlertWrapper>
      <Card className="p-0 border-0 rounded-0 shadow-0">
        <CardHeader className="justify-content-between px-3 pt-0">
          <ButtonFilterDropdown
            buttonText="Dashboards"
            options={activityFiltersList}
            filterOptionSelected={activityFilter}
            handleFilterSelect={(e, item) => {
              setActivityFilter(item);
              const { key } = item;
              if (key === 'all') {
                setFilterBy({ type: ['task', 'event', 'call'] });
              } else {
                setFilterBy({
                  type: ['task', 'event', 'call'],
                  done: key === 'closed',
                });
              }
            }}
            menuClass="drop-menu-card"
          />
          <div className="d-flex align-items-center gap-2">
            {['Task', 'Event', 'Call'].map((btn) => (
              <ButtonIcon
                key={btn}
                color="outline-primary"
                classnames="btn-sm rounded-pill pr-3 font-size-sm font-weight-medium"
                icon="add"
                onclick={() => handleShow(btn.toLowerCase())}
                label={btn
                  .replace(/Task/g, moduleMap.task.singular)
                  .replace(/Call/g, moduleMap.call.singular)
                  .replace(/Event/g, moduleMap.event.singular)}
              />
            ))}
          </div>
        </CardHeader>
        {!step && (
          <CardBody className={`p-0 ${step ? 'shadow-none' : ''}`}>
            <ActivityChecklist organization={organization} />
            <div className="p-3">
              <Steps
                organizationId={organizationId}
                getProfileInfo={profileRefresh}
                openActivityId={activityIdOpen}
                organization={organization}
                dataType={dataType}
                setRefreshRecentFiles={setRefreshRecentFiles}
                me={me}
                filteredBy={filterBy}
                layout="new"
                layoutType="activity"
                isDeal={isDeal}
                deal={deal}
                dealId={deal?.id}
                isContact={isContact}
                contactId={contactId}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            </div>
          </CardBody>
        )}
        {isShow && (
          <RightPanelModal
            showModal={isShow}
            setShowModal={() => closeModal()}
            showOverlay={true}
            containerBgColor={'pb-0'}
            containerWidth={RIGHT_PANEL_WIDTH}
            containerPosition={'position-fixed'}
            headerBgColor="bg-gray-5"
            Title={
              <div className="d-flex py-2 align-items-center text-capitalize">
                <h3 className="mb-0">
                  Add{' '}
                  {btnType
                    .replace(/task/g, moduleMap.task.singular)
                    .replace(/call/g, moduleMap.call.singular)
                    .replace(/event/g, moduleMap.event.singular)}
                </h3>
              </div>
            }
          >
            {loading ? (
              loader()
            ) : (
              <>
                {moduleMap.task && (
                  <AddActivity
                    moduleMap={moduleMap}
                    dataType={dataType}
                    btnType={btnType}
                    task={moduleMap.task.singular}
                    componentId={componentId}
                    contactId={contactId}
                    organizationId={organizationId}
                    dealId={dealId}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                    successMessage={successMessage}
                    setSuccessMessage={setSuccessMessage}
                    getProfileInfo={profileInfo}
                    profileRefresh={profileRefresh}
                    contactIs={contactIs}
                    isModal={isShow}
                    contactInfo={contactInfo}
                    profileInfo={setProfileInfo}
                    deal={deal}
                    allFields={fieldsBySection}
                    closeModal={() => {
                      overflowing();
                      closeModal();
                    }}
                    organization={organization}
                  />
                )}{' '}
              </>
            )}
          </RightPanelModal>
        )}
      </Card>
    </>
  );
};
