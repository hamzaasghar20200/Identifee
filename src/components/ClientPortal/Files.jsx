import React from 'react';
import './style.css';
import './responsive.css';
import AddFile from './addfile/AddFile';
import ClientDashboardLayout from '../../layouts/ClientDashboardLayout';
import { getClientPortalToken } from '../../layouts/constants';

const Files = () => {
  return (
    <ClientDashboardLayout>
      <div className="page-title pt-3 p-3 d-flex justify-content-between align-items-center">
        <h1 className="mb-0">Files</h1>
      </div>
      <AddFile
        contactId={getClientPortalToken()?.contact_id}
        organizationId={
          getClientPortalToken()?.resource_access?.organization[0]?.id
        }
        publicPage={true}
      />
    </ClientDashboardLayout>
  );
};

export default Files;
