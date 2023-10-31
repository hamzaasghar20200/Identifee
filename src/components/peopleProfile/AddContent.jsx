import React, { useContext, useEffect, useState } from 'react';

import AddNote from './contentFeed/AddNote';
import AddFile from './contentFeed/AddFile';
import stringConstants from '../../utils/stringConstants.json';
import AddDataReport from './contentFeed/AddDataReport';
import { isModuleAllowed, isPermissionAllowed } from '../../utils/Utils';
import { AddActivityButtonsGroup } from '../addActivityButtonsGroup';
import Steps from '../steps/Steps';
import ActivityTimeline from '../ActivityTimeline/ActivityTimeline';
import DealProductsV2 from '../../views/Deals/pipelines/DealProductsV2';
import { TenantContext } from '../../contexts/TenantContext';
import AnimatedTabs from '../commons/AnimatedTabs';
import feedService from '../../services/feed.service';
import Skeleton from 'react-loading-skeleton';
import { PermissionsConstants } from '../../utils/permissions.constants';
import NoDataFound from '../commons/NoDataFound';

const constants = stringConstants.deals.contacts.profile;
const TABS = {
  Data: 1,
  Timeline: 2,
  Notes: 3,
  Activities: 4,
  Files: 5,
  Products: 6,
};

const AddContent = ({
  moduleMap,
  contactId,
  getProfileInfo,
  organizationId,
  dealId,
  getDeal,
  dataSection,
  setProfileInfo,
  contactIs,
  refreshRecentFiles,
  setRefreshRecentFiles,
  contactInfo,
  dataType,
  isPrincipalOwner,
  me,
  deal,
  organization,
  activityIdOpen,
  isDeal,
  isContact,
  fromOrganization,
}) => {
  const { tenant } = useContext(TenantContext);
  const [allNotes, setAllNotes] = useState();

  const [activeTab, setActiveTab] = useState(
    dataType === 'organization' &&
      (isModuleAllowed(
        tenant.modules,
        PermissionsConstants.ModulesReportNames.Treasury
      ) ||
        isModuleAllowed(
          tenant.modules,
          PermissionsConstants.ModulesReportNames.WorkingCapital
        ))
      ? TABS.Data
      : TABS.Timeline
  );
  const [openNote, setOpenNote] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const organizationTabs = [
    {
      tabId: TABS.Data,
      icon: 'text_snippet',
      title: 'Engagement',
      module: 'engagement',
    },
  ];
  const dealTabs = [
    {
      tabId: TABS.Products,
      icon: 'text_snippet',
      title: 'Products',
    },
  ];
  const contactTabs = [
    {
      tabId: TABS.Timeline,
      icon: 'text_snippet',
      title: 'Timeline',
    },
    {
      tabId: TABS.Notes,
      icon: 'text_snippet',
      title: constants.notesLabel,
    },
    {
      tabId: TABS.Activities,
      icon: 'event',
      title: 'Activities',
      module: 'activities',
    },
    {
      tabId: TABS.Files,
      icon: 'attachment',
      title: constants.filesLabel,
    },
  ];
  const tabsByType = {
    organization:
      isModuleAllowed(
        tenant.modules,
        PermissionsConstants.ModulesReportNames.Treasury
      ) ||
      isModuleAllowed(
        tenant.modules,
        PermissionsConstants.ModulesReportNames.WorkingCapital
      )
        ? [...organizationTabs, ...contactTabs]
        : [...contactTabs],
    contact: [...contactTabs],
    deal: [...contactTabs, ...dealTabs],
  };
  const [tabs] = useState(tabsByType[dataType]);

  const notePlaceholder = (
    <div
      className="cursor-pointer text-muted"
      style={{ backgroundColor: 'white' }}
    >
      {openNote ? '' : 'Start writing a note...'}
    </div>
  );

  const handleRefreshFeed = () => {
    setRefresh((prevState) => prevState + 1);
  };
  const getNotes = async () => {
    const notes = await feedService.getNote(
      { organizationId },
      { page: 1, limit: 15 }
    );
    setAllNotes(notes?.data);
  };
  useEffect(() => {
    getNotes();
  }, []);
  const renderContent = () => {
    if (activeTab === TABS.Data) {
      return (
        <>
          {isPermissionAllowed('reports', 'create') ? (
            (isModuleAllowed(
              tenant.modules,
              PermissionsConstants.ModulesReportNames.Treasury
            ) ||
              isModuleAllowed(
                tenant.modules,
                PermissionsConstants.ModulesReportNames.WorkingCapital
              )) && (
              <AddDataReport
                getProfileInfo={getProfileInfo}
                organizationId={organizationId}
                profileInfo={setProfileInfo}
                isPrincipalOwner={isPrincipalOwner}
              />
            )
          ) : (
            <div className="my-5 text-center">
              <Skeleton height={12} width={220} />
            </div>
          )}
        </>
      );
    } else if (activeTab === TABS.Notes) {
      return (
        <div className="px-4 py-2" onClick={() => setOpenNote(true)}>
          {isPermissionAllowed('notes', 'create') ? (
            <AddNote
              setOverlay={setOpenNote}
              contactId={contactId}
              organizationId={organizationId}
              getProfileInfo={() => {
                getProfileInfo();
                handleRefreshFeed();
              }}
              dealId={dealId}
              getDeal={getDeal}
              placeholder={notePlaceholder}
            />
          ) : (
            <div className="my-5 text-center">
              <h2>Can&apos;t Access</h2>
            </div>
          )}
          <Steps
            organizationId={organizationId}
            getProfileInfo={getProfileInfo}
            openActivityId={activityIdOpen}
            organization={organization}
            dataType={dataType}
            contactInfo={contactInfo}
            allNotes={allNotes}
            setRefreshRecentFiles={setRefreshRecentFiles}
            me={me}
            filteredBy={{ type: ['note'] }}
            layout="new"
            layoutType="note"
            isDeal={isDeal}
            deal={deal}
            dealId={deal?.id}
            isContact={isContact}
            contactId={contactId}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        </div>
      );
    } else if (activeTab === TABS.Activities) {
      return (
        <div className="p-0">
          {isPermissionAllowed('activities', 'create') ? (
            <AddActivityButtonsGroup
              moduleMap={moduleMap}
              componentId="new-activity"
              contactId={contactId}
              dataType={dataType}
              organizationId={organizationId}
              dealId={dealId}
              profileRefresh={() => {
                getProfileInfo();
                handleRefreshFeed();
              }}
              contactIs={contactIs}
              contactInfo={contactInfo}
              profileInfo={setProfileInfo}
              deal={deal}
              organization={organization}
              activityIdOpen={activityIdOpen}
              me={me}
              isDeal={isDeal}
              setRefreshRecentFiles={setRefreshRecentFiles}
              isContact={isContact}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          ) : (
            <div className="my-5 text-center">
              <h2>Can&apos;t Access</h2>
            </div>
          )}
        </div>
      );
    } else if (activeTab === TABS.Files) {
      return (
        <>
          <AddFile
            contactId={contactId}
            organizationId={organizationId}
            getProfileInfo={getProfileInfo}
            dealId={dealId}
            getDeal={getDeal}
            refreshRecentFiles={refreshRecentFiles}
            setRefreshRecentFiles={setRefreshRecentFiles}
            me={me}
            noFilesMessage={
              <NoDataFound
                icon="note_stack"
                iconSymbol={true}
                title={
                  <div className="font-normal font-size-sm2 text-gray-search">
                    {`This record doesn’t have any files.`}
                  </div>
                }
                containerStyle="text-gray-search py-6"
              />
            }
            fromOrganization={fromOrganization}
          />
        </>
      );
    } else if (activeTab === TABS.Products) {
      return <DealProductsV2 deal={deal} mode={1} getDeal={getDeal} />;
    } else if (activeTab === TABS.Timeline) {
      return (
        // hehehe :P passing id like that
        <ActivityTimeline
          id={
            dataType === 'deal'
              ? dealId
              : dataType === 'contact'
              ? contactId
              : organizationId
          }
          type={dataType}
          closeSidePanel={null}
        />
      );
    } else {
      return <span>Invalid tab</span>;
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header px-0 pt-0 border-bottom-0">
          <div className="border-bottom w-100">
            <AnimatedTabs
              tabClasses={'link-active-wrapper w-100 nav-sm-down-break'}
              tabsData={tabs}
              activeTab={activeTab}
              toggle={(tab) => setActiveTab(tab.tabId)}
            />
          </div>
        </div>
        <div className="p-0">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AddContent;
