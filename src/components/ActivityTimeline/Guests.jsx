import { capitalize } from '../../utils/Utils';
import React, { useEffect, useState } from 'react';
import userService from '../../services/user.service';
import Skeleton from 'react-loading-skeleton';
import { ACTIVITY_FEED_TYPES } from '../../utils/constants';
import IdfListAvatars from '../idfComponents/idfAdditionalOwners/IdfListAvatars';

const ListComma = ({ list }) => {
  const usersList = list.map((u) => {
    if (u.first_name && u.last_name) {
      return `${capitalize(u.first_name || '')} ${capitalize(
        u.last_name || ''
      )}`;
    }
    return u.email;
  });
  return <div className="font-weight-semi-bold">{usersList.join(', ')}</div>;
};

const Guests = ({ timeline, fromNavbar, listType = 'comma' }) => {
  const { item } = timeline;
  const { type } = item;
  const { guests } = item;
  const [loader, setLoader] = useState(false);
  const [contactList, setContactList] = useState([]);
  const getGuests = async () => {
    setLoader(true);
    try {
      const { data } = await userService.getGuestsByIds(
        guests.split(',').toString()
      );
      setContactList([...data.users, ...data.contacts]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (guests) {
      getGuests();
    }
  }, []);
  return (
    <>
      {loader ? (
        <p className="mb-0">
          <Skeleton height={5} width={180} />
        </p>
      ) : (
        <>
          {contactList?.length > 0 ? (
            <div
              className={`d-flex ${
                fromNavbar
                  ? 'align-items-start flex-column'
                  : 'align-items-center flex-row'
              }`}
            >
              <div>
                {' '}
                {type === ACTIVITY_FEED_TYPES.call
                  ? 'Call scheduled with '
                  : 'Event participants '}{' '}
              </div>
              <div className={`${fromNavbar ? 'ml-0' : 'ml-1'}`}>
                {listType === 'comma' ? (
                  <ListComma list={contactList}></ListComma>
                ) : (
                  <IdfListAvatars users={contactList} defaultSize={'xs'} />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </>
      )}
    </>
  );
};

export default Guests;
