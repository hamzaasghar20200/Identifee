import { useState, useEffect } from 'react';
import { FormGroup, Label } from 'reactstrap';

import { onGetOwners } from '../../../views/Deals/contacts/utils';
import userService from '../../../services/user.service';
import AutoComplete from '../../AutoComplete';

const IdfSelectUser = ({
  id,
  name,
  label,
  onChange,
  value,
  noDefault,
  title,
  mainOwner,
  owners,
  ...restProps
}) => {
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [charactersRequire, setCharactersRequire] = useState('');
  const [searchUser, setSearchUser] = useState({
    search: '',
  });

  useEffect(() => {
    (async () => {
      if (!noDefault) {
        const me = await getCurrentUser().catch((err) => console.log(err));

        onChange({
          target: {
            name: name || 'assigned_user_id',
            value: me?.id,
          },
        });
        setSelectedUser(`${me?.first_name} ${me?.last_name}`);
      }
    })();
  }, []);

  useEffect(() => {
    // onGetOwners is using user_id when mapping and filtering so passing it like that
    const existUsers = owners
      ? owners.map((owner) => ({ user_id: owner.user.id }))
      : [];
    const existingUsers = mainOwner
      ? [{ user_id: mainOwner.id }, ...existUsers]
      : null;
    onGetOwners(searchUser, setUsersData, existingUsers);
  }, [searchUser.search]);

  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return { ...user, name: `${user.first_name} ${user.last_name}` };
  };

  const fieldInFields = (item) => {
    onChange({
      target: {
        name: 'assigned_user_id',
        value: item.id,
      },
    });

    setSelectedUser(`${item.first_name} ${item.last_name}`);
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
    <FormGroup>
      {label && <Label>{label}</Label>}
      <AutoComplete
        id={id}
        placeholder={title || 'Search for owner'}
        name={name}
        showAvatar={true}
        loading={false}
        charactersRequire={charactersRequire}
        onChange={stateChange}
        data={usersData}
        showIcon={false}
        onHandleSelect={(item) => {
          fieldInFields(item);
        }}
        customKey="name"
        selected={selectedUser?.name || ''}
      />
    </FormGroup>
  );
};

export default IdfSelectUser;
