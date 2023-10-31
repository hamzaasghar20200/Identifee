import React, { useEffect, useState } from 'react';

import FullScreenSpinner from '../components/FullScreeenSpinner';
import { useTenantContext } from '../contexts/TenantContext';
import BrandLogoIcon from '../components/sidebar/BrandLogoIcon';
import useTenantTheme from '../hooks/useTenantTheme';

export const PublicLayout = ({ children, title }) => {
  const [mounted, setMounted] = useState(false);
  const [isCommonLogin, setIsCommonLogin] = useState(false);

  const { tenant } = useTenantContext();

  useTenantTheme();

  useEffect(() => {
    tenant?.id && !mounted && setMounted(true);
  }, [tenant]);

  useEffect(() => {
    const host = window.location.host.split('.');
    const isLogin = host[0] === 'login' && host.length === 3;
    setIsCommonLogin(isLogin);
  }, []);

  if (mounted || isCommonLogin) {
    return (
      <main id="content" role="main" className="main">
        <div className="container py-8 py-sm-7">
          <div className="d-flex justify-content-center mt-5 mb-5">
            {isCommonLogin ? (
              <div className="text-center">
                <img
                  className="z-index-2 size-logo-login"
                  src={'/img/logo.svg'}
                  alt={`Identifee Logo`}
                />
              </div>
            ) : (
              <BrandLogoIcon tenant={tenant} />
            )}
          </div>
          {children}
        </div>
      </main>
    );
  } else return <FullScreenSpinner />;
};
