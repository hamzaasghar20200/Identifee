import React, { useState, useEffect } from 'react';
import './style.css';
import './responsive.css';
import ClientDashboardLayout from '../../layouts/ClientDashboardLayout';
import AddNote from '../../components/peopleProfile/contentFeed/AddNote';
import Steps from '../../components/steps/Steps';
import { usePagesContext } from '../../contexts/pagesContext';
import {
  getClientPortalToken,
  getClientPortalOrganization,
} from '../../layouts/constants';
import feedService from '../../services/feed.service';

const Conversations = () => {
  const [sharedById, setSharedById] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const { pageContext } = usePagesContext();
  const [allNotes, setAllNotes] = useState();
  const [refresh, setRefresh] = useState(0);
  const [chatBox, setChatBox] = useState({ type: '' });

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

  useEffect(() => {
    const clientPortalToken = getClientPortalToken();
    setSharedById(clientPortalToken?.shared_by_id);
    setOrganizationId(clientPortalToken?.resource_access?.organization[0]?.id);
  }, [pageContext]);

  const showChatBox = (value) => {
    setChatBox(value);
  };

  return (
    <ClientDashboardLayout>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Conversations</h1>
      </div>
      <div className="conversation-wrapper px-3 position-relative">
        {chatBox.type === 'NEW' && (
          <div className="comment-box">
            <AddNote
              assigned_user_id={sharedById}
              organizationId={organizationId}
              getProfileInfo={() => {
                handleRefreshFeed();
              }}
              getNotes={getNotes}
              fromClientPortal={true}
            />
          </div>
        )}

        <Steps
          organizationId={
            getClientPortalToken().resource_access?.organization[0]?.id
          }
          contactId={getClientPortalToken().contact_id}
          organization={getClientPortalOrganization()}
          filteredBy={{ type: ['note'] }}
          layout="new"
          layoutType="note"
          dataType="organization"
          allNotes={allNotes}
          refresh={refresh}
          setRefresh={setRefresh}
          fromClientPortal={true}
          sharedById={sharedById}
          showChatBox={showChatBox}
          chatBox={chatBox}
        />
      </div>
    </ClientDashboardLayout>
  );
};

export default Conversations;
