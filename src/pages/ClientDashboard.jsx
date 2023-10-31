import qs from 'qs';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Home from '../components/ClientPortal/Home';
import authService from '../services/auth.service';
import Loading from '../components/Loading';
import organizationService from '../services/organization.service';
import envService from '../services/env.service';
import useTenantTheme from '../hooks/useTenantTheme';
import ClientDashboardLayout from '../layouts/ClientDashboardLayout';
import { usePagesContext } from '../contexts/pagesContext';
import {
  getClientPortalOrganization,
  getClientPortalToken,
} from '../layouts/constants';

import { useTenantContext } from '../contexts/TenantContext';

const ClientDashboard = () => {
  const history = useHistory();
  const [, setLoader] = useState(false);
  const [organization, setOrganization] = useState({});
  const [contactId, setContactId] = useState('');
  const { pageContext, setPageContext } = usePagesContext();
  const [, setOwner] = useState({});
  const [organizationId, setOrganizationId] = useState('');
  const { setTenant } = useTenantContext();

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUrlToken = urlParams.get('token');
      let contact_id = null;
      let shared_by = null;
      let resource_access = null;
      if (hasUrlToken) {
        setLoader(true);
        try {
          const query = qs.parse(location.search, { ignoreQueryPrefix: true });
          const hasQueryKeys = Object.keys(query).length > 0;

          // no query keys, redirect to login
          if (!hasQueryKeys || !query.token) {
            history.push('/clientportal/login');
          }

          const token = {
            access_token: query.token,
          };
          const tokenPayload = await authService.introspect(token.access_token);

          sessionStorage.setItem('idftoken-public', JSON.stringify(token));

          const data = await envService.getEnv();
          setTenant(data);

          contact_id = tokenPayload.contact_id;
          shared_by = tokenPayload.shared_by;
          resource_access = tokenPayload.resource_access.organization[0].id;
          sessionStorage.setItem('tokenPayload', JSON.stringify(tokenPayload));

          const organizationObj = await organizationService.getOrganizationById(
            resource_access
          );
          setOrganization(organizationObj);
          sessionStorage.setItem(
            'organizationObj',
            JSON.stringify(organizationObj)
          );

          setPageContext({ ...pageContext, ClientPortalData: true });
          setLoader(false);
        } catch (error) {
          history.push('/clientportal/login');
        }
      } else {
        const clientPortalOrganization = getClientPortalOrganization();
        const clientPortalToken = getClientPortalToken();

        if (clientPortalOrganization) {
          try {
            setOrganization(clientPortalOrganization);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }

        if (clientPortalToken) {
          try {
            resource_access =
              clientPortalToken?.resource_access?.organization[0]?.id;
            shared_by = clientPortalToken?.shared_by;
            contact_id = clientPortalToken?.contact_id;
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }

      setContactId(contact_id);
      setOwner(shared_by);
      setOrganizationId(resource_access);
    })();
  }, []);

  useTenantTheme();

  if (!contactId || !organizationId) {
    return <Loading />;
  }

  return (
    <ClientDashboardLayout>
      <Home
        contactId={contactId}
        organization={organization}
        organizationId={organizationId}
      />
    </ClientDashboardLayout>
  );
};

export default ClientDashboard;
