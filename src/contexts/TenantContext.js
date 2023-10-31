import React, { createContext, useContext, useEffect, useState } from 'react';

export const TenantContext = createContext({
  tenant: {},
  setTenant: () => null,
});

export const TenantProvider = (props) => {
  const [tenant, setTenant] = useState({ id: 'root' }); // TODO: Change with the real default state value

  useEffect(() => {
    // as useLocation() hook doesnt work in context so using vanilla JS
    const baseUrl = `${process.env.REACT_APP_API_URL}/api/env`;
    const params = new URLSearchParams(location.search);
    const tenantId = params.get('tenant_id');
    const newUrl = new URL(baseUrl);
    // avoiding send params if we dont find tenant_id or tenant_id=null kind of strings
    if (tenantId) {
      newUrl.searchParams.append('tenantId', tenantId);
    }
    fetch(newUrl, {
      headers: new Headers({
        host: window.location.hostname,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTenant(data);
      });
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {props.children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = () => {
  return useContext(TenantContext);
};
