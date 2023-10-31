import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import IdfListAvatars from '../idfComponents/idfAdditionalOwners/IdfListAvatars';

const ListComma = ({ list = [] }) => {
  return (
    <>
      {list?.map((item, i) => (
        <span
          key={`owner${i}`}
          className="text-block font-weight-medium text-capitalize"
        >
          <span className="mx-1">&bull;</span>
          <span>{`${item?.first_name || ''} `}</span>
          <span>{item?.last_name || ''}</span>
        </span>
      ))}
    </>
  );
};

const Owners = ({ timeline, fromNavbar, listType = 'comma' }) => {
  const { item } = timeline;
  const { type } = item;
  const { owners } = item;
  const [loader, setLoader] = useState(false);
  const [contactList, setContactList] = useState([]);
  const getGuests = async () => {
    setLoader(true);
    const ownersData = owners?.filter((child) => {
      return item?.created_by !== child?.id;
    });
    setContactList(ownersData);
    setLoader(false);
  };

  useEffect(() => {
    if (owners) {
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
              <div className="text-capitalize">{`${type} Owners`}</div>
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

export default Owners;
