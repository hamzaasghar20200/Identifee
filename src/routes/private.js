import { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';

import AuthService from '../services/auth.service';
import Layout from '../components/layout';
import userService from '../services/user.service';
import useCheckTokenValidity from '../hooks/useCheckTokenValidity';
import useSessionExpiryModal from '../components/modal/SessionExpiryModal';

const routerRedirect = {
  '/settings/resources/lesson': '/settings/resources',
  '/settings/resources/courses': '/settings/resources',
  '/settings/users/roles': '/settings/users',
  '/settings/users/groups': '/settings/users',
  '/contacts/:id/profile': '/contacts',
  '/contacts/organizations': '/contacts',
  '/contacts/:id/organization/profile': '/contacts',
  '/contacts/:organizationId/organization/profile/activity/:activityId':
    '/contacts',
};

const PrivateRoute = ({
  requireAdminAccess,
  isSplitView,
  component: Component,
  ...rest
}) => {
  const [adminAccess, setAdminAccess] = useState(undefined);
  const { SessionExpiryModal, setShowModal } = useSessionExpiryModal();

  useEffect(() => {
    userService
      .getUserInfo()
      .then((result) =>
        setAdminAccess(
          result?.role?.admin_access || result?.role?.owner_access || false
        )
      );
  }, []);

  useCheckTokenValidity(setShowModal);

  const privateRenderer = (props) => {
    const pathname = window.location.pathname;
    let privateRender = <Redirect to={`/login?redirect_uri=${pathname}`} />;

    if (AuthService.isTokenValid()) {
      if (!requireAdminAccess || (requireAdminAccess && adminAccess === true)) {
        const { location } = props;

        // eslint-disable-next-line no-prototype-builtins
        const hasRouteRedirect = routerRedirect.hasOwnProperty(
          location.pathname
        );

        if (hasRouteRedirect) {
          return <Redirect to={routerRedirect[location.pathname]} />;
        }

        privateRender = (
          <Layout isSplitView={isSplitView}>
            <SessionExpiryModal />
            <Component {...props} {...rest} />
          </Layout>
        );
      } else if (adminAccess === false) {
        privateRender = <Redirect to="/" />;
      } else {
        privateRender = null;
      }
    }

    return privateRender;
  };

  return <Route {...rest} render={privateRenderer} />;
};

export default PrivateRoute;
