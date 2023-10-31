import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import contactService from '../../../services/contact.service';
import Pagination from '../../Pagination';
import ContactOwnerList from './ContactOwnerList';

const ViewAllOwners = ({
  openAllOwners,
  setOpenAllOwners,
  count,
  mainOwner,
  onRemove,
  id,
}) => {
  const [owners, setOwners] = useState([]);
  const [newContactOwners, setNewContactOwners] = useState([]);
  const [excludeOwner, setExcludeOwner] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: Math.ceil(count / 5),
    limit: 5,
  });

  useEffect(() => {
    setPagination({
      page: 1,
      totalPages: Math.ceil(count / 5),
      limit: 5,
    });
  }, [count]);

  useEffect(() => {
    (async () => {
      const resp = await contactService
        .getOwners(id, pagination)
        .catch((err) => console.log(err));

      const { data } = resp || {};

      setOwners(data);
    })();
  }, [pagination]);

  useEffect(() => {
    if (pagination.totalPages > 1) {
      if (pagination.page === 1) {
        setExcludeOwner(owners[4]);
        const newContactOwners = owners?.slice(0, 4);

        const newContactList = [
          { user_id: mainOwner?.id, user: mainOwner },
          ...newContactOwners,
        ];

        return setNewContactOwners(newContactList);
      }

      if (pagination.page === pagination.totalPages) {
        const newContactList = [excludeOwner, ...owners];
        return setNewContactOwners(newContactList);
      }
    }

    return setNewContactOwners(owners);
  }, [owners]);

  const changePage = (newPage) => {
    if (newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <>
      <Modal isOpen={openAllOwners} fade={false}>
        <ModalHeader
          tag="h3"
          toggle={() => setOpenAllOwners(false)}
          className="p-3"
        >
          Assigned Owners
        </ModalHeader>
        <ModalBody className="border-top mb-0 p-3">
          <div className="list-group list-group-lg list-group-flush list-group-no-gutters">
            {newContactOwners.length === 0 && <div>No Owners yet</div>}
            {newContactOwners.map((item) => (
              <ContactOwnerList
                key={`${item.user_id}${
                  item.organization_id ? `-${item.organization_id}` : ''
                }`}
                item={item}
                handleRemove={() => onRemove(item)}
              />
            ))}
          </div>
        </ModalBody>
        {newContactOwners?.length > 10 && (
          <ModalFooter className="px-3">
            <Pagination paginationInfo={pagination} onPageChange={changePage} />
          </ModalFooter>
        )}
      </Modal>
    </>
  );
};

export default ViewAllOwners;
