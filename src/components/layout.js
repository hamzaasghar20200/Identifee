import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Header from '../components/header';
import Sidebar from './sidebar/Sidebar';
import { getTitleBreadcrumb } from '../utils/Breadcrumb';
import { useTenantContext } from '../contexts/TenantContext';
import FullScreenSpinner from './FullScreeenSpinner';
import useTenantTheme from '../hooks/useTenantTheme';
import { useProfileContext } from '../contexts/profileContext';
import { isDisplayWelcomeScreen } from '../utils/Utils';

const Layout = ({ children, isSplitView }) => {
  const [mounted, setMounted] = useState(false);
  const [padding, setPadding] = useState('');
  const location = useLocation();
  const { profileInfo } = useProfileContext();
  const { tenant } = useTenantContext();
  const isWelcomeScreen =
    location?.pathname?.includes('welcome') ||
    isDisplayWelcomeScreen(tenant?.modules);

  useTenantTheme();

  useEffect(() => {
    tenant?.id && !mounted && setMounted(true);
  }, [tenant]);
  useEffect(() => {
    if (
      (location.pathname === '/' &&
        profileInfo?.role?.owner_access &&
        tenant?.modules === '*') ||
      (location.pathname === '/' && tenant?.modules.includes('Dashboards'))
    ) {
      setPadding('p-0');
    } else {
      setPadding('');
    }
  }, [location, profileInfo, tenant]);
  if (mounted) {
    return (
      <>
        <Helmet>
          <title>{getTitleBreadcrumb(location.pathname)}</title>
        </Helmet>
        <div className="has-navbar-vertical-aside navbar-vertical-aside-show-xl footer-offset">
          {!isWelcomeScreen ? (
            <>
              <Header />
              <Sidebar />
            </>
          ) : null}
          {isSplitView ? (
            <main
              id="content"
              role="main"
              className="main splitted-content-main"
            >
              {children}
            </main>
          ) : (
            <main className={`main ${isWelcomeScreen ? 'p-0' : ''}`}>
              <div className={`content container-fluid ${padding}`}>
                {children}
              </div>
            </main>
          )}
          {/* <Footer /> */}
        </div>
      </>
    );
  } else {
    return <FullScreenSpinner />;
  }
};

export default Layout;
