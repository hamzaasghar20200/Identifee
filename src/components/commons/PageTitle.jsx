import { pageTitleBeautify } from '../../utils/Utils';
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import { TenantContext } from '../../contexts/TenantContext';

const PageTitle = ({ page, pageModule, customName }) => {
  const { tenant } = useContext(TenantContext);
  const [pageTitles, setPageTitles] = useState([pageModule || '']);

  useEffect(() => {
    if (tenant?.name) {
      setPageTitles([page, pageModule || '', customName || tenant.name]);
    }
  }, [page, tenant]);

  return (
    <Helmet>
      <title>{pageTitleBeautify(pageTitles.filter((m) => !!m))}</title>
    </Helmet>
  );
};

export default PageTitle;
