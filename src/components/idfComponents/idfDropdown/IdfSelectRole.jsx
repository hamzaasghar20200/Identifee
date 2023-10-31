import { useEffect, useState } from 'react';
import { FormGroup, Label } from 'reactstrap';

import roleService from '../../../services/role.service';
import { ALL_LABEL } from '../../../utils/constants';
import IdfDropdownSearch from './IdfDropdownSearch';

const IdfSelectRole = ({
  label,
  defaultValue,
  value,
  onChange,
  showAll,
  query,
  disabled,
  fieldState = {},
  validationConfig = {},
  ...restProps
}) => {
  const [roleData, setRoleData] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchRole, setSearchRole] = useState({
    search: '',
  });

  useEffect(() => {
    getRoles();
  }, []);

  const getRoles = async () => {
    const searchResults = await roleService
      .GetRoles(query)
      .catch((err) => console.log(err));

    const { data } = searchResults || {};

    showAll && data?.unshift({ name: ALL_LABEL });

    setRoleData(data);
  };

  const filteredData = roleData.filter((role) =>
    role.name.toLowerCase().includes(searchRole?.search?.toLowerCase())
  );
  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'status',
        value: item,
      },
    });
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchRole({
        ...searchRole,
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
        disabled={disabled}
        title={defaultValue || 'Search for Profile'}
        data={filteredData}
        customTitle="name"
        charactersRequire={charactersRequire}
        onHandleSelect={(_, item) => fieldInFields(item)}
        value={value?.search || ''}
        onChange={stateChange}
        fieldState={fieldState}
        validationConfig={validationConfig}
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectRole;
