import { HelmetProvider } from 'react-helmet-async';
import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import axios from 'axios';
import moment from 'moment-timezone';

import { AppRouter } from './router';
import { AppProvider, useAppContext } from './contexts/appContext';
import { CategoriesProvider } from './contexts/categoriesContext';
import authService from './services/auth.service';
import { BeaconProvider } from './contexts/BeaconContext';
import { ToggleMenuProvider } from './contexts/toogleMenuContext';
import { ViewportProvider } from './contexts/viewportContext';
import { ProfileProvider } from './contexts/profileContext';
import { AdaProvider } from './contexts/AdaContext';
import { TabsProvider } from './contexts/tabsContext';
import { LearningPathProvider } from './contexts/LearningPathContext';
import { PermissionsProvider } from './contexts/permissionContext';
import { AlertMessageProvider } from './contexts/AlertMessageContext';
import { TenantProvider } from './contexts/TenantContext';
import { ModuleProvider } from './contexts/moduleContext';
import { FilterProspectProvider } from './contexts/filterProspectContext';
import { PipelineBoardProvider } from './contexts/PipelineBoardContext';
import { newPermissionsProvider } from './contexts/newPermissionContext';
import { PagesContextProvider } from './contexts/pagesContext';
import { getIdfToken } from './utils/Utils';
// styles
import './theme.css';
import './css/style.min.css';
import './App.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// redux
import { Provider } from 'react-redux';
import { store } from './redux';

const ReactGAKey = process.env.REACT_GAKEY || 'your_reactgakey';

const composeProviders =
  (...providers) =>
  ({ children }) => {
    return providers.reduceRight(
      (child, Provider) => <Provider>{child}</Provider>,
      children
    );
  };

const Providers = composeProviders(
  HelmetProvider,
  TenantProvider,
  AppProvider,
  BeaconProvider,
  AdaProvider,
  CategoriesProvider,
  ProfileProvider,
  newPermissionsProvider,
  ToggleMenuProvider,
  ViewportProvider,
  TabsProvider,
  LearningPathProvider,
  PermissionsProvider,
  AlertMessageProvider,
  FilterProspectProvider,
  PipelineBoardProvider,
  PagesContextProvider,
  ModuleProvider
);

const App = () => {
  const { userHasAuthenticated } = useAppContext();
  ReactGA.initialize(ReactGAKey, {
    debug: false,
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });

  useEffect(() => {
    authService.bindAutoLogout(logout);
  }, []);

  const logout = () => {
    authService.logout();
    userHasAuthenticated(false);
    document.location.href = '/login';
  };

  const skipPaths = [
    '/api/auth/login',
    '/api/auth/password/reset',
    '/api/auth/invite/accept',
    '/api/auth/token/introspect',
  ];

  // Axios interceptors to request
  axios.interceptors.request.use(
    (request) => {
      if (skipPaths.some((s) => request.url.includes(s))) {
        return request;
      }

      const idfToken = getIdfToken();
      if (idfToken) {
        const creds = JSON.parse(idfToken);
        const expirationTime = new Date(creds.expires);
        const diff = moment(expirationTime).diff(moment()) - 5; // get difference 5 milliseconds before
        if (diff <= 0) {
          // TODO: Define if is necessary a message with the details of the logout flow after session expires
          logout();
        }
      }

      return request;
    },
    (err) => err
  );

  // Axios interceptors to response
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (skipPaths.some((s) => err.response.config.url.includes(s))) {
        throw err;
      }
      if (err.response.status === 401) {
        // TODO: Define if is necessary a message with the details of the logout flow after session expires
        logout();
      }
      throw err;
    }
  );

  useEffect(() => {
    const onLoad = async () => {
      try {
        userHasAuthenticated(authService.isTokenValid());
      } catch (e) {
        if (e !== 'No current user') {
          alert(e);
        }
      }
    };

    onLoad();
  }, [userHasAuthenticated]);

  return (
    <Provider store={store}>
      <Providers>
        <AppRouter />
      </Providers>
    </Provider>
  );
};

export default App;
