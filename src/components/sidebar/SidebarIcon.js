import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import BrandLogoIcon from './BrandLogoIcon';
import { TenantContext } from '../../contexts/TenantContext';

function SidebarIcon() {
  const { tenant } = useContext(TenantContext);
  const history = useHistory();

  return (
    <div className="navbar-brand-wrapper justify-content-between">
      <a
        className="navbar-brand text-center cursor-pointer"
        onClick={() => history.push('/')}
        aria-label="Identifee"
      >
        <BrandLogoIcon tenant={tenant} />
      </a>
    </div>
  );
}

export default SidebarIcon;
