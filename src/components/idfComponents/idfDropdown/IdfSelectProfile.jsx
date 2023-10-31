import { useEffect, useState } from 'react';
import { FormGroup, Label } from 'reactstrap';

import roleService from '../../../services/role.service';
import { ALL_LABEL } from '../../../utils/constants';
import AutoComplete from '../../AutoComplete';

const IdfSelectProfile = ({
  label,
  defaultValue,
  value,
  onChange,
  showAll,
  query,
  disabled,
  clearState,
  fieldState = {},
  validationConfig = {},
  ...restProps
}) => {
  const [roleData, setRoleData] = useState([]);
  const [charactersRequire, setCharactersRequire] = useState('');
  const [selectedItem, setSelectedItem] = useState();
  const [searchRole, setSearchRole] = useState({
    search: '',
  });

  useEffect(() => {
    getRoles();
  }, []);
  useEffect(() => {
    setSelectedItem(value);
  }, [value]);
  const getRoles = async () => {
    const searchResults = await roleService
      .GetRoles(query)
      .catch((err) => console.log(err));

    const { data } = searchResults || {};

    showAll && data?.unshift({ name: ALL_LABEL });

    setRoleData(data);
  };
  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'status',
        value: item,
      },
    });
    setSelectedItem(item);
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
      <AutoComplete
        placeholder="Search for Profile"
        data={roleData}
        customKey="name"
        clearState={(e) => clearState(e)}
        extraTitles={roleData}
        id={label || 'ddFromNavbar'}
        charactersRequire={charactersRequire}
        validationConfig={validationConfig}
        fieldState={fieldState}
        onHandleSelect={(item) => fieldInFields(item)}
        selected={selectedItem ? selectedItem?.name : ''}
        onChange={stateChange}
        showIcon
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectProfile;
