import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import IdfDropdownSearchWithCheckbox from './IdfDropdownSearchWithCheckbox';
import { onGetOwners } from '../../../views/Deals/contacts/utils';

const IdfSelectUserWithCheckbox = ({
  label,
  onChange,
  value,
  noDefault,
  className,
  ...restProps
}) => {
  const { checkedList } = restProps;
  const [charactersRequire, setCharactersRequire] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchUser, setSearchUser] = useState({
    search: '',
  });

  useEffect(() => {
    const extraData = checkedList?.map((owner) => owner.id);

    onGetOwners(searchUser, setUsersData, null, extraData);
  }, [searchUser.search, checkedList]);

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'assigned_user_id',
        value: item.id,
      },
    });

    setSelectedUser(`${item.first_name} ${item.last_name}`);

    setSearchUser({
      ...searchUser,
      search: '',
    });
  };

  const stateChange = (e) => {
    const match = e.target.value.match(/([A-Za-z])/g);
    if (match && match.length >= 2) {
      setCharactersRequire('');
      setSearchUser({
        ...searchUser,
        search: e.target.value,
      });
    } else {
      return setCharactersRequire(match?.length);
    }
  };

  return (
    <FormGroup className={className}>
      {label && <Label>{label}</Label>}
      <IdfDropdownSearchWithCheckbox
        title="Search for owner"
        data={usersData}
        onHandleSelect={(_, item) => fieldInFields(item)}
        value={selectedUser}
        charactersRequire={charactersRequire}
        onChange={stateChange}
        searchItem={searchUser}
        icon="people"
        togglePlaceholder="Select Users"
        internalPlacehoder="Search Users"
        {...restProps}
      />
    </FormGroup>
  );
};

export default IdfSelectUserWithCheckbox;
