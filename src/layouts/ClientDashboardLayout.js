import React, { useEffect, useState } from 'react';
import PageTitle from '../components/commons/PageTitle';
import LeftSidebar from '../components/ClientPortal/LeftSidebar';
import MaterialIcon from '../components/commons/MaterialIcon';
import Button from 'react-bootstrap/Button';
import { Toaster } from 'react-hot-toast';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import { useTenantContext } from '../contexts/TenantContext';
import {
  getClientPortalOrganization,
  getClientPortalToken,
} from '../layouts/constants';
import { usePagesContext } from '../contexts/pagesContext';
import ModalActivityLogs from '../components/ClientPortal/modals/ModalActivityLogs';

const ClientDashboardLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [organization, setOrganization] = useState({});
  const [contactId, setContactId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [owner, setOwner] = useState({});
  const { tenant } = useTenantContext();
  const { pageContext } = usePagesContext();
  const [modalActivityLogs, setModalActivityLogs] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const showModalActivityLog = () => {
    setModalActivityLogs(true);
  };

  useEffect(() => {
    const clientPortalOrganization = getClientPortalOrganization();
    const clientPortalToken = getClientPortalToken();
    setOrganization(clientPortalOrganization);
    setOwner(clientPortalToken?.shared_by);
    setContactId(clientPortalToken?.contact_id);
    setOrganizationId(clientPortalToken?.resource_access?.organization[0]?.id);
  }, [pageContext]);

  const isConversationsPage =
    window.location.pathname.includes('conversations');

  return (
    <div
      className={`d-flex AppBackground overflow-x-hidden w-100 client-dashboard vh-100 ${
        showSidebar ? 'showsidebar' : ''
      }`}
    >
      <PageTitle page={organization?.name} pageModule="" />
      <Button variant="light" className="mobile-menu justify-content-between">
        <div className="logo">
          <BrandLogoIcon tenant={tenant} />
        </div>
        <ModalActivityLogs
          show={modalActivityLogs}
          onModalOpen={showModalActivityLog}
          onHide={() => setModalActivityLogs(false)}
        />
        <span onClick={toggleSidebar}>
          {showSidebar ? (
            <MaterialIcon icon="close" clazz="text-blue font-size-2xl" />
          ) : (
            <MaterialIcon icon="menu" clazz="font-size-2xl" />
          )}
        </span>
      </Button>
      <LeftSidebar
        contactId={contactId}
        organizationId={organizationId}
        owner={owner}
      />
      <div
        className={`client-main-content w-100 vh-100 ${
          isConversationsPage ? 'conversation-page' : ''
        }`}
      >
        <div className="bg-white p-3 border-bottom header-area">
          <div className="d-flex gap-1 align-items-center w-100">
            <MaterialIcon icon="corporate_fare" clazz="font-size-2xl" />
            <h3 className="mb-0"> {organization?.name}</h3>
            <ModalActivityLogs
              show={modalActivityLogs}
              onModalOpen={showModalActivityLog}
              onHide={() => setModalActivityLogs(false)}
            />
          </div>
        </div>
        <div className="content-body position-relative vh-100">{children}</div>
        <Toaster position="bottom-right" reverseOrder={true} />
      </div>
    </div>
  );
};

export default ClientDashboardLayout;
