import qs from 'qs';
import React, { useEffect, useState } from 'react';
import authService from '../../services/auth.service';
import organizationService from '../../services/organization.service';
import useTenantTheme from '../../hooks/useTenantTheme';
import Loading from '../../components/Loading';

const withOrganizationData = (WrappedComponent) => {
  return function WithOrganizationData(props) {
    const [organization, setOrganization] = useState({});
    const [contactId, setContactId] = useState('');
    const [organizationId, setOrganizationId] = useState('');
    const [owner, setOwner] = useState({});

    useEffect(() => {
      (async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const hasUrlToken = urlParams.get('token');
        let contact_id = null;
        let shared_by = null;
        let resource_access = null;

        if (hasUrlToken) {
          const query = qs.parse(location.search, { ignoreQueryPrefix: true });
          const token = {
            access_token: query.token,
          };

          try {
            const tokenPayload = await authService.introspect(
              token.access_token
            );
            contact_id = tokenPayload.contact_id;
            shared_by = tokenPayload.shared_by;
            resource_access = tokenPayload.resource_access.organization[0].id;
            sessionStorage.setItem(
              'tokenPayload',
              JSON.stringify(tokenPayload)
            );
          } catch (error) {
            console.error('Error introspecting token:', error);
          }
        } else {
          const organizationObj = sessionStorage.getItem('organizationObj');
          const tokenPayloadObj = sessionStorage.getItem('tokenPayload');

          if (organizationObj) {
            try {
              const orgObj = JSON.parse(organizationObj);
              setOrganization(orgObj);
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }

          if (tokenPayloadObj) {
            try {
              const plObj = JSON.parse(tokenPayloadObj);
              resource_access = plObj.resource_access.organization[0].id;
              shared_by = plObj.shared_by;
              contact_id = plObj.contact_id;
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

    const getOrganization = async () => {
      try {
        const organizationObj = await organizationService.getOrganizationById(
          organizationId
        );
        setOrganization(organizationObj);
        sessionStorage.setItem(
          'organizationObj',
          JSON.stringify(organizationObj)
        );
      } catch (e) {
        console.log(e);
      }
    };

    useEffect(() => {
      if (organizationId) {
        getOrganization();
      }
    }, [organizationId]);

    useTenantTheme();

    if (!contactId || !organizationId) {
      return <Loading />;
    }

    return (
      <WrappedComponent
        organization={organization}
        contactId={contactId}
        organizationId={organizationId}
        owner={owner}
        {...props}
      />
    );
  };
};

export default withOrganizationData;
