import { useEffect, useState } from 'react';
import { FormGroup, Label } from 'reactstrap';

import tenantService from '../../../services/tenant.service';
import IdfDropdownSearch from './IdfDropdownSearch';

const IdfSelectTenant = ({
  label,
  value,
  onChange,
  fieldState,
  validationConfig,
  ...restProps
}) => {
  const [tenantData, setTenantData] = useState([]);
  const [searchTenant, setSearchTenant] = useState({
    search: '',
  });
  const [charactersRequire, setCharactersRequire] = useState('');
  useEffect(() => {
    getTenants();
  }, []);

  const getTenants = async () => {
    const result = await tenantService.getTenants(
      {},
      { page: 1, limit: 10 },
      true
    );
    setTenantData(result.data);
  };

  const filteredData = tenantData.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTenant?.search?.toLowerCase())
  );

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'tenant',
        value: item,
      },
    });
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchTenant({
        ...searchTenant,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };

  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      <IdfDropdownSearch
        title="Search for Tenant"
        data={filteredData}
        customTitle="name"
        fieldState={fieldState}
        charactersRequire={charactersRequire}
        defaultStyleClass={'dropdown-search-no-border'}
        validationConfig={validationConfig}
        onHandleSelect={(_, item) => fieldInFields(item)}
        value={value?.search || ''}
        onChange={stateChange}
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectTenant;
