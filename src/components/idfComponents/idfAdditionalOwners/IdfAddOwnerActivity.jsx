import { useState, useEffect } from 'react';
import SimpleModal from '../../modal/SimpleModal';
import { FormGroup, Label } from 'reactstrap';

import userService from '../../../services/user.service';
import AutoComplete from '../../AutoComplete';
import activityService from '../../../services/activity.service';

const AddUserDropdown = ({
  id,
  name,
  label,
  onChange,
  serviceId,
  value,
  noDefault,
  ownerData,
  title,
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

  const getAllUsers = async () => {
    const { data } = await userService
      .getUsers(
        { search: searchUser.search, status: 'active' },
        {
          page: 1,
          limit: 100,
        }
      )
      .catch((err) => err);
    const filterdData = data?.users.filter(
      (item) => !ownerData.some((owner) => owner.id === item.id)
    );
    setUsersData(filterdData);
  };
  useEffect(() => {
    if (searchUser.search) {
      getAllUsers();
    }
  }, [searchUser.search]);

  const getCurrentUser = async () => {
    const user = await userService
      .getUserInfo()
      .catch((err) => console.error(err));

    return { ...user, name: `${user.first_name} ${user.last_name}` };
  };

  const fieldInFields = (item) => {
    onChange({
      target: item,
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
const AddOwnerActivity = ({
  children,
  openModal,
  serviceId,
  setOpenModal,
  setRefresh,
  ownerData,
  setUsersData,
  setOwnerData,
}) => {
  const [formData, dispatch] = useState({});
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleObjectSave = async () => {
    const arr = [...ownerData];
    arr.push(formData);
    setOwnerData(arr);

    if (serviceId) {
      await activityService.addOwnerActivity(serviceId, [
        {
          userId: formData?.id,
        },
      ]);
      handleCloseModal();
      setRefresh((prevState) => prevState + 1);
    } else {
      setUsersData(arr);
    }
    handleCloseModal();
  };
  const onChange = (e) => {
    dispatch(e.target);
  };
  return (
    <>
      {children}

      <SimpleModal
        onHandleCloseModal={handleCloseModal}
        toggle={handleCloseModal}
        open={openModal}
        modalTitle="Add Owner"
        buttonLabel="Add Owner"
        buttonsDisabled={!formData?.id}
        handleSubmit={handleObjectSave}
        onClick={() => document.dispatchEvent(new MouseEvent('click'))}
      >
        <AddUserDropdown
          id="assigned_user_id"
          name="assigned_user_id"
          onChange={onChange}
          dispatch={dispatch}
          ownerData={ownerData}
          showAvatar
          noDefault
        />
      </SimpleModal>
    </>
  );
};

export default AddOwnerActivity;
