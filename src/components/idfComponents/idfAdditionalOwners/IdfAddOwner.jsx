import { useReducer } from 'react';
import { find } from 'lodash';

import { onInputChange, reducer } from '../../../views/Deals/contacts/utils';
import SimpleModal from '../../modal/SimpleModal';
import IdfSelectUser from '../idfDropdown/IdfSelectUser';
import userService from '../../../services/user.service';
import { CANT_ADD_ADDITIONAL_OWNER } from '../../../utils/constants';
import { errorsRedirectHandler } from '../../../utils/Utils';

const IdfAddOwner = ({
  children,
  openModal,
  setOpenModal,
  mainOwner,
  setSuccessMessage,
  setErrorMessage,
  service,
  serviceId,
  ownerData,
  onGetOwners,
  activity,
  ownerOption,
  setOwnerData,
  refreshOwners,
  setRefresOwners,
  prevalue,
  owners,
  onSetPreOwners,
  onAdded,
}) => {
  const [formData, dispatch] = useReducer(reducer, {});

  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleObjectSave = async () => {
    const ownerSelected = await userService.getUserById(
      formData?.assigned_user_id
    );
    // onAdded(ownerSelected);
    const arr = [...ownerData];
    arr.push(ownerSelected);
    setOwnerData(arr);
    handleCloseModal();
  };
  const handleSubmit = async () => {
    if (prevalue) {
      const ownerAdded = find(owners, { user_id: formData?.assigned_user_id });

      if (ownerAdded)
        return setErrorMessage(
          `${ownerAdded?.user?.first_name} ${ownerAdded?.user?.last_name} is already added as principal owner`
        );

      const ownerSelected = await userService
        .getUserById(formData?.assigned_user_id)
        .catch((err) => console.log(err));

      const newOwners = owners;

      newOwners.push({
        user_id: ownerSelected.id,
        organization_id: '',
        user: ownerSelected,
      });

      onSetPreOwners(newOwners);

      handleCloseModal();
    }

    if (!prevalue) {
      if (formData?.assigned_user_id === mainOwner?.id)
        return setErrorMessage(
          `${mainOwner.first_name} ${mainOwner.last_name} is already added as principal owner`
        );

      const resp = await service
        .getOwners(serviceId, { page: 1, limit: 1000 })
        .catch((err) => console.log(err));

      const { data } = resp || {};

      if (data) {
        const userAdded = find(data, { user_id: formData?.assigned_user_id });
        if (userAdded)
          return setErrorMessage(
            `${userAdded.user.first_name} ${userAdded.user.last_name} is already added as additional owner`
          );
      }
      const newOwner = await service
        .addOwner(serviceId, formData.assigned_user_id)
        .catch((err) => {
          setErrorMessage(CANT_ADD_ADDITIONAL_OWNER);
          errorsRedirectHandler(err);
        });
      if (newOwner?.data?.message)
        return setErrorMessage(newOwner?.data.message);

      if (newOwner?.user_id) {
        const ownerSelected = await userService.getUserById(newOwner?.user_id);
        handleCloseModal();
        // if we don't have this as prop then call old code
        if (!onAdded) {
          if (!refreshOwners && onGetOwners) {
            onGetOwners();
          }
          setRefresOwners && setRefresOwners(true);
        } else {
          // this is specifically for that when a new owner is selected then calling component will only get this to add in main array
          onAdded && onAdded(ownerSelected);
        }
        setSuccessMessage(
          `${ownerSelected?.first_name} ${ownerSelected?.last_name} added as additional owner`
        );
      }
    }
  };

  const onChange = (e) => {
    const match = e.target.value.match(/([^a-z0-9])/g);
    if (match && match?.length >= 2) {
      onInputChange(e, dispatch);
    } else {
      setErrorMessage('Atleast 2 Characters');
    }
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
        buttonsDisabled={!formData.assigned_user_id}
        handleSubmit={!activity ? handleSubmit : handleObjectSave}
        onClick={() => document.dispatchEvent(new MouseEvent('click'))}
      >
        <IdfSelectUser
          id="assigned_user_id"
          name="assigned_user_id"
          onChange={onChange}
          mainOwner={mainOwner}
          owners={owners}
          showAvatar
          noDefault
        />
      </SimpleModal>
    </>
  );
};

export default IdfAddOwner;
